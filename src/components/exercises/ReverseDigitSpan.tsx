import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, Delete } from 'lucide-react';

interface ReverseDigitSpanProps {
  levelNumber?: number; // 1 - 10
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

export const ReverseDigitSpan: React.FC<ReverseDigitSpanProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();

  const clampedLevel = Math.min(10, Math.max(1, levelNumber));
  // Sequence length: 3 digits at level 1 up to 8 digits at level 10
  const sequenceLength = Math.min(8, 2 + Math.ceil(clampedLevel * 0.6));
  const displayDurationMs = Math.max(800, 1600 - clampedLevel * 80);

  const [isReady, setIsReady] = useState<boolean>(false);
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'input' | 'completed'>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentShowingIdx, setCurrentShowingIdx] = useState<number | null>(null);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const startTimeRef = useRef<number>(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const startRound = () => {
    clearTimers();
    setUserInput([]);
    setFeedback(null);
    setCurrentShowingIdx(null);

    // Generate random digits without immediate repetitions
    const digits: number[] = [];
    while (digits.length < sequenceLength) {
      const nextDigit = Math.floor(Math.random() * 9) + 1; // 1 to 9
      if (digits.length === 0 || digits[digits.length - 1] !== nextDigit) {
        digits.push(nextDigit);
      }
    }
    setSequence(digits);
    setGameState('showing');

    let delay = 600;
    digits.forEach((_, idx) => {
      // Show digit
      const tShow = setTimeout(() => {
        setCurrentShowingIdx(idx);
        audioManager.playTick(soundEnabled);
      }, delay);
      timersRef.current.push(tShow);

      delay += displayDurationMs;

      // Blank pause
      const tBlank = setTimeout(() => {
        setCurrentShowingIdx(null);
      }, delay);
      timersRef.current.push(tBlank);

      delay += 350;
    });

    // Finished showing -> switch to input
    const tEnd = setTimeout(() => {
      setGameState('input');
      startTimeRef.current = Date.now();
    }, delay);
    timersRef.current.push(tEnd);
  };

  useEffect(() => {
    setIsReady(false);
    clearTimers();
    return () => clearTimers();
  }, [levelNumber]);

  const handleStart = () => {
    setIsReady(true);
    startRound();
  };

  const handleDigitInput = (num: number) => {
    if (gameState !== 'input' || userInput.length >= sequence.length) return;

    audioManager.playTap(soundEnabled);
    const updated = [...userInput, num];
    setUserInput(updated);

    if (updated.length === sequence.length) {
      const responseTime = Date.now() - startTimeRef.current;
      setGameState('completed');

      // Target is reverse sequence!
      const targetReverse = [...sequence].reverse();
      const isCorrect = updated.every((val, idx) => val === targetReverse[idx]);

      if (isCorrect) {
        audioManager.playSuccess(soundEnabled);
        setFeedback({
          isCorrect: true,
          message:
            language === 'he'
              ? `מצוין! שחזרתם את כל ${sequence.length} הספרות מהסוף להתחלה בדיוק מושלם!`
              : `Flawless! You recalled all ${sequence.length} digits in reverse!`,
        });
      } else {
        audioManager.playGentleChime(soundEnabled);
        setFeedback({
          isCorrect: false,
          message:
            language === 'he'
              ? `הרצף המקורי: ${sequence.join(' - ')} | הרצף ההפוך הנכון: ${targetReverse.join(' - ')}`
              : `Original: ${sequence.join(' - ')} | Correct Reverse: ${targetReverse.join(' - ')}`,
        });
      }

      onFeedbackGiven(isCorrect, responseTime);
    }
  };

  const handleBackspace = () => {
    if (gameState !== 'input' || userInput.length === 0) return;
    audioManager.playTap(soundEnabled);
    setUserInput((prev) => prev.slice(0, -1));
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        title={language === 'he' ? 'זיכרון ספרות הפוך (Reverse Digit Span)' : 'Reverse Digit Span'}
        categoryName={language === 'he' ? 'זיכרון עבודה' : 'Working Memory'}
        levelNumber={clampedLevel}
        instructions={
          language === 'he'
            ? `ספרות יופיעו על המסך אחת אחרי השנייה (${sequenceLength} ספרות). שימו לב וזכרו אותן, וכשהן ייעלמו – הקלידו אותן בסדר הפוך (מהאחרונה לראשונה)!`
            : `Digits will appear one by one (${sequenceLength} digits). Remember them, and when they vanish, enter them in reverse order (last to first)!`
        }
        scientificTip={
          language === 'he'
            ? 'מבחן ה-Digit Span ההפוך (מתוך סוללת וכסלר הבינלאומית) מאמן את הזיכרון הפונולוגי וקיבולת עיבוד הנתונים.'
            : 'Reverse digit recall is a cornerstone neuropsychological metric assessing phonological working memory and mental buffer size.'
        }
        onStart={handleStart}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-2">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-2 flex items-center justify-center gap-2">
          <span>{language === 'he' ? 'זיכרון ספרות הפוך' : 'Reverse Digit Span'}</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
            }`}
          >
            {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
          </span>
        </h2>
        <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          {gameState === 'showing'
            ? language === 'he'
              ? 'זכרו את הספרות המופיעות כעת...'
              : 'Remember the sequence of digits...'
            : language === 'he'
            ? `כעת הקלידו אותן בסדר הפוך! (מהסוף להתחלה - ${sequenceLength} ספרות)`
            : `Now enter them in REVERSE order! (${sequenceLength} digits)`}
        </p>
      </div>

      {/* Central Display: Flash digit or User input buffer */}
      <div
        className={`w-72 sm:w-88 h-40 rounded-3xl flex items-center justify-center shadow-xl border-4 mb-6 transition-all ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : theme === 'dark'
            ? 'bg-slate-900 border-slate-700 text-white'
            : 'bg-white border-primary-200 text-slate-900 shadow-md'
        }`}
      >
        {gameState === 'showing' && currentShowingIdx !== null ? (
          <span className="text-7xl sm:text-8xl font-black animate-scaleIn">
            {sequence[currentShowingIdx]}
          </span>
        ) : gameState === 'showing' ? (
          <span className="text-3xl font-bold opacity-30">• • •</span>
        ) : (
          <div className="flex items-center gap-2 flex-wrap justify-center px-4">
            {Array.from({ length: sequence.length }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-12 rounded-xl flex items-center justify-center text-2xl font-black border-2 ${
                  userInput[i] !== undefined
                    ? highContrast
                      ? 'bg-yellow-400 text-black border-yellow-300'
                      : 'bg-primary-600 text-white border-primary-500'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-transparent'
                }`}
              >
                {userInput[i] ?? '-'}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-72 sm:w-80">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleDigitInput(num)}
            disabled={gameState !== 'input'}
            className={`py-4 rounded-2xl text-3xl font-black shadow-md transition-all transform active:scale-95 ${
              highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700'
            } ${gameState !== 'input' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {num}
          </button>
        ))}

        {/* Backspace */}
        <button
          onClick={handleBackspace}
          disabled={gameState !== 'input' || userInput.length === 0}
          className={`col-span-3 py-3 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 border-2 transition-all ${
            highContrast
              ? 'bg-zinc-900 border-zinc-700 text-white hover:border-yellow-400'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
          }`}
        >
          <Delete className="w-5 h-5" />
          <span>{language === 'he' ? 'מחק ספרה אחרונה' : 'Delete Last'}</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`mt-6 w-full max-w-lg p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${
            feedback.isCorrect
              ? highContrast
                ? 'bg-yellow-950/60 border-yellow-400 text-yellow-300'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200'
              : highContrast
              ? 'bg-zinc-900 border-zinc-500 text-white'
              : 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 text-blue-900 dark:text-blue-200'
          }`}
        >
          {feedback.isCorrect ? (
            <CheckCircle2 className="w-8 h-8 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="w-8 h-8 shrink-0 text-blue-400" />
          )}
          <div className="flex-1">
            <p className="font-bold text-lg">{feedback.message}</p>
          </div>
          <button
            onClick={startRound}
            className={`p-2 rounded-xl transition-all ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-slate-200 dark:bg-slate-800'
            }`}
            title={language === 'he' ? 'שחקו שוב' : 'Play Again'}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
