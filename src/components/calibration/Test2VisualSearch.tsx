import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { baselineContentMatrix } from '../../data/baselineContentMatrix';
import { CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

interface Test2Props {
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
  level?: 'level_1' | 'level_2' | 'level_3';
}

export const Test2VisualSearch: React.FC<Test2Props> = ({ onFeedbackGiven, level = 'level_2' }) => {
  const { theme, highContrast, soundEnabled, language, t } = useAccessibility();

  const exerciseData = baselineContentMatrix[language].exercises.ex_visual_search;
  const config = exerciseData.difficulty_levels[level];

  const totalItems = config.grid_size || 9;
  const isLevel3 = level === 'level_3';

  const [targetIndex, setTargetIndex] = useState<number>(4);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * totalItems);
    setTargetIndex(randomIndex);
    setSelectedIndex(null);
    setIsAnswered(false);
    setFeedback(null);
    setStartTime(Date.now());
  }, [totalItems]);

  const handleAppleClick = (index: number) => {
    if (isAnswered) return;

    const responseTime = Date.now() - startTime;
    setSelectedIndex(index);
    setIsAnswered(true);

    const isCorrect = index === targetIndex;

    if (isCorrect) {
      audioManager.playSuccess(soundEnabled);
      setFeedback({
        isCorrect: true,
        message: t.test2Success,
      });
    } else {
      audioManager.playGentleGuidance(soundEnabled);
      setFeedback({
        isCorrect: false,
        message: t.test2Guidance,
      });
    }

    onFeedbackGiven(isCorrect, responseTime);
  };

  const getGridColsClass = () => {
    if (totalItems === 4) return 'grid-cols-2 max-w-xs';
    if (totalItems === 9) return 'grid-cols-3 max-w-sm';
    return 'grid-cols-4 max-w-md';
  };

  return (
    <div className="w-full flex flex-col items-center justify-between min-h-[440px] max-w-3xl mx-auto py-2 px-3">
      {/* Exercise Instruction from Matrix: "מצאו ולחצו על התפוח האדום." */}
      <div className="text-center mb-5">
        <p className="text-xl sm:text-2xl font-bold tracking-tight">
          {exerciseData.instruction}
        </p>
      </div>

      {/* Dynamic Grid from Matrix (4, 9, or 16 items) */}
      <div className={`grid gap-3 sm:gap-4 w-full my-auto ${getGridColsClass()}`}>
        {Array.from({ length: totalItems }).map((_, index) => {
          const isTarget = index === targetIndex;
          const isSelected = index === selectedIndex;

          // For level 3 distractors include tomatoes 🍅 and green apples 🍏
          const distractorEmoji = isLevel3 && index % 2 === 1 ? '🍅' : '🍏';
          const emoji = isTarget ? '🍎' : distractorEmoji;

          let btnClasses = '';
          if (highContrast) {
            btnClasses = 'bg-gray-900 border-yellow-400 text-white';
            if (isAnswered && isTarget) {
              btnClasses = 'bg-yellow-400/30 border-yellow-300 ring-4 ring-yellow-400 text-yellow-300 scale-105';
            } else if (isAnswered && isSelected && !isTarget) {
              btnClasses = 'bg-gray-900 border-gray-600 opacity-50';
            }
          } else if (theme === 'dark') {
            btnClasses = 'bg-slate-800 border-slate-700 text-slate-100 hover:border-blue-400';
            if (isAnswered && isTarget) {
              btnClasses = 'bg-emerald-950/70 border-emerald-500 ring-4 ring-emerald-500/40 scale-105';
            } else if (isAnswered && isSelected && !isTarget) {
              btnClasses = 'bg-slate-800 border-slate-700 opacity-50';
            }
          } else {
            btnClasses = 'bg-white border-slate-200 shadow-sm hover:border-blue-400';
            if (isAnswered && isTarget) {
              btnClasses = 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-400/40 scale-105';
            } else if (isAnswered && isSelected && !isTarget) {
              btnClasses = 'bg-slate-50 border-slate-200 opacity-50';
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleAppleClick(index)}
              disabled={isAnswered}
              aria-label={isTarget ? 'Red apple' : 'Distractor'}
              className={`min-h-[80px] sm:min-h-[96px] rounded-2xl border-3 flex flex-col items-center justify-center p-2 transition-all ${btnClasses} ${
                !isAnswered
                  ? 'hover:scale-105 active:scale-95 cursor-pointer'
                  : 'cursor-default'
              }`}
            >
              <span className="text-4xl sm:text-5xl select-none" role="img" aria-hidden="true">
                {emoji}
              </span>
            </button>
          );
        })}
      </div>

      {/* Gentle Learning Feedback Banner */}
      <div className="w-full min-h-[90px] flex items-center justify-center mt-6">
        {feedback && (
          <div
            className={`w-full max-w-xl p-4 sm:p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${
              feedback.isCorrect
                ? highContrast
                  ? 'bg-black text-yellow-300 border-yellow-400'
                  : theme === 'dark'
                  ? 'bg-emerald-950/80 text-emerald-200 border-emerald-600'
                  : 'bg-emerald-50 text-emerald-950 border-emerald-300'
                : highContrast
                ? 'bg-black text-yellow-300 border-yellow-400'
                : theme === 'dark'
                ? 'bg-amber-950/80 text-amber-200 border-amber-600'
                : 'bg-amber-50 text-amber-950 border-amber-300'
            }`}
          >
            {feedback.isCorrect ? (
              <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
                <Sparkles className="w-8 h-8" />
              </div>
            )}
            <div>
              <p className="text-lg sm:text-xl font-bold">{feedback.message}</p>
              <p className="text-sm sm:text-base opacity-80 mt-0.5">
                {t.waitingAnswer}
              </p>
            </div>
          </div>
        )}

        {!feedback && !isAnswered && (
          <div className="flex items-center gap-2 text-base sm:text-lg opacity-70">
            <HelpCircle className="w-6 h-6 shrink-0" />
            <span>{t.noRush}</span>
          </div>
        )}
      </div>
    </div>
  );
};
