import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import {
  SDMT_LEVELS,
  SDMT_SYMBOLS,
  type SDMTLevelConfig,
  type SDMTSymbolMapping,
} from '../../data/cognitiveLevelsMatrix';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw } from 'lucide-react';

interface SDMTProps {
  levelNumber?: number; // 1 - 10
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

export const SDMTExercise: React.FC<SDMTProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();

  // Find level configuration
  const config: SDMTLevelConfig =
    SDMT_LEVELS.find((l) => l.level === Math.min(10, Math.max(1, levelNumber))) ||
    SDMT_LEVELS[0];

  const [isReady, setIsReady] = useState<boolean>(false);
  const [legend, setLegend] = useState<SDMTSymbolMapping[]>([]);
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInputs, setUserInputs] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const startTimeRef = useRef<number>(0);

  const setupRound = () => {
    // 1. Choose unique symbols for the legend
    const pool = [...SDMT_SYMBOLS].sort(() => 0.5 - Math.random());
    const selectedSymbols = pool.slice(0, config.mappingCount);

    const generatedLegend: SDMTSymbolMapping[] = selectedSymbols.map((sym, idx) => ({
      symbol: sym,
      digit: idx + 1, // 1 to mappingCount
    }));

    // 2. Build target sequence from legend symbols
    const seq: string[] = [];
    for (let i = 0; i < config.sequenceLength; i++) {
      const randomSymbol =
        selectedSymbols[Math.floor(Math.random() * selectedSymbols.length)];
      seq.push(randomSymbol);
    }

    setLegend(generatedLegend);
    setTargetSequence(seq);
    setCurrentIndex(0);
    setUserInputs([]);
    setIsCompleted(false);
    setFeedback(null);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    setIsReady(false);
  }, [levelNumber]);

  const handleStartExercise = () => {
    setIsReady(true);
    setupRound();
  };

  // Handle number pad button press
  const handleDigitInput = (digit: number) => {
    if (isCompleted || currentIndex >= targetSequence.length) return;

    audioManager.playTick(soundEnabled);
    const updatedInputs = [...userInputs, digit];
    setUserInputs(updatedInputs);

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    // Completed all items in sequence?
    if (nextIndex >= targetSequence.length) {
      const responseTimeMs = Date.now() - startTimeRef.current;
      setIsCompleted(true);

      // Evaluate accuracy against legend mapping
      let correctMatches = 0;
      targetSequence.forEach((sym, idx) => {
        const expectedDigit = legend.find((m) => m.symbol === sym)?.digit;
        if (updatedInputs[idx] === expectedDigit) {
          correctMatches++;
        }
      });

      const accuracyRatio = correctMatches / targetSequence.length;
      const passed = accuracyRatio >= 0.75;

      if (passed) {
        audioManager.playSuccess(soundEnabled);
        setFeedback({
          isCorrect: true,
          message:
            language === 'he'
              ? `מעולה! פענחתם בהצלחה ${correctMatches}/${targetSequence.length} סמלים ב-${(responseTimeMs / 1000).toFixed(1)} שניות!`
              : `Great job! Decoded ${correctMatches}/${targetSequence.length} symbols in ${(responseTimeMs / 1000).toFixed(1)}s!`,
        });
      } else {
        audioManager.playGentleChime(soundEnabled);
        setFeedback({
          isCorrect: false,
          message:
            language === 'he'
              ? `תוצאה: ${correctMatches}/${targetSequence.length}. התאמת סמלים מפתחת מהירות עיבוד עצבית!`
              : `Result: ${correctMatches}/${targetSequence.length}. Symbol association reinforces processing speed!`,
        });
      }

      onFeedbackGiven(passed, responseTimeMs);
    }
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        title={language === 'he' ? 'מבחן התאמת ספרה-סמל (SDMT)' : 'Symbol Digit Modalities (SDMT)'}
        categoryName={language === 'he' ? 'מהירות עיבוד' : 'Processing Speed'}
        levelNumber={config.level}
        instructions={
          language === 'he'
            ? `בראש המסך יופיע מקרא המקשר בין סמל לספרה. המשימה שלכם: להביט בסמל המוצג ולהקיש במהירות את הספרה התואמת לו באמצעות המקלדת שעל המסך.`
            : `At the top, a key pairs abstract symbols with digits. Your mission: view each active symbol and rapidly enter its matching digit on the keypad.`
        }
        scientificTip={
          language === 'he'
            ? 'מבחן ה-SDMT הוא מדד הזהב הנוירו-פסיכולוגי למהירות סריקה קוגניטיבית וגמישות המעבר בין מערכות ייצוג שונות.'
            : 'The SDMT is a global gold standard measuring visual scanning rate and rapid code-switching efficiency.'
        }
        onStart={handleStartExercise}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-2">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-black mb-1 flex items-center justify-center gap-2">
          <span>{language === 'he' ? 'מבחן התאמת ספרה-סמל (SDMT)' : 'Symbol Digit Modalities (SDMT)'}</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
            }`}
          >
            {language === 'he' ? `רמה ${config.level}` : `Level ${config.level}`}
          </span>
        </h2>
        <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300">
          {language === 'he'
            ? 'הביטו במקרא למעלה והקישו את הספרה התואמת לכל סמל'
            : 'Match each symbol below with its corresponding number from the key'}
        </p>
      </div>

      {/* 1. LEGEND / KEY TABLE */}
      <div
        className={`w-full max-w-xl p-4 rounded-2xl mb-6 shadow-md border-2 ${
          highContrast
            ? 'bg-black border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 border-slate-700'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="text-center font-bold text-sm text-slate-400 mb-2">
          {language === 'he' ? '— מקרא סמלים וספרות —' : '— Key / Legend —'}
        </div>
        <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
          {legend.map((item) => (
            <div
              key={item.digit}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 min-w-12 sm:min-w-14 ${
                highContrast
                  ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
                  : 'bg-primary-50 dark:bg-primary-950/60 border-primary-200 dark:border-primary-800 text-slate-900 dark:text-white'
              }`}
            >
              <span className="text-2xl sm:text-3xl font-bold">{item.symbol}</span>
              <div className="w-full h-px bg-slate-300 dark:bg-slate-700 my-1" />
              <span className="text-xl sm:text-2xl font-black text-primary-600 dark:text-primary-400">
                {item.digit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. TARGET QUEUE & CURRENT SYMBOL FOCUS */}
      <div
        className={`w-full max-w-xl p-5 rounded-2xl mb-6 flex flex-col items-center border-2 ${
          highContrast
            ? 'bg-zinc-900 border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 border-slate-800'
            : 'bg-slate-100 border-slate-200'
        }`}
      >
        <span className="text-sm font-bold text-slate-500 mb-2">
          {language === 'he' ? 'סמל נוכחי לפענוח:' : 'Current symbol to decode:'}
        </span>

        {/* Large active symbol */}
        <div className="flex items-center gap-4">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl font-black shadow-xl border-4 ${
              highContrast
                ? 'bg-yellow-400 text-black border-white'
                : 'bg-primary-600 text-white border-primary-400'
            }`}
          >
            {targetSequence[currentIndex] || '✓'}
          </div>
        </div>

        {/* Progress queue indicator */}
        <div className="flex items-center gap-1 sm:gap-2 mt-4 overflow-x-auto max-w-full py-1">
          {targetSequence.map((sym, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={idx}
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  isCurrent
                    ? 'ring-2 ring-primary-500 scale-110 font-black bg-primary-200 dark:bg-primary-800'
                    : isDone
                    ? 'opacity-40 bg-slate-300 dark:bg-slate-700'
                    : 'bg-white dark:bg-slate-800 border'
                }`}
              >
                {sym}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SENIOR-FRIENDLY NUMPAD */}
      <div className="grid grid-cols-3 gap-3 w-72 sm:w-80">
        {Array.from({ length: config.mappingCount }).map((_, i) => {
          const num = i + 1;
          return (
            <button
              key={num}
              onClick={() => handleDigitInput(num)}
              disabled={isCompleted}
              className={`py-4 rounded-2xl text-3xl font-black shadow-md transition-all transform active:scale-95 ${
                highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-white'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700'
              }`}
            >
              {num}
            </button>
          );
        })}
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
            onClick={setupRound}
            className={`p-2 rounded-xl transition-all ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-slate-200 dark:bg-slate-800'
            }`}
            title={language === 'he' ? 'נסו שוב' : 'Try Again'}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
