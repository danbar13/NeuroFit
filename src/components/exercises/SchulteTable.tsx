import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { SCHULTE_LEVELS, type SchulteLevelConfig } from '../../data/cognitiveLevelsMatrix';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, Timer } from 'lucide-react';

interface SchulteTableProps {
  levelNumber?: number; // 1 - 10
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

export const SchulteTable: React.FC<SchulteTableProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();

  // Find level configuration
  const config: SchulteLevelConfig =
    SCHULTE_LEVELS.find((l) => l.level === Math.min(10, Math.max(1, levelNumber))) ||
    SCHULTE_LEVELS[0];

  const [isReady, setIsReady] = useState<boolean>(false);
  const [numbersGrid, setNumbersGrid] = useState<number[]>([]);
  const [currentExpected, setCurrentExpected] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Distractor color pallet for advanced levels
  const distractorColors = [
    'bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-300',
    'bg-sky-100 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 border-sky-300',
    'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300',
    'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300',
    'bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border-purple-300',
  ];

  const shuffleArray = (arr: number[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const startNewGame = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const nums = Array.from({ length: config.maxNumber }, (_, i) => i + 1);
    setNumbersGrid(shuffleArray(nums));
    setCurrentExpected(1);
    setIsCompleted(false);
    setFeedback(null);
    setElapsedTime(0);

    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 200);
  };

  useEffect(() => {
    setIsReady(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [levelNumber]);

  const handleStartExercise = () => {
    setIsReady(true);
    startNewGame();
  };

  const handleNumberClick = (clickedNum: number) => {
    if (isCompleted) return;

    if (clickedNum === currentExpected) {
      audioManager.playTick(soundEnabled);
      const nextExpected = currentExpected + 1;

      // Dynamic reshuffle mechanic for level 9 & 10
      if (config.shuffleOnCorrect && nextExpected <= config.maxNumber) {
        setNumbersGrid((prev) => shuffleArray(prev));
      }

      if (nextExpected > config.maxNumber) {
        // Round Finished!
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        const totalDurationMs = Date.now() - startTimeRef.current;
        setIsCompleted(true);
        audioManager.playSuccess(soundEnabled);

        const actualSec = totalDurationMs / 1000;

        setFeedback({
          isCorrect: true,
          message:
            language === 'he'
              ? `כל הכבוד! איתרתם את כל המספרים (1-${config.maxNumber}) ב-${actualSec.toFixed(1)} שניות!`
              : `Well done! Found all numbers (1-${config.maxNumber}) in ${actualSec.toFixed(1)} seconds!`,
        });

        onFeedbackGiven(true, totalDurationMs);
      } else {
        setCurrentExpected(nextExpected);
      }
    } else {
      audioManager.playClick(soundEnabled);
      // Small visual/haptic notice, non-punitive
    }
  };

if (!isReady) {
  return (
    <ExerciseBriefModal
      title={language === 'he' ? 'לוח שולטה - קשב וסריקה' : 'Schulte Table - Visual Search'}
      categoryName={language === 'he' ? 'קשב וסריקה חזותית' : 'Visual Attention'}
      levelNumber={config.level}
      instructions={
        language === 'he'
          ? `לפניכם יוצג לוח מספרים מפוזרים. המשימה שלכם: לאתר וללחוץ על המספרים בסדר עולה מ-1 ועד ${config.maxNumber} במהירות ובקצב שלכם.`
          : `A scattered number table will appear. Your mission: locate and click numbers in ascending order from 1 to ${config.maxNumber} at your own pace.`
      }
      scientificTip={
        language === 'he'
          ? 'מבחן שולטה מאמן את שדה הראייה הפריפריאלי ואת יכולת המוח לסנן רעשים חזותיים ולמקד קשב סלקטיבי.'
          : 'The Schulte Table expands peripheral visual span and trains selective focus under distraction.'
      }
      onStart={handleStartExercise}
    />
  );
}

return (
  <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-2">
      {/* Header & Target Indicator */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-2 flex items-center justify-center gap-2">
          <span>{language === 'he' ? 'לוח שולטה - קשב וסריקה חזותית' : 'Schulte Table - Visual Search'}</span>
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
            ? `סרקו ולחצו על המספרים בסדר עולה: מ-1 ועד ${config.maxNumber}`
            : `Search and click numbers in ascending order: from 1 to ${config.maxNumber}`}
        </p>

        {/* Current target & Timer status */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div
            className={`px-5 py-2 rounded-2xl flex items-center gap-2 border-2 ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 font-black'
                : 'bg-primary-50 dark:bg-primary-950/50 border-primary-300 dark:border-primary-700 font-bold text-primary-900 dark:text-primary-200'
            }`}
          >
            <span className="text-lg">{language === 'he' ? 'המספר הבא למציאה:' : 'Next number:'}</span>
            <span className="text-3xl font-black underline">{currentExpected}</span>
          </div>

          <div className="flex items-center gap-2 font-bold text-lg text-slate-600 dark:text-slate-300">
            <Timer className="w-6 h-6 text-primary-500" />
            <span>{elapsedTime}s</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        className={`grid gap-2 sm:gap-3 p-4 sm:p-5 rounded-3xl shadow-xl transition-all ${
          config.gridDimension === 3
            ? 'grid-cols-3 w-72 sm:w-80'
            : config.gridDimension === 4
            ? 'grid-cols-4 w-80 sm:w-96'
            : 'grid-cols-5 w-88 sm:w-104'
        } ${
          highContrast
            ? 'bg-black border-4 border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 border-2 border-slate-800'
            : 'bg-white border-2 border-slate-200'
        }`}
      >
        {numbersGrid.map((num, idx) => {
          const isAlreadyClicked = num < currentExpected;
          const distractorStyle =
            config.colorDistractors && !highContrast
              ? distractorColors[(num * 3) % distractorColors.length]
              : '';

          return (
            <button
              key={`${num}_${idx}`}
              onClick={() => handleNumberClick(num)}
              disabled={isAlreadyClicked || isCompleted}
              className={`aspect-square rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl transition-all duration-150 transform active:scale-95 ${
                isAlreadyClicked
                  ? highContrast
                    ? 'opacity-20 bg-zinc-900 text-zinc-600 border border-zinc-800'
                    : 'opacity-20 bg-slate-200 dark:bg-slate-800 text-slate-400'
                  : highContrast
                  ? 'bg-zinc-900 border-2 border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black cursor-pointer'
                  : distractorStyle
                  ? `${distractorStyle} border-2 hover:scale-105 shadow-sm cursor-pointer`
                  : theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 cursor-pointer'
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
            highContrast
              ? 'bg-yellow-950/60 border-yellow-400 text-yellow-300'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-8 h-8 shrink-0 text-emerald-500" />
          <div className="flex-1">
            <p className="font-bold text-lg">{feedback.message}</p>
          </div>
          <button
            onClick={startNewGame}
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
