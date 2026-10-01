import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, Eye } from 'lucide-react';

interface DualNBackProps {
  levelNumber?: number; // 1 - 10
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface NBackStep {
  positionIndex: number; // 0 to 8 on a 3x3 grid
  symbolChar: string; // 'A', 'B', 'C', 'D'
}

const SYMBOLS = ['A', 'B', 'C', 'D'];

export const DualNBack: React.FC<DualNBackProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  // N value: 1-back for levels 1-4, 2-back for levels 5-10
  const nValue = clampedLevel <= 4 ? 1 : 2;
  const totalSteps = 10 + clampedLevel;
  const stepDurationMs = Math.max(1400, 2400 - clampedLevel * 80);

  const [isReady, setIsReady] = useState(false);
  const [history, setHistory] = useState<NBackStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(-1);
  const [userMatchedPos, setUserMatchedPos] = useState<boolean>(false);
  const [correctHits, setCorrectHits] = useState<number>(0);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  const generateSequence = () => {
    const list: NBackStep[] = [];
    let matchCount = 0;

    for (let i = 0; i < totalSteps; i++) {
      let pos = Math.floor(Math.random() * 9);
      let sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

      // Intentionally insert N-back match with 35% probability after N steps
      if (i >= nValue && Math.random() < 0.35) {
        pos = list[i - nValue].positionIndex;
        matchCount++;
      }

      list.push({ positionIndex: pos, symbolChar: sym });
    }

    setHistory(list);
    setTotalMatches(matchCount);
    setCurrentStepIdx(0);
    setUserMatchedPos(false);
    setCorrectHits(0);
    setIsCompleted(false);
    setFeedback(null);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    setIsReady(false);
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, [levelNumber]);

  // Step advancement timer
  useEffect(() => {
    if (!isReady || isCompleted || history.length === 0 || currentStepIdx < 0) return;

    if (currentStepIdx >= history.length) {
      // Completed all steps
      setIsCompleted(true);
      const durationMs = Date.now() - startTimeRef.current;
      const passed = correctHits >= Math.max(1, Math.floor(totalMatches * 0.6));

      if (passed) {
        audioManager.playSuccess(soundEnabled);
        setFeedback({
          isCorrect: true,
          message:
            language === 'he'
              ? `כל הכבוד! זיהיתם בהצלחה את התאמות ה-${nValue}-Back!`
              : `Great job! Successfully recognized the ${nValue}-Back matches!`,
        });
      } else {
        audioManager.playGentleChime(soundEnabled);
        setFeedback({
          isCorrect: false,
          message:
            language === 'he'
              ? `מבחן N-Back הוא ממבחני זיכרון העבודה המאתגרים בעולם, כל אימון מחזק את המוח!`
              : `N-Back is among the most demanding working memory paradigms. Great workout!`,
        });
      }

      onFeedbackGiven(passed, durationMs);
      return;
    }

    // Audio cue on each new item
    audioManager.playTick(soundEnabled);
    setUserMatchedPos(false);

    stepTimerRef.current = setTimeout(() => {
      setCurrentStepIdx((prev) => prev + 1);
    }, stepDurationMs);

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, [currentStepIdx, isReady, isCompleted, history.length]);

  const handleMatchButtonClick = () => {
    if (userMatchedPos || currentStepIdx < nValue) return;

    setUserMatchedPos(true);
    audioManager.playTap(soundEnabled);

    const currentPos = history[currentStepIdx].positionIndex;
    const targetPos = history[currentStepIdx - nValue].positionIndex;

    if (currentPos === targetPos) {
      audioManager.playSuccess(soundEnabled);
      setCorrectHits((prev) => prev + 1);
    }
  };

  const handleStart = () => {
    setIsReady(true);
    generateSequence();
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        title={language === 'he' ? `מבחן N-Back מרחבי (${nValue}-Back)` : `Spatial N-Back Task (${nValue}-Back)`}
        categoryName={language === 'he' ? 'זיכרון עבודה' : 'Working Memory'}
        levelNumber={clampedLevel}
        instructions={
          language === 'he'
            ? `בכל כמה שניות תופיע משבצת מוארת ברשת 3x3. לחצו על כפתור "זהה!" אם המשבצת הופיעה באותו מיקום בדיוק כמו לפני ${nValue} צעדים!`
            : `A tile illuminates in a 3x3 grid every few seconds. Click "Match!" if the current tile is in the exact same position as ${nValue} step(s) ago!`
        }
        scientificTip={
          language === 'he'
            ? 'אימון N-Back הוכח במחקרים קליניים כאימון המרכזי שמגדיל את נפח זיכרון העבודה (Working Memory Capacity) ומשפר אינטליגנציה זורמת (Fluid Intelligence).'
            : 'The N-Back paradigm is clinically validated to expand working memory buffer and fluid reasoning.'
        }
        onStart={handleStart}
      />
    );
  }

  const currentStep = history[currentStepIdx];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-2">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-black mb-1 flex items-center justify-center gap-2">
          <span>{language === 'he' ? `מבחן ${nValue}-Back מרחבי` : `Spatial ${nValue}-Back`}</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
            }`}
          >
            {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
          </span>
        </h2>
        <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300">
          {language === 'he'
            ? `האם המיקום זהה למיקום שהופיע לפני ${nValue} צעדים?`
            : `Is position identical to ${nValue} step(s) ago?`}
        </p>

        <div className="text-sm font-bold text-slate-400 mt-2">
          {language === 'he'
            ? `צעד ${Math.min(history.length, currentStepIdx + 1)} מתוך ${history.length}`
            : `Step ${Math.min(history.length, currentStepIdx + 1)} of ${history.length}`}
        </div>
      </div>

      {/* 3x3 Grid */}
      <div
        className={`grid grid-cols-3 gap-3 w-72 sm:w-80 p-5 rounded-3xl border-4 shadow-xl mb-6 transition-all ${
          highContrast
            ? 'bg-black border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 border-slate-700'
            : 'bg-white border-slate-200 shadow-md'
        }`}
      >
        {Array.from({ length: 9 }).map((_, idx) => {
          const isActive = currentStep && currentStep.positionIndex === idx;

          return (
            <div
              key={idx}
              className={`aspect-square rounded-2xl flex items-center justify-center text-3xl font-black transition-all ${
                isActive
                  ? highContrast
                    ? 'bg-yellow-400 text-black border-4 border-white scale-105 shadow-2xl'
                    : 'bg-indigo-600 text-white border-2 border-indigo-400 scale-105 shadow-xl'
                  : highContrast
                  ? 'bg-zinc-900 border border-zinc-800'
                  : theme === 'dark'
                  ? 'bg-slate-800 border border-slate-700'
                  : 'bg-slate-100 border border-slate-200'
              }`}
            >
              {isActive ? '✦' : ''}
            </div>
          );
        })}
      </div>

      {/* MATCH ACTION BUTTON */}
      <button
        onClick={handleMatchButtonClick}
        disabled={isCompleted || userMatchedPos || currentStepIdx < nValue}
        className={`w-72 sm:w-80 py-5 rounded-2xl text-2xl font-black flex items-center justify-center gap-3 shadow-xl transform active:scale-95 transition-all cursor-pointer ${
          userMatchedPos
            ? 'bg-emerald-600 text-white cursor-default'
            : currentStepIdx < nValue
            ? 'opacity-40 bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
            : highContrast
            ? 'bg-yellow-400 text-black hover:bg-yellow-300'
            : 'bg-primary-600 hover:bg-primary-500 text-white ring-4 ring-primary-400/30'
        }`}
      >
        <Eye className="w-7 h-7" />
        <span>{userMatchedPos ? (language === 'he' ? 'סומן ✓' : 'Marked ✓') : (language === 'he' ? 'מיקום זהה! (Match)' : 'Same Position!')}</span>
      </button>

      {/* Result Banner */}
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
            onClick={generateSequence}
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
