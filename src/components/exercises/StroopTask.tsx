import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw } from 'lucide-react';

interface StroopTaskProps {
  levelNumber?: number; // 1 - 10
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface StroopTrial {
  wordKey: 'red' | 'blue' | 'green' | 'yellow';
  colorKey: 'red' | 'blue' | 'green' | 'yellow';
  isCongruent: boolean;
}

const COLOR_MAP = {
  red: {
    he: 'אדום',
    en: 'RED',
    hex: '#ef4444',
    bgClass: 'bg-red-500 hover:bg-red-600 text-white',
  },
  blue: {
    he: 'כחול',
    en: 'BLUE',
    hex: '#3b82f6',
    bgClass: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  green: {
    he: 'ירוק',
    en: 'GREEN',
    hex: '#10b981',
    bgClass: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  },
  yellow: {
    he: 'צהוב',
    en: 'YELLOW',
    hex: '#eab308',
    bgClass: 'bg-amber-400 hover:bg-amber-500 text-black',
  },
};

type ColorKey = keyof typeof COLOR_MAP;
const COLOR_KEYS: ColorKey[] = ['red', 'blue', 'green', 'yellow'];

export const StroopTask: React.FC<StroopTaskProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  // Trials count: 6 at level 1 up to 12 at level 10
  const totalTrials = Math.min(12, 5 + clampedLevel);

  const [isReady, setIsReady] = useState<boolean>(false);
  const [currentTrialIdx, setCurrentTrialIdx] = useState<number>(0);
  const [trials, setTrials] = useState<StroopTrial[]>([]);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const trialStartTimeRef = useRef<number>(0);
  const totalTimeAccumulatorRef = useRef<number>(0);

  const generateTrials = () => {
    const list: StroopTrial[] = [];
    for (let i = 0; i < totalTrials; i++) {
      const wordKey = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
      // Incongruent probability higher at higher levels
      const makeIncongruent = Math.random() < 0.3 + clampedLevel * 0.05;
      let colorKey = wordKey;
      if (makeIncongruent) {
        const others = COLOR_KEYS.filter((k) => k !== wordKey);
        colorKey = others[Math.floor(Math.random() * others.length)];
      }
      list.push({ wordKey, colorKey, isCongruent: wordKey === colorKey });
    }
    setTrials(list);
    setCurrentTrialIdx(0);
    setCorrectCount(0);
    setIsCompleted(false);
    setFeedback(null);
    totalTimeAccumulatorRef.current = 0;
    trialStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    setIsReady(false);
  }, [levelNumber]);

  const handleStart = () => {
    setIsReady(true);
    generateTrials();
  };

  const handleColorChoice = (chosenColor: ColorKey) => {
    if (isCompleted || currentTrialIdx >= trials.length) return;

    const trialDuration = Date.now() - trialStartTimeRef.current;
    totalTimeAccumulatorRef.current += trialDuration;

    const currentTrial = trials[currentTrialIdx];
    // Rule: Match ink COLOR, NOT written word
    const isCorrect = chosenColor === currentTrial.colorKey;

    if (isCorrect) {
      audioManager.playTick(soundEnabled);
      setCorrectCount((prev) => prev + 1);
    } else {
      audioManager.playTap(soundEnabled);
    }

    const nextIdx = currentTrialIdx + 1;
    if (nextIdx >= trials.length) {
      // Completed all trials
      setIsCompleted(true);
      const finalCorrect = correctCount + (isCorrect ? 1 : 0);
      const accuracyRatio = finalCorrect / trials.length;
      const passed = accuracyRatio >= 0.7;

      if (passed) {
        audioManager.playSuccess(soundEnabled);
        setFeedback({
          isCorrect: true,
          message:
            language === 'he'
              ? `מעולה! עניתם נכון על ${finalCorrect}/${trials.length} מילים. התגברתם על הבלבול בהצלחה!`
              : `Terrific! Answered ${finalCorrect}/${trials.length} correctly. Overcame interference!`,
        });
      } else {
        audioManager.playGentleChime(soundEnabled);
        setFeedback({
          isCorrect: false,
          message:
            language === 'he'
              ? `תוצאה: ${finalCorrect}/${trials.length}. מבחן סטרופ מאמן שליטה קוגניטיבית ועמידות בפני הסחות דעת!`
              : `Result: ${finalCorrect}/${trials.length}. Stroop task strengthens inhibitory control!`,
        });
      }

      onFeedbackGiven(passed, totalTimeAccumulatorRef.current);
    } else {
      setCurrentTrialIdx(nextIdx);
      trialStartTimeRef.current = Date.now();
    }
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        title={language === 'he' ? 'מבחן סטרופ - קשב וסינון מסיחים (Stroop Task)' : 'Stroop Color-Word Task'}
        categoryName={language === 'he' ? 'קשב וריכוז' : 'Attention & Inhibition'}
        levelNumber={clampedLevel}
        instructions={
          language === 'he'
            ? 'על המסך תופיע מילה. המשימה שלכם: לבחור את צבע הדיו שבו היא כתובה, ולהתעלם מהמשמעות של המילה הכתובה!'
            : 'A word will appear in color. Your mission: choose the INK COLOR it is printed in, and ignore the actual word written!'
        }
        scientificTip={
          language === 'he'
            ? 'אפקט סטרופ הוא מהתופעות המפורסמות בחקר המוח: הוא דורש "עיכוב תגובה" (Inhibitory Control) של הדחף האוטומטי לקרוא את הטקסט.'
            : 'The Stroop paradigm activates the Anterior Cingulate Cortex to suppress automatic reading impulses.'
        }
        onStart={handleStart}
      />
    );
  }

  const activeTrial = trials[currentTrialIdx];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-2">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-2 flex items-center justify-center gap-2">
          <span>{language === 'he' ? 'מבחן סטרופ - איזה צבע הדיו?' : 'Stroop Task - Ink Color'}</span>
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
            ? 'לחצו על כפתור הצבע שבו המילה כתובה (התעלמו ממה שכתוב!)'
            : 'Click the button matching the INK COLOR (ignore the written word!)'}
        </p>

        {/* Progress indicator */}
        <div className="mt-3 text-sm font-bold text-slate-400">
          {language === 'he'
            ? `מילה ${currentTrialIdx + 1} מתוך ${trials.length}`
            : `Word ${currentTrialIdx + 1} of ${trials.length}`}
        </div>
      </div>

      {/* Word Stimulus Card */}
      {activeTrial && (
        <div
          className={`w-full max-w-md h-44 rounded-3xl flex items-center justify-center shadow-xl border-4 mb-8 transition-all ${
            highContrast
              ? 'bg-black border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-slate-700'
              : 'bg-white border-slate-200 shadow-md'
          }`}
        >
          <span
            className="text-6xl sm:text-7xl font-black tracking-wider transition-all"
            style={{ color: COLOR_MAP[activeTrial.colorKey].hex }}
          >
            {COLOR_MAP[activeTrial.wordKey][language]}
          </span>
        </div>
      )}

      {/* 4 Color Buttons */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {COLOR_KEYS.map((key) => {
          const info = COLOR_MAP[key];
          return (
            <button
              key={key}
              onClick={() => handleColorChoice(key)}
              disabled={isCompleted}
              className={`py-5 px-6 rounded-2xl text-2xl font-black shadow-lg transform active:scale-95 transition-all cursor-pointer ${
                highContrast
                  ? 'bg-black border-4 text-white hover:opacity-80'
                  : info.bgClass
              }`}
              style={
                highContrast
                  ? { borderColor: info.hex, color: info.hex }
                  : undefined
              }
            >
              {info[language]}
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
