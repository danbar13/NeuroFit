import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Sparkles, ArrowRight, ArrowLeft, Heart, CheckCircle2 } from 'lucide-react';
import type { ExerciseCategory } from '../../types/exercise';

interface IntermissionScreenProps {
  completedCategory: ExerciseCategory;
  nextCategory: ExerciseCategory;
  currentStep: number;
  totalSteps: number;
  onProceed: () => void;
}

export const IntermissionScreen: React.FC<IntermissionScreenProps> = ({
  completedCategory,
  nextCategory,
  currentStep,
  totalSteps,
  onProceed,
}) => {
  const { theme, highContrast, language } = useAccessibility();
  const isRtl = language === 'he';

  const categoryNames: Record<ExerciseCategory, { he: string; en: string }> = {
    memory: { he: 'זיכרון עבודה', en: 'Working Memory' },
    attention: { he: 'קשב וסריקה חזותית', en: 'Visual Attention' },
    speed: { he: 'מהירות עיבוד וגמישות', en: 'Processing Speed' },
    language: { he: 'שליפה מילולית', en: 'Language & Retrieval' },
  };

  const completedName = categoryNames[completedCategory][language];
  const nextName = categoryNames[nextCategory][language];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-6 px-4 text-center animate-fadeIn">
      {/* Icon Badge */}
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg transition-transform transform hover:scale-105 ${
          highContrast
            ? 'bg-yellow-400 text-black'
            : theme === 'dark'
            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
            : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
        }`}
      >
        <Sparkles className="w-10 h-10" />
      </div>

      {/* Main Title */}
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight">
        {language === 'he' ? 'עבודה מצוינת! כל הכבוד!' : 'Great Job! Well Done!'}
      </h2>

      {/* Subtitle */}
      <p
        className={`text-lg sm:text-xl font-medium max-w-md mx-auto mb-6 ${
          highContrast
            ? 'text-yellow-200'
            : theme === 'dark'
            ? 'text-slate-300'
            : 'text-slate-600'
        }`}
      >
        {language === 'he'
          ? `השלמת בהצלחה את שלב ${completedName}. קחו נשימה עמוקה, שתו שלוק מים, ונתקדם בקצב שלכם.`
          : `You successfully finished ${completedName}. Take a deep breath, drink some water, and proceed whenever you are ready.`}
      </p>

      {/* Progress pill */}
      <div
        className={`w-full py-4 px-6 rounded-2xl mb-8 border flex items-center justify-between transition-colors ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 text-slate-200 border-slate-800'
            : 'bg-white text-slate-700 border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider block opacity-70">
              {language === 'he' ? 'הושלם' : 'Completed'}
            </span>
            <span className="font-bold text-base sm:text-lg">{completedName}</span>
          </div>
        </div>

        <div className="text-left">
          <span className="text-xs font-bold uppercase tracking-wider block opacity-70 text-blue-500">
            {language === 'he' ? `התרגיל הבא (${currentStep + 1}/${totalSteps})` : `Next (${currentStep + 1}/${totalSteps})`}
          </span>
          <span className="font-bold text-base sm:text-lg text-blue-600 dark:text-blue-400">{nextName}</span>
        </div>
      </div>

      {/* Calming Tip */}
      <div className="flex items-center justify-center gap-2 mb-8 text-sm opacity-80">
        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
        <span>
          {language === 'he'
            ? 'זכרו: אין שעון שסופר לאחור. אתם קובעים את הקצב!'
            : 'Remember: No countdown timers. You dictate the pace!'}
        </span>
      </div>

      {/* Primary Next Button (min 64px for senior ergonomics) */}
      <button
        onClick={onProceed}
        className={`w-full sm:w-auto min-w-[280px] min-h-[64px] px-8 py-4 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all transform active:scale-95 cursor-pointer ${
          highContrast
            ? 'bg-yellow-400 text-black hover:bg-yellow-300 font-black border-2 border-yellow-300'
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
        }`}
      >
        <span>
          {language === 'he' ? 'מוכן/ה, בואו נמשיך!' : "I'm Ready, Let's Continue!"}
        </span>
        {isRtl ? <ArrowLeft className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
      </button>
    </div>
  );
};
