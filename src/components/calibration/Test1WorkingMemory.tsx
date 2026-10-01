import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { baselineContentMatrix } from '../../data/baselineContentMatrix';
import { CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

interface Test1Props {
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
  level?: 'level_1' | 'level_2' | 'level_3';
}

export const Test1WorkingMemory: React.FC<Test1Props> = ({ onFeedbackGiven, level = 'level_1' }) => {
  const { theme, highContrast, reduceAnimations, soundEnabled, language, t } = useAccessibility();

  const exerciseData = baselineContentMatrix[language].exercises.ex_working_memory;
  const config = exerciseData.difficulty_levels[level];

  // Number of doors based on matrix level (3 for level_1, 4 for level_2, 5 for level_3)
  const doorCount = config.objects_count || 3;

  const [targetDoor, setTargetDoor] = useState<number>(1);
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [doorState, setDoorState] = useState<'showing' | 'shuffling' | 'ready' | 'revealed'>('showing');
  const [startTime, setStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  useEffect(() => {
    const randomTarget = Math.floor(Math.random() * doorCount);
    setTargetDoor(randomTarget);
    setSelectedDoor(null);
    setFeedback(null);
    setDoorState('showing');

    const shuffleDuration = reduceAnimations ? 400 : config.shuffle_speed_ms;

    const t1 = setTimeout(() => {
      setDoorState('shuffling');
      const t2 = setTimeout(() => {
        setDoorState('ready');
        setStartTime(Date.now());
      }, shuffleDuration);
      return () => clearTimeout(t2);
    }, reduceAnimations ? 800 : 1800);

    return () => clearTimeout(t1);
  }, [doorCount, config.shuffle_speed_ms, reduceAnimations]);

  const handleDoorClick = (doorIndex: number) => {
    if (doorState !== 'ready') return;

    const responseTime = Date.now() - startTime;
    setSelectedDoor(doorIndex);
    setDoorState('revealed');

    const isCorrect = doorIndex === targetDoor;

    if (isCorrect) {
      audioManager.playSuccess(soundEnabled);
      setFeedback({
        isCorrect: true,
        message: t.test1Success,
      });
    } else {
      audioManager.playGentleGuidance(soundEnabled);
      setFeedback({
        isCorrect: false,
        message: t.test1Guidance,
      });
    }

    onFeedbackGiven(isCorrect, responseTime);
  };

  return (
    <div className="w-full flex flex-col items-center justify-between min-h-[420px] max-w-3xl mx-auto py-2 px-3">
      {/* Exercise Instruction from Matrix: "היכן מסתתר הכלב?" */}
      <div className="text-center mb-6">
        <p className="text-xl sm:text-2xl font-bold tracking-tight">
          {doorState === 'showing' && t.test1Showing}
          {doorState === 'shuffling' && t.test1Shuffling}
          {doorState === 'ready' && `${exerciseData.instruction}`}
          {doorState === 'revealed' && (feedback?.isCorrect ? `🌟 ${t.brilliantResult}` : `💡 ${t.learningMoment}`)}
        </p>
      </div>

      {/* Interactive Doors grid based on objects_count */}
      <div
        className={`grid gap-4 sm:gap-6 w-full max-w-xl my-auto ${
          doorCount === 3
            ? 'grid-cols-3'
            : doorCount === 4
            ? 'grid-cols-2 sm:grid-cols-4'
            : 'grid-cols-3 sm:grid-cols-5'
        }`}
      >
        {Array.from({ length: doorCount }).map((_, doorIndex) => {
          const isTarget = doorIndex === targetDoor;
          const isSelected = doorIndex === selectedDoor;
          const isRevealed = doorState === 'revealed';
          const isShowingInitial = doorState === 'showing';

          let cardClasses = '';
          if (highContrast) {
            cardClasses = 'bg-gray-900 border-yellow-400 text-white';
            if (isRevealed && isTarget) {
              cardClasses = 'bg-yellow-400/20 border-yellow-300 ring-4 ring-yellow-400 text-yellow-300';
            } else if (isRevealed && isSelected && !isTarget) {
              cardClasses = 'bg-gray-900 border-gray-600 text-gray-400 opacity-60';
            }
          } else if (theme === 'dark') {
            cardClasses = 'bg-slate-800 border-slate-700 text-slate-100 hover:border-blue-400';
            if (isRevealed && isTarget) {
              cardClasses = 'bg-emerald-950/60 border-emerald-500 ring-4 ring-emerald-500/40 text-emerald-200';
            } else if (isRevealed && isSelected && !isTarget) {
              cardClasses = 'bg-slate-800 border-slate-700 text-slate-400 opacity-60';
            }
          } else {
            cardClasses = 'bg-white border-blue-200 text-slate-800 shadow-md hover:border-blue-500';
            if (isRevealed && isTarget) {
              cardClasses = 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-400/50 text-emerald-900';
            } else if (isRevealed && isSelected && !isTarget) {
              cardClasses = 'bg-slate-50 border-slate-300 text-slate-500 opacity-75';
            }
          }

          return (
            <button
              key={doorIndex}
              onClick={() => handleDoorClick(doorIndex)}
              disabled={doorState !== 'ready'}
              aria-label={t.doorLabel.replace('{num}', (doorIndex + 1).toString())}
              className={`min-h-[140px] sm:min-h-[180px] rounded-3xl border-4 flex flex-col items-center justify-center p-3 transition-all ${cardClasses} ${
                doorState === 'ready'
                  ? 'hover:scale-105 active:scale-95 cursor-pointer ring-offset-2'
                  : 'cursor-default'
              }`}
            >
              {(isShowingInitial && isTarget) || (isRevealed && isTarget) ? (
                <div className="flex flex-col items-center">
                  <span className="text-5xl sm:text-6xl" role="img" aria-label="Puppy">
                    🐶
                  </span>
                  <span className="font-extrabold text-base sm:text-lg mt-2 text-center">
                    {t.doorPuppy}
                  </span>
                </div>
              ) : isRevealed && isSelected && !isTarget ? (
                <div className="flex flex-col items-center">
                  <span className="text-4xl sm:text-5xl" role="img" aria-label="Empty door">
                    🚪
                  </span>
                  <span className="font-semibold text-sm sm:text-base mt-2">
                    {t.doorEmpty}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-5xl sm:text-6xl" role="img" aria-label="Closed Door">
                    🚪
                  </span>
                  <span className="font-extrabold text-lg sm:text-xl mt-2">
                    {t.doorLabel.replace('{num}', (doorIndex + 1).toString())}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
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

        {!feedback && doorState === 'ready' && (
          <div className="flex items-center gap-2 text-base sm:text-lg opacity-70">
            <HelpCircle className="w-6 h-6 shrink-0" />
            <span>{t.noRush}</span>
          </div>
        )}
      </div>
    </div>
  );
};
