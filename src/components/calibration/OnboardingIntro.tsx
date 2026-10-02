import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { baselineContentMatrix } from '../../data/baselineContentMatrix';
import { Brain, Heart, CheckCircle2, ShieldCheck, ArrowRight, FastForward } from 'lucide-react';

interface OnboardingIntroProps {
  onStart: () => void;
  onSkip?: () => void;
}

export const OnboardingIntro: React.FC<OnboardingIntroProps> = ({ onStart, onSkip }) => {
  const { theme, highContrast, soundEnabled, language, t } = useAccessibility();

  const matrixData = baselineContentMatrix[language].welcome_screen;

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-4 flex flex-col items-center text-center">
      {/* Friendly Brain Hero Badge */}
      <div
        className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-md transition-all ${
          highContrast
            ? 'bg-yellow-400 text-black'
            : theme === 'dark'
            ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
            : 'bg-blue-100 text-blue-800'
        }`}
      >
        <Brain className="w-14 h-14" />
      </div>

      {/* Main Title & Subtitle from Matrix */}
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
        {matrixData.title}
      </h1>

      {/* Reassuring Notification Box from baseline_test_content_matrix.md */}
      <div
        className={`w-full p-5 sm:p-7 rounded-3xl border-3 text-start mb-8 shadow-sm transition-all ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-800/90 text-slate-100 border-slate-700'
            : 'bg-blue-50/80 text-blue-950 border-blue-200'
        }`}
      >
        <div className="flex items-start gap-3 mb-4">
          <Heart className="w-8 h-8 text-rose-500 shrink-0 fill-rose-500/20 mt-1" />
          <p className="text-xl sm:text-2xl font-bold leading-relaxed">
            {matrixData.message}
          </p>
        </div>

        <ul className="space-y-3 mt-4 text-base sm:text-lg opacity-90 border-t pt-4 border-current/15">
          {t.onboardingBullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons: Start or Skip */}
      <div className="w-full max-w-md flex flex-col items-center gap-3">
        <button
          onClick={() => {
            audioManager.playSuccess(soundEnabled);
            onStart();
          }}
          className={`w-full min-h-[64px] px-8 rounded-3xl font-extrabold text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-xl transition-transform active:scale-95 animate-pulse cursor-pointer ${
            highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300 ring-4 ring-yellow-400/50'
              : 'bg-blue-800 text-white hover:bg-blue-900 ring-4 ring-blue-600/30'
          }`}
        >
          <span>{matrixData.start_button}</span>
          <ArrowRight className="w-7 h-7 rtl:rotate-180" />
        </button>

        {onSkip && (
          <button
            type="button"
            onClick={() => {
              audioManager.playTap(soundEnabled);
              onSkip();
            }}
            className={`w-full py-3.5 px-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
              highContrast
                ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400/20'
                : theme === 'dark'
                ? 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <FastForward className="w-5 h-5 rtl:rotate-180 text-blue-500" />
            <span>{language === 'he' ? 'דלג על מבדק הכיול והמשך ישירות לדף הבית' : 'Skip calibration & continue to dashboard'}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-6 text-sm opacity-70">
        <ShieldCheck className="w-5 h-5" />
        <span>{language === 'he' ? 'מבוסס מחקרים קוגניטיביים נוירו-פלסטיים של הגיל השלישי' : 'Scientifically backed neuroplastic cognitive training for seniors'}</span>
      </div>
    </div>
  );
};
