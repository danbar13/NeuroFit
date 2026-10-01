import React from 'react';
import { Lightbulb, Check, Brain, HeartHandshake } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import type { ScientificRationaleInfo } from '../../types/exercise';
import { audioManager } from '../../lib/soundEffects';

interface ScientificRationaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rationale: ScientificRationaleInfo;
}

export const ScientificRationaleModal: React.FC<ScientificRationaleModalProps> = ({
  isOpen,
  onClose,
  rationale,
}) => {
  const { theme, highContrast, soundEnabled, language, t } = useAccessibility();

  if (!isOpen) return null;

  const isHe = language === 'he';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scientific-rationale-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div
        className={`w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl p-6 sm:p-8 shadow-2xl border-4 transition-all ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 text-slate-100 border-amber-500/50'
            : 'bg-white text-gray-900 border-amber-300'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b-2 border-current/20 shrink-0">
          <div
            className={`p-3.5 rounded-2xl ${
              highContrast
                ? 'bg-yellow-400 text-black'
                : theme === 'dark'
                ? 'bg-amber-950/70 text-amber-300 border border-amber-600'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            <Lightbulb className="w-8 h-8 fill-current" />
          </div>
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-current/70">
              {isHe ? 'רציונל מדעי ואימון קוגניטיבי' : 'Scientific Rationale & Cognitive Fitness'}
            </span>
            <h2 id="scientific-rationale-title" className="text-2xl sm:text-3xl font-extrabold">
              {rationale.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* What we train */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border-2 flex items-start gap-4 ${
              highContrast
                ? 'bg-gray-900 border-gray-700'
                : theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}
          >
            <Brain className="w-8 h-8 shrink-0 mt-0.5 text-current/80" />
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-1">
                {isHe ? 'מה אנחנו מאמנים?' : 'What We Train'}
              </h3>
              <p className="text-base sm:text-lg leading-relaxed">
                {rationale.what_we_train || rationale.benefitDescription}
              </p>
            </div>
          </div>

          {/* Daily benefit */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border-2 flex items-start gap-4 ${
              highContrast
                ? 'bg-gray-900 border-gray-700'
                : theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}
          >
            <HeartHandshake className="w-8 h-8 shrink-0 mt-0.5 text-blue-500" />
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-1">
                {isHe ? 'תועלת יומיומית' : 'Daily Life Benefit'}
              </h3>
              <p className="text-base sm:text-lg leading-relaxed">
                {rationale.daily_benefit || rationale.realWorldImpact}
              </p>
            </div>
          </div>
        </div>

        {/* Sticky/Fixed Footer Action */}
        <div className="pt-4 border-t-2 border-current/20 flex justify-end shrink-0">
          <button
            onClick={() => {
              audioManager.playTap(soundEnabled);
              onClose();
            }}
            className={`w-full sm:w-auto min-h-[64px] min-w-[200px] px-8 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${
              highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300 ring-2 ring-yellow-400'
                : theme === 'dark'
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-blue-800 text-white hover:bg-blue-900'
            }`}
          >
            <Check className="w-7 h-7" />
            <span>{t.gotItContinue}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
