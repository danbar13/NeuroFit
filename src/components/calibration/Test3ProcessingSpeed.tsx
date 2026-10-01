import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { baselineContentMatrix } from '../../data/baselineContentMatrix';
import { CheckCircle2, Sparkles, HelpCircle, ArrowDown } from 'lucide-react';

interface Test3Props {
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
  level?: 'level_1' | 'level_2' | 'level_3';
}

export const Test3ProcessingSpeed: React.FC<Test3Props> = ({ onFeedbackGiven }) => {
  const { theme, highContrast, soundEnabled, language, t } = useAccessibility();

  const exerciseData = baselineContentMatrix[language].exercises.ex_task_switching;

  // Trial 1: Rule from matrix instruction_primary: "מיינו את הצורות לפי צבע."
  // Trial 2: Rule shift from matrix instruction_secondary: "שימו לב: כעת מיינו לפי צורה!"
  const [subTrial, setSubTrial] = useState<1 | 2>(1);

  // In Trial 1 (Color):
  // Target item is Blue Square: 🟦
  // Baskets: 0 = Blue 🔵, 1 = Orange 🟠 -> correct = 0
  // In Trial 2 (Shape):
  // Target item is Orange Circle: 🟠
  // Baskets: 0 = Circle ⚪, 1 = Square ⬛ -> correct = 0
  const currentRule = subTrial === 1 ? 'color' : 'shape';
  const targetItem = subTrial === 1
    ? { emoji: '🟦', name: 'Blue Square' }
    : { emoji: '🟠', name: 'Orange Circle' };

  const correctBasketIndex = 0; // First basket matches the target in both sub-trials

  const [selectedBasket, setSelectedBasket] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const [subTrial1Metrics, setSubTrial1Metrics] = useState<{ correct: boolean; time: number } | null>(null);

  useEffect(() => {
    setIsAnswered(false);
    setSelectedBasket(null);
    setFeedback(null);
    setStartTime(Date.now());
  }, [subTrial]);

  const handleBasketClick = (basketIndex: number) => {
    if (isAnswered) return;

    const responseTime = Date.now() - startTime;
    setSelectedBasket(basketIndex);
    setIsAnswered(true);

    const isCorrect = basketIndex === correctBasketIndex;

    if (isCorrect) {
      audioManager.playSuccess(soundEnabled);
      setFeedback({
        isCorrect: true,
        message: t.test3Success,
      });
    } else {
      audioManager.playGentleGuidance(soundEnabled);
      setFeedback({
        isCorrect: false,
        message: t.test3Guidance,
      });
    }

    if (subTrial === 1) {
      setSubTrial1Metrics({ correct: isCorrect, time: responseTime });
    } else {
      const prevTime = subTrial1Metrics?.time || 2500;
      const prevCorrect = subTrial1Metrics?.correct ?? true;
      const combinedAccuracy = prevCorrect && isCorrect;
      const avgTime = Math.round((prevTime + responseTime) / 2);

      onFeedbackGiven(combinedAccuracy, avgTime);
    }
  };

  const handleAdvanceToSubTrial2 = () => {
    setSubTrial(2);
  };

  return (
    <div className="w-full flex flex-col items-center justify-between min-h-[440px] max-w-3xl mx-auto py-2 px-3">
      {/* Rule Notification Banner using exact instructions from matrix */}
      <div
        className={`w-full max-w-xl text-center py-3.5 px-5 rounded-2xl border-2 mb-4 transition-all ${
          subTrial === 2
            ? highContrast
              ? 'bg-yellow-400 text-black border-yellow-300 font-extrabold'
              : 'bg-amber-100 text-amber-950 border-amber-400 font-bold'
            : highContrast
            ? 'bg-gray-900 text-white border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-800 text-slate-100 border-slate-700'
            : 'bg-blue-50 text-blue-900 border-blue-200'
        }`}
      >
        <span className="text-xl sm:text-2xl block font-bold">
          {subTrial === 1 ? exerciseData.instruction_primary : exerciseData.instruction_secondary}
        </span>
      </div>

      {/* Target Item to Sort */}
      <div className="flex flex-col items-center my-3">
        <span className="text-base sm:text-lg opacity-80 mb-2">
          {t.test3Prompt}
        </span>
        <div
          className={`w-28 h-28 rounded-3xl border-4 flex items-center justify-center text-6xl shadow-md ${
            highContrast
              ? 'bg-black border-yellow-400 text-white'
              : theme === 'dark'
              ? 'bg-slate-800 border-slate-600'
              : 'bg-white border-slate-300'
          }`}
        >
          {targetItem.emoji}
        </div>
        <ArrowDown className="w-8 h-8 text-current/50 mt-2 animate-bounce" />
      </div>

      {/* 2 Baskets */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-lg mb-2">
        {[0, 1].map((basketIndex) => {
          const isCorrect = basketIndex === correctBasketIndex;
          const isSelected = basketIndex === selectedBasket;

          let label = '';
          if (currentRule === 'color') {
            label = basketIndex === 0 ? t.test3BasketBlue : t.test3BasketOrange;
          } else {
            label = basketIndex === 0 ? t.test3BasketCircle : t.test3BasketSquare;
          }

          let btnClasses = '';
          if (highContrast) {
            btnClasses = 'bg-gray-900 border-yellow-400 text-white';
            if (isAnswered && isCorrect) {
              btnClasses = 'bg-yellow-400/30 border-yellow-300 ring-4 ring-yellow-400 text-yellow-300';
            } else if (isAnswered && isSelected && !isCorrect) {
              btnClasses = 'bg-gray-900 border-gray-600 opacity-50';
            }
          } else if (theme === 'dark') {
            btnClasses = 'bg-slate-800 border-slate-700 text-slate-100 hover:border-blue-400';
            if (isAnswered && isCorrect) {
              btnClasses = 'bg-emerald-950/70 border-emerald-500 ring-4 ring-emerald-500/40';
            } else if (isAnswered && isSelected && !isCorrect) {
              btnClasses = 'bg-slate-800 border-slate-700 opacity-50';
            }
          } else {
            btnClasses = 'bg-white border-slate-200 text-slate-900 shadow-sm hover:border-blue-400';
            if (isAnswered && isCorrect) {
              btnClasses = 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-400/40 text-emerald-900';
            } else if (isAnswered && isSelected && !isCorrect) {
              btnClasses = 'bg-slate-50 border-slate-200 opacity-50';
            }
          }

          return (
            <button
              key={basketIndex}
              onClick={() => handleBasketClick(basketIndex)}
              disabled={isAnswered}
              className={`min-h-[110px] rounded-3xl border-3 flex flex-col items-center justify-center p-3 text-center transition-all ${btnClasses} ${
                !isAnswered
                  ? 'hover:scale-105 active:scale-95 cursor-pointer'
                  : 'cursor-default'
              }`}
            >
              <span className="text-xl sm:text-2xl font-bold">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Banner or Advance to Sub-Trial 2 Button */}
      <div className="w-full min-h-[90px] flex items-center justify-center mt-4">
        {feedback && (
          <div className="w-full max-w-xl flex flex-col items-center gap-3">
            <div
              className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
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
                <p className="text-sm opacity-80 mt-0.5">
                  {subTrial === 1
                    ? language === 'he'
                      ? 'כעת שימו לב: הכלל עומד להשתנות!'
                      : 'Notice: The rule is about to change!'
                    : t.waitingAnswer}
                </p>
              </div>
            </div>

            {subTrial === 1 && (
              <button
                onClick={handleAdvanceToSubTrial2}
                className={`min-h-[58px] px-8 rounded-2xl font-bold text-lg shadow-md transition-transform active:scale-95 ${
                  highContrast
                    ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                    : 'bg-blue-800 text-white hover:bg-blue-900'
                }`}
              >
                {language === 'he' ? 'המשך לשינוי הכלל ➡️' : 'Continue to Rule Change ➡️'}
              </button>
            )}
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
