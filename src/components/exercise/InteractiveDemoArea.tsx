import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

interface InteractiveDemoAreaProps {
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
  resetTrigger?: number;
}

export const InteractiveDemoArea: React.FC<InteractiveDemoAreaProps> = ({
  onFeedbackGiven,
  resetTrigger = 0,
}) => {
  const { highContrast, reduceAnimations, soundEnabled } = useAccessibility();

  // Working Memory Dog Game State
  // 3 doors (0, 1, 2)
  const [targetDoor, setTargetDoor] = useState<number>(1);
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [doorState, setDoorState] = useState<'showing' | 'shuffling' | 'ready' | 'revealed'>('showing');
  const [startTime, setStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Initialize or reset round
  useEffect(() => {
    // Pick random door
    const randomTarget = Math.floor(Math.random() * 3);
    setTargetDoor(randomTarget);
    setSelectedDoor(null);
    setFeedback(null);
    setDoorState('showing');

    // Show puppy briefly, then close & shuffle
    const timer1 = setTimeout(() => {
      setDoorState('shuffling');
      const timer2 = setTimeout(() => {
        setDoorState('ready');
        setStartTime(Date.now());
      }, reduceAnimations ? 300 : 1200);
      return () => clearTimeout(timer2);
    }, reduceAnimations ? 800 : 1800);

    return () => clearTimeout(timer1);
  }, [resetTrigger, reduceAnimations]);

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
        message: 'Wonderful job! You followed the puppy perfectly.',
      });
    } else {
      // Gentle learning feedback - NO harsh buzzers or red X
      audioManager.playGentleGuidance(soundEnabled);
      setFeedback({
        isCorrect: false,
        message: 'Good try! Here is where the puppy was hiding. Every try keeps your brain sharp.',
      });
    }

    onFeedbackGiven(isCorrect, responseTime);
  };

  return (
    <div className="w-full flex flex-col items-center justify-between min-h-[420px] max-w-3xl mx-auto py-2 px-3">
      {/* Exercise Sub-Guidance */}
      <div className="text-center mb-6">
        <p className="text-xl sm:text-2xl font-bold tracking-tight">
          {doorState === 'showing' && '👀 Look closely at where the friendly puppy is hiding!'}
          {doorState === 'shuffling' && '🔄 Keeping watch as the doors close...'}
          {doorState === 'ready' && '👉 Touch the door where you think the puppy is hiding:'}
          {doorState === 'revealed' && (feedback?.isCorrect ? '🌟 Brilliant memory!' : '💡 Learning moment:')}
        </p>
      </div>

      {/* 3 Interactive Doors */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-xl my-auto">
        {[0, 1, 2].map((doorIndex) => {
          const isTarget = doorIndex === targetDoor;
          const isSelected = doorIndex === selectedDoor;
          const isRevealed = doorState === 'revealed';
          const isShowingInitial = doorState === 'showing';

          // Senior high-visibility styling
          let cardBg = highContrast
            ? 'bg-gray-900 border-yellow-400 text-white'
            : 'bg-white border-blue-300 text-slate-800 shadow-md hover:border-blue-500';

          if (isRevealed) {
            if (isTarget) {
              cardBg = highContrast
                ? 'bg-yellow-400/20 border-yellow-300 ring-4 ring-yellow-400 text-yellow-300'
                : 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-400/50 text-emerald-900';
            } else if (isSelected && !isTarget) {
              cardBg = highContrast
                ? 'bg-gray-900 border-gray-500 text-gray-300 opacity-60'
                : 'bg-slate-50 border-slate-300 text-slate-500 opacity-75';
            }
          }

          return (
            <button
              key={doorIndex}
              onClick={() => handleDoorClick(doorIndex)}
              disabled={doorState !== 'ready'}
              aria-label={`Door number ${doorIndex + 1}`}
              className={`min-h-[140px] sm:min-h-[190px] rounded-3xl border-4 flex flex-col items-center justify-center p-3 transition-all cursor-pointer ${cardBg} ${
                doorState === 'ready'
                  ? 'hover:scale-105 active:scale-95 ring-offset-2'
                  : 'cursor-default'
              }`}
            >
              {/* Door Icon / Puppy Reveal */}
              {(isShowingInitial && isTarget) || (isRevealed && isTarget) ? (
                <div className="flex flex-col items-center animate-fade-in">
                  <span className="text-5xl sm:text-6xl" role="img" aria-label="Puppy">
                    🐶
                  </span>
                  <span className="font-extrabold text-base sm:text-lg mt-2 text-center">
                    Puppy!
                  </span>
                </div>
              ) : isRevealed && isSelected && !isTarget ? (
                <div className="flex flex-col items-center">
                  <span className="text-4xl sm:text-5xl" role="img" aria-label="Empty door">
                    🚪
                  </span>
                  <span className="font-semibold text-sm sm:text-base mt-2">
                    Empty
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-5xl sm:text-6xl" role="img" aria-label="Closed Door">
                    🚪
                  </span>
                  <span className="font-extrabold text-lg sm:text-xl mt-2">
                    Door {doorIndex + 1}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Gentle Non-punitive Feedback Banner */}
      <div className="w-full min-h-[90px] flex items-center justify-center mt-6">
        {feedback && (
          <div
            className={`w-full max-w-xl p-4 sm:p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${
              feedback.isCorrect
                ? highContrast
                  ? 'bg-black text-yellow-300 border-yellow-400'
                  : 'bg-emerald-50 text-emerald-950 border-emerald-300'
                : highContrast
                ? 'bg-black text-yellow-300 border-yellow-400'
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
                Press "Next Exercise" below whenever you are ready.
              </p>
            </div>
          </div>
        )}

        {!feedback && doorState === 'ready' && (
          <div className="flex items-center gap-2 text-base sm:text-lg opacity-70">
            <HelpCircle className="w-6 h-6" />
            <span>Take all the time you need. There is no countdown clock.</span>
          </div>
        )}
      </div>
    </div>
  );
};
