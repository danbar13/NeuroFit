import React from 'react';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';

interface ExerciseFooterProps {
  showNext: boolean;
  onNext: () => void;
  onOpenRationale: () => void;
  nextButtonLabel?: string;
}

export const ExerciseFooter: React.FC<ExerciseFooterProps> = ({
  showNext,
  onNext,
  onOpenRationale,
  nextButtonLabel,
}) => {
  const { theme, highContrast, soundEnabled, t } = useAccessibility();

  const finalLabel = nextButtonLabel || t.nextExercise;

  return (
    <footer
      className={`sticky bottom-0 z-40 w-full px-4 sm:px-6 py-4 border-t-2 shadow-lg transition-colors ${
        highContrast
          ? 'bg-black text-white border-yellow-400'
          : theme === 'dark'
          ? 'bg-slate-900 text-slate-100 border-slate-800'
          : 'bg-white text-gray-900 border-gray-200'
      }`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Left / Center Area: Next Button (Appears ONLY after interaction feedback) */}
        <div className="flex-1 max-w-md">
          {showNext ? (
            <button
              onClick={() => {
                audioManager.playTap(soundEnabled);
                onNext();
              }}
              aria-label={finalLabel}
              className={`w-full min-h-[64px] px-8 py-3 rounded-2xl font-bold text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-md transition-all active:scale-95 animate-bounce-short ${
                highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300 ring-4 ring-yellow-400/40'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800 ring-4 ring-emerald-600/30'
              }`}
            >
              <span>{finalLabel}</span>
              <ArrowRight className="w-8 h-8 stroke-[2.5] rtl:rotate-180" />
            </button>
          ) : (
            <div
              className={`min-h-[64px] flex items-center px-4 rounded-2xl border-2 border-dashed ${
                highContrast
                  ? 'border-gray-700 text-gray-400'
                  : theme === 'dark'
                  ? 'border-slate-800 text-slate-400'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              <span className="text-base sm:text-lg italic">
                {t.waitingAnswer}
              </span>
            </div>
          )}
        </div>

        {/* Right: Scientific Rationale Button (💡) */}
        <button
          onClick={() => {
            audioManager.playTap(soundEnabled);
            onOpenRationale();
          }}
          aria-label={t.whyThisHelps}
          title={t.whyThisHelps}
          className={`min-w-[64px] min-h-[64px] px-4 rounded-2xl flex items-center justify-center font-bold gap-2.5 border-2 transition-transform active:scale-95 shrink-0 ${
            highContrast
              ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-400/20'
              : theme === 'dark'
              ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
              : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
          }`}
        >
          <Lightbulb className="w-7 h-7 text-amber-500 fill-amber-400" />
          <span className="hidden sm:inline text-base sm:text-lg font-semibold">
            {t.whyThisHelps}
          </span>
        </button>
      </div>
    </footer>
  );
};
