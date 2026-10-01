import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { Play, Sparkles } from 'lucide-react';

interface ExerciseBriefModalProps {
  title: string;
  categoryName?: string;
  levelNumber?: number;
  instructions: string;
  scientificTip?: string;
  scientificProtocol?: string;
  isOpen?: boolean;
  onStart: () => void;
}

export const ExerciseBriefModal: React.FC<ExerciseBriefModalProps> = ({
  title,
  categoryName,
  levelNumber = 1,
  instructions,
  scientificTip,
  scientificProtocol,
  isOpen = true,
  onStart,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const isRtl = language === 'he';

  if (!isOpen) return null;

  const tipText = scientificTip || scientificProtocol || (language === 'he' ? 'אימון נוירופסיכולוגי מבוסס מדע' : 'Validated Neuropsychological Protocol');

  const handleStart = () => {
    audioManager.playSuccess(soundEnabled);
    onStart();
  };

  return (
    <div className="w-full max-w-xl mx-auto my-auto p-6 sm:p-8 rounded-3xl border-2 shadow-2xl transition-all animate-fadeIn">
      <div
        className={`p-6 sm:p-8 rounded-3xl border-2 ${
          highContrast
            ? 'bg-black border-yellow-400 text-white'
            : theme === 'dark'
            ? 'bg-slate-900 border-slate-700 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Category & Level Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <span
            className={`px-4 py-1.5 rounded-full text-base font-extrabold uppercase tracking-wide border ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300'
                : 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 border-primary-200 dark:border-primary-800'
            }`}
          >
            {categoryName || (language === 'he' ? 'אימון מוחי' : 'Cognitive Training')}
          </span>
          <span
            className={`px-3 py-1 rounded-xl text-base font-bold ${
              highContrast ? 'text-yellow-300' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {language === 'he' ? `רמה ${levelNumber}` : `Level ${levelNumber}`}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight leading-snug">
          {title}
        </h2>

        {/* Instructions */}
        <div
          className={`p-5 rounded-2xl mb-6 text-xl sm:text-2xl font-bold leading-relaxed border-2 ${
            highContrast
              ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
              : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
          }`}
        >
          {instructions}
        </div>

        {/* Scientific Benefit / Tip */}
        <div
          className={`p-4 rounded-2xl mb-8 flex items-start gap-3 border text-base sm:text-lg ${
            highContrast
              ? 'bg-yellow-950/40 border-yellow-500/60 text-yellow-200'
              : 'bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800 text-primary-900 dark:text-primary-200'
          }`}
        >
          <Sparkles className="w-6 h-6 shrink-0 mt-0.5 text-primary-600 dark:text-primary-400" />
          <p className="font-medium">{tipText}</p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          autoFocus
          className={`w-full py-5 px-8 rounded-2xl text-2xl sm:text-3xl font-black flex items-center justify-center gap-3 shadow-xl transform active:scale-95 transition-all cursor-pointer ${
            highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300 ring-4 ring-yellow-400/40'
              : 'bg-primary-600 hover:bg-primary-500 text-white ring-4 ring-primary-500/30'
          }`}
        >
          <Play className="w-8 h-8 fill-current" />
          <span>{language === 'he' ? 'הבנתי, בואו נתחיל!' : "I'm Ready, Start!"}</span>
        </button>

        <p className="text-center text-sm font-semibold text-slate-400 mt-3">
          {language === 'he'
            ? 'השעון ומהלך התרגיל יתחילו רק ברגע הלחיצה'
            : 'The timer and exercise will only start upon clicking'}
        </p>
      </div>
    </div>
  );
};
