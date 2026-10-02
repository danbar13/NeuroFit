import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { ExerciseHeader } from '../exercise/ExerciseHeader';
import { AccessibilityModal } from '../accessibility/AccessibilityModal';
import { adminUserService } from '../../lib/adminUserService';
import {
  Brain,
  Sparkles,
  User,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Shield,
  Users,
  FastForward,
} from 'lucide-react';
import type { UserProfile } from '../../types/database';

interface AuthScreenProps {
  onAuthenticated: (user: UserProfile, skipBaseline?: boolean) => void;
  onOpenAdmin?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated, onOpenAdmin }) => {
  const { theme, highContrast, language } = useAccessibility();
  const isRtl = language === 'he';

  const [displayName, setDisplayName] = useState('');
  const [birthYear, setBirthYear] = useState('1954');
  const [skipCalibration, setSkipCalibration] = useState(true);
  const [existingUsers, setExistingUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  useEffect(() => {
    adminUserService.getAllUsers().then(setExistingUsers).catch(() => {});
  }, []);

  const handleSelectExistingUser = (user: UserProfile) => {
    onAuthenticated(user, true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = displayName.trim();
    if (!cleanName) {
      setError(language === 'he' ? 'אנא הזינו את שמכם כדי שנוכל להתחיל' : 'Please enter your name to begin');
      return;
    }

    // Check if name matches an existing registered user
    const matched = existingUsers.find(
      (u) => u.display_name.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (matched) {
      onAuthenticated(matched, skipCalibration);
      return;
    }

    const yearNum = parseInt(birthYear, 10);
    if (isNaN(yearNum) || yearNum < 1920 || yearNum > 2015) {
      setError(language === 'he' ? 'אנא בחרו שנת לידה תקינה' : 'Please enter a valid birth year');
      return;
    }

    const newUser: UserProfile = {
      user_id: `user_${Date.now()}`,
      display_name: cleanName,
      birth_year: yearNum,
      total_coins: 0,
      current_streak: 0,
      family_group_id: 'group_barkai',
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onAuthenticated(newUser, skipCalibration);
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
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpenAdmin={onOpenAdmin}
      />

      {/* 2. Main Content Card */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 w-full">
        <div
          className={`w-full max-w-lg p-5 sm:p-8 rounded-3xl shadow-2xl border transition-all ${
            highContrast
              ? 'bg-black border-4 border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          {/* Admin Portal Banner / Button */}
          {onOpenAdmin && (
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={onOpenAdmin}
                className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>{language === 'he' ? 'כניסת מנהל מערכת (Admin) 🛡️' : 'Admin Portal 🛡️'}</span>
              </button>
            </div>
          )}

          {/* Brand Icon & Heading */}
          <div className="flex flex-col items-center text-center mb-6">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${
                highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-primary-600 text-white'
              }`}
            >
              <Brain className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'he' ? 'ברוכים הבאים ל-NeuroFit' : 'Welcome to NeuroFit'}
            </h1>
            <p
              className={`mt-1.5 text-base sm:text-lg ${
                highContrast ? 'text-yellow-200' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {language === 'he'
                ? 'אימון קוגניטיבי מותאם אישית ומבוסס מדע'
                : 'Scientifically-backed personalized brain training'}
            </p>
          </div>

          {/* Quick Login for Existing Users */}
          {existingUsers.length > 0 && (
            <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  {language === 'he' ? 'מתאמנים רשומים – התחברות מהירה בקליק:' : 'Existing Trainees - Quick Login:'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {existingUsers.slice(0, 4).map((u) => (
                  <button
                    key={u.user_id}
                    type="button"
                    onClick={() => handleSelectExistingUser(u)}
                    className="flex items-center gap-2 p-2 rounded-xl border text-right transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {u.display_name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-bold truncate text-slate-900 dark:text-white">
                        {u.display_name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {u.total_coins} 🪙 • רצף {u.current_streak}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Welcome Message */}
          <div
            className={`p-3.5 rounded-2xl mb-6 text-sm sm:text-base border ${
              highContrast
                ? 'bg-yellow-950/40 border-yellow-400 text-yellow-300'
                : 'bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800 text-primary-900 dark:text-primary-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-primary-600 dark:text-primary-400" />
              <p>
                {language === 'he'
                  ? 'הזינו את שמכם כדי להתחבר או להירשם. ניתן לדלג על מבדק הכיול ולהיכנס ישירות לאפליקציה.'
                  : 'Enter your name to log in or register. You can skip the calibration assessment and jump straight to the app.'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-base sm:text-lg font-bold mb-1.5">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-500" />
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
                placeholder={language === 'he' ? 'לדוגמה: סבתא שרה, דוד' : 'e.g. Sarah, David'}
                className={`w-full px-4 py-3 rounded-xl text-lg font-medium border-2 transition-all outline-none ${
                  highContrast
                    ? 'bg-black border-yellow-400 text-white focus:ring-4 focus:ring-yellow-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                }`}
                autoFocus
              />
            </div>

            {/* Birth Year */}
            <div>
              <label className="block text-base sm:text-lg font-bold mb-1.5">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
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
                className={`w-full px-4 py-3 rounded-xl text-lg font-medium border-2 transition-all outline-none ${
                  highContrast
                    ? 'bg-black border-yellow-400 text-white focus:ring-4 focus:ring-yellow-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                }`}
              />
            </div>

            {/* Skip Calibration Checkbox */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={skipCalibration}
                onChange={(e) => setSkipCalibration(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                {language === 'he'
                  ? 'כניסה ישירה לדף הבית (עקיפת מבדק כיול ראשוני)'
                  : 'Direct entry to dashboard (skip baseline assessment)'}
              </span>
            </label>

            {error && (
              <div
                className={`p-3 rounded-xl font-bold text-sm text-center ${
                  highContrast ? 'bg-red-900 text-white border-2 border-red-500' : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                }`}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-4 rounded-2xl text-xl font-black flex items-center justify-center gap-2.5 shadow-lg transform active:scale-98 transition-all cursor-pointer ${
                highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-primary-600 hover:bg-primary-500 text-white'
              }`}
            >
              {skipCalibration ? (
                <>
                  <FastForward className="w-5 h-5 rtl:rotate-180" />
                  <span>{language === 'he' ? 'התחברות ישירה לדף הבית' : 'Enter Dashboard Directly'}</span>
                </>
              ) : (
                <>
                  <span>{language === 'he' ? 'הרשמה והמשך למבדק ההערכה' : 'Register & Start Assessment'}</span>
                  {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </>
              )}
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
