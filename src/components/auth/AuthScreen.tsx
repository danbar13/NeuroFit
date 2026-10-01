import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { ExerciseHeader } from '../exercise/ExerciseHeader';
import { AccessibilityModal } from '../accessibility/AccessibilityModal';
import { Brain, Sparkles, User, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import type { UserProfile } from '../../types/database';

interface AuthScreenProps {
  onAuthenticated: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const { theme, highContrast, language } = useAccessibility();
  const isRtl = language === 'he';

  const [displayName, setDisplayName] = useState('');
  const [birthYear, setBirthYear] = useState('1954');
  const [error, setError] = useState<string | null>(null);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError(language === 'he' ? 'אנא הזינו את שמכם כדי שנוכל להתחיל' : 'Please enter your name to begin');
      return;
    }

    const yearNum = parseInt(birthYear, 10);
    if (isNaN(yearNum) || yearNum < 1920 || yearNum > 2015) {
      setError(language === 'he' ? 'אנא בחרו שנת לידה תקינה' : 'Please enter a valid birth year');
      return;
    }

    const newUser: UserProfile = {
      user_id: `user_${Date.now()}`,
      display_name: displayName.trim(),
      birth_year: yearNum,
      total_coins: 0,
      current_streak: 0,
      family_group_id: 'group_barkai',
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onAuthenticated(newUser);
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-200 ${
        highContrast
          ? 'bg-black text-white'
          : theme === 'dark'
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 1. Global Navigation & Accessibility Controls */}
      <ExerciseHeader
        currentStep={1}
        totalSteps={1}
        hideProgress={true}
        title={language === 'he' ? 'ברוכים הבאים' : 'Welcome'}
        onPause={() => {}}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
      />

      {/* 2. Main Content Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div
          className={`w-full max-w-lg p-8 sm:p-10 rounded-3xl shadow-2xl border transition-all ${
            highContrast
              ? 'bg-black border-4 border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          {/* Brand Icon & Heading */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
                highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-primary-600 text-white'
              }`}
            >
              <Brain className="w-12 h-12" />
            </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {language === 'he' ? 'ברוכים הבאים ל-NeuroFit' : 'Welcome to NeuroFit'}
          </h1>
          <p
            className={`mt-2 text-lg sm:text-xl ${
              highContrast ? 'text-yellow-200' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {language === 'he'
              ? 'אימון קוגניטיבי מותאם אישית ומבוסס מדע'
              : 'Scientifically-backed personalized brain training'}
          </p>
        </div>

        {/* Welcome Message */}
        <div
          className={`p-4 rounded-2xl mb-6 text-base sm:text-lg border ${
            highContrast
              ? 'bg-yellow-950/40 border-yellow-400 text-yellow-300'
              : 'bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800 text-primary-900 dark:text-primary-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 shrink-0 mt-0.5 text-primary-600 dark:text-primary-400" />
            <p>
              {language === 'he'
                ? 'לפני שנצא לדרך, נכיר אתכם ונבצע מבדק הערכה קצר בן 4 תרגילים כדי לכייל את הרמה המתאימה בדיוק עבורכם.'
                : 'Before we begin, tell us a bit about yourself so we can calibrate the optimal difficulty with a 4-exercise baseline assessment.'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-xl font-bold mb-2">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                {language === 'he' ? 'מה שמכם הפרטי?' : 'What is your first name?'}
              </span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError(null);
              }}
              placeholder={language === 'he' ? 'לדוגמה: דניאל' : 'e.g. Daniel'}
              className={`w-full px-5 py-4 rounded-xl text-xl font-medium border-2 transition-all outline-none ${
                highContrast
                  ? 'bg-black border-yellow-400 text-white focus:ring-4 focus:ring-yellow-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
              }`}
              autoFocus
            />
          </div>

          {/* Birth Year */}
          <div>
            <label className="block text-xl font-bold mb-2">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                {language === 'he' ? 'שנת לידה' : 'Birth Year'}
              </span>
            </label>
            <input
              type="number"
              min="1920"
              max="2015"
              value={birthYear}
              onChange={(e) => {
                setBirthYear(e.target.value);
                setError(null);
              }}
              className={`w-full px-5 py-4 rounded-xl text-xl font-medium border-2 transition-all outline-none ${
                highContrast
                  ? 'bg-black border-yellow-400 text-white focus:ring-4 focus:ring-yellow-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
              }`}
            />
          </div>

          {error && (
            <div
              className={`p-3 rounded-xl font-bold text-base text-center ${
                highContrast ? 'bg-red-900 text-white border-2 border-red-500' : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
              }`}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-5 rounded-2xl text-2xl font-black flex items-center justify-center gap-3 shadow-lg transform active:scale-98 transition-all ${
              highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-primary-600 hover:bg-primary-500 text-white'
            }`}
          >
            <span>{language === 'he' ? 'הרשמה והמשך למבדק ההערכה' : 'Register & Start Assessment'}</span>
            {isRtl ? <ArrowLeft className="w-7 h-7" /> : <ArrowRight className="w-7 h-7" />}
          </button>
        </form>
      </div>
    </div>

      {/* Accessibility Modal */}
      <AccessibilityModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />
    </div>
  );
};
