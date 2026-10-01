import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';

interface FlankerTaskProps {
  levelNumber?: number; // 1 - 10
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface FlankerTrial {
  arrows: string[]; // e.g. ['>', '>', '<', '>', '>']
  targetDirection: 'left' | 'right';
  isCongruent: boolean;
}

export const FlankerTask: React.FC<FlankerTaskProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  // Trials count: 8 at level 1 up to 16 at level 10
  const totalTrials = 7 + clampedLevel;

  const [isReady, setIsReady] = useState<boolean>(false);
  const [trials, setTrials] = useState<FlankerTrial[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const trialStartTimeRef = useRef<number>(0);
  const totalTimeRef = useRef<number>(0);

  const generateTrials = () => {
    const list: FlankerTrial[] = [];
    for (let i = 0; i < totalTrials; i++) {
      const targetDir: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right';
      // Incongruent chance increases with level
      const makeIncongruent = Math.random() < 0.35 + clampedLevel * 0.05;
      const flankerDir: 'left' | 'right' = makeIncongruent
        ? targetDir === 'left'
          ? 'right'
          : 'left'
        : targetDir;

      const targetChar = targetDir === 'left' ? '◀' : '▶';
      const flankerChar = flankerDir === 'left' ? '◀' : '▶';

      // 5 arrows: [flanker, flanker, TARGET, flanker, flanker]
      const arrows = [flankerChar, flankerChar, targetChar, flankerChar, flankerChar];
      list.push({
        arrows,
        targetDirection: targetDir,
        isCongruent: !makeIncongruent,
      });
    }

    setTrials(list);
    setCurrentIdx(0);
    setCorrectCount(0);
    setIsCompleted(false);
    setFeedback(null);
    totalTimeRef.current = 0;
    trialStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    setIsReady(false);
  }, [levelNumber]);

  const handleStart = () => {
    setIsReady(true);
    generateTrials();
  };

  const handleResponse = (chosenDir: 'left' | 'right') => {
    if (isCompleted || currentIdx >= trials.length) return;

    const trialDuration = Date.now() - trialStartTimeRef.current;
    totalTimeRef.current += trialDuration;

    const currentTrial = trials[currentIdx];
    const isCorrect = chosenDir === currentTrial.targetDirection;

    if (isCorrect) {
      audioManager.playTick(soundEnabled);
      setCorrectCount((prev) => prev + 1);
    } else {
      audioManager.playTap(soundEnabled);
    }

    const nextIdx = currentIdx + 1;
    if (nextIdx >= trials.length) {
      setIsCompleted(true);
      const finalScore = correctCount + (isCorrect ? 1 : 0);
      const accuracy = finalScore / trials.length;
      const passed = accuracy >= 0.7;

      if (passed) {
        audioManager.playSuccess(soundEnabled);
        setFeedback({
          isCorrect: true,
          message:
            language === 'he'
              ? `כל הכבוד! דייקתם ב-${finalScore}/${trials.length} חיצים והתעלמתם מהמסיחים הצדדיים!`
              : `Well done! Correctly identified ${finalScore}/${trials.length} targets despite flankers!`,
        });
      } else {
        audioManager.playGentleChime(soundEnabled);
        setFeedback({
          isCorrect: false,
          message:
            language === 'he'
              ? `תוצאה: ${finalScore}/${trials.length}. מבחן פלאנקר מחדד את הקשב המרחבי והסינון הסלקטיבי.`
              : `Result: ${finalScore}/${trials.length}. The Flanker task sharpens selective visual inhibition.`,
        });
      }

      onFeedbackGiven(passed, totalTimeRef.current);
    } else {
      setCurrentIdx(nextIdx);
      trialStartTimeRef.current = Date.now();
    }
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        title={language === 'he' ? 'מבחן פלאנקר (Eriksen Flanker Task)' : 'Eriksen Flanker Task'}
        categoryName={language === 'he' ? 'קשב וריכוז' : 'Attention & Inhibition'}
        levelNumber={clampedLevel}
        instructions={
          language === 'he'
            ? 'על המסך תופיע שורה של 5 חיצים. המשימה שלכם: ללחוץ על הכפתור המתאים לכיוון של החץ המרכזי בלבד! התעלמו מכל החיצים בצדדים.'
            : 'A row of 5 arrows will appear. Your mission: click the direction of the CENTER ARROW only! Ignore all surrounding flankers.'
        }
        scientificTip={
          language === 'he'
            ? 'מבחן פלאנקר בודק את מהירות דיכוי התגובה המוטעית ומאמן קשב סלקטיבי חזותי ללא הסחות.'
            : 'The Eriksen Flanker Task evaluates conflict resolution and selective visual attention gating.'
        }
        onStart={handleStart}
      />
    );
  }

  const activeTrial = trials[currentIdx];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-2">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-1 flex items-center justify-center gap-2">
          <span>{language === 'he' ? 'מבחן פלאנקר - לאן פונה החץ המרכזי?' : 'Flanker Task - Center Arrow'}</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
            }`}
          >
            {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
          </span>
        </h2>
        <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300">
          {language === 'he'
            ? 'הביטו בחץ האמצעי בלבד ולחצו ימינה או שמאלה'
            : 'Focus ONLY on the middle arrow and choose Left or Right'}
        </p>

        <div className="text-sm font-bold text-slate-400 mt-2">
          {language === 'he'
            ? `חץ ${currentIdx + 1} מתוך ${trials.length}`
            : `Trial ${currentIdx + 1} of ${trials.length}`}
        </div>
      </div>

      {/* Flanker Display Card */}
      {activeTrial && (
        <div
          className={`w-full max-w-lg h-44 rounded-3xl flex items-center justify-center shadow-xl border-4 mb-8 transition-all ${
            highContrast
              ? 'bg-black border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-slate-700 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-md'
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-5 text-5xl sm:text-6xl font-black select-none">
            {activeTrial.arrows.map((arr, i) => {
              const isCenter = i === 2;
              return (
                <span
                  key={i}
                  className={`transition-all ${
                    isCenter
                      ? highContrast
                        ? 'text-yellow-400 scale-125 underline decoration-wavy'
                        : 'text-primary-600 dark:text-primary-400 scale-125'
                      : 'opacity-40'
                  }`}
                >
                  {arr}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Left / Right Buttons */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        <button
          onClick={() => handleResponse('left')}
          disabled={isCompleted}
          className={`py-6 rounded-2xl text-2xl font-black flex items-center justify-center gap-3 shadow-xl transform active:scale-95 transition-all cursor-pointer ${
            highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300'
              : 'bg-primary-600 hover:bg-primary-500 text-white'
          }`}
        >
          <ArrowLeft className="w-8 h-8" />
          <span>{language === 'he' ? 'שמאלה' : 'Left'}</span>
        </button>

        <button
          onClick={() => handleResponse('right')}
          disabled={isCompleted}
          className={`py-6 rounded-2xl text-2xl font-black flex items-center justify-center gap-3 shadow-xl transform active:scale-95 transition-all cursor-pointer ${
            highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300'
              : 'bg-primary-600 hover:bg-primary-500 text-white'
          }`}
        >
          <span>{language === 'he' ? 'ימינה' : 'Right'}</span>
          <ArrowRight className="w-8 h-8" />
        </button>
      </div>

      {/* Result Feedback Banner */}
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
          <CheckCircle2 className="w-8 h-8 shrink-0 text-emerald-500" />
          <div className="flex-1">
            <p className="font-bold text-lg">{feedback.message}</p>
          </div>
          <button
            onClick={generateTrials}
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
