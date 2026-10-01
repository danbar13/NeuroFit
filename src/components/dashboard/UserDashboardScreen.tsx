import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useGamification } from '../../context/GamificationContext';
import { ExerciseHeader } from '../exercise/ExerciseHeader';
import { AccessibilityModal } from '../accessibility/AccessibilityModal';
import { BadgeGallery } from './BadgeGallery';
import { getStoredCognitiveProfile } from '../../lib/workoutService';
import type { CognitiveProfile, UserProfile } from '../../types/database';
import {
  Flame,
  CalendarCheck,
  Brain,
  Eye,
  Zap,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Play,
  Users,
  Settings as SettingsIcon,
} from 'lucide-react';

interface UserDashboardScreenProps {
  currentUser?: UserProfile | null;
  onReturnToHome: () => void;
  onStartDailyWorkout?: () => void;
  onOpenFamilyDashboard?: () => void;
  onOpenSettings?: () => void;
}

export const UserDashboardScreen: React.FC<UserDashboardScreenProps> = ({
  currentUser,
  onReturnToHome,
  onStartDailyWorkout,
  onOpenFamilyDashboard,
  onOpenSettings,
}) => {
  const { theme, highContrast, language } = useAccessibility();
  const { totalCoins, currentStreak, userBadges } = useGamification();

  const [profile, setProfile] = useState<CognitiveProfile>(() => getStoredCognitiveProfile(currentUser?.user_id));
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);

  useEffect(() => {
    setProfile(getStoredCognitiveProfile(currentUser?.user_id));
  }, [currentUser?.user_id]);

  const isRtl = language === 'he';
  const displayName = currentUser?.display_name || (language === 'he' ? 'מתאמן יקר' : 'Trainee');
  const avatarLetter = (displayName.trim()[0] || 'מ').toUpperCase();

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-150 ${
        highContrast
          ? 'bg-black text-white'
          : theme === 'dark'
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. Sticky Header */}
      <ExerciseHeader
        currentStep={1}
        totalSteps={4}
        title={language === 'he' ? 'הפרופיל וההישגים שלי' : 'My Profile & Badges'}
        hideProgress={true}
        onHome={onReturnToHome}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpenGamification={() => onOpenFamilyDashboard?.()}
        onOpenSettings={onOpenSettings}
      />

      {/* 2. Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-6 max-w-4xl w-full mx-auto animate-fadeIn space-y-6">
        {/* Top Profile Greeting Card */}
        <div
          className={`w-full p-6 sm:p-7 rounded-3xl border-2 shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md shrink-0 ${
                highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gradient-to-tr from-emerald-500 to-teal-600'
              }`}
            >
              {avatarLetter}
            </div>

            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider block opacity-75">
                {language === 'he' ? 'כרטיס מתאמן אישי' : 'Personal Trainee Card'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight truncate">
                {language === 'he' ? `שלום, ${displayName}!` : `Hello, ${displayName}!`}
              </h1>
              <p
                className={`text-sm sm:text-base font-medium ${
                  highContrast ? 'text-yellow-200' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {language === 'he'
                  ? 'חברה במועדון המוח של משפחת ברקאי • מתאמנת בהתמדה'
                  : 'Member of Barkai Family Brain Club • Dedicated Trainee'}
              </p>
            </div>
          </div>

          {/* Quick buttons: Family Club + Settings */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
            {onOpenFamilyDashboard && (
              <button
                onClick={onOpenFamilyDashboard}
                className={`px-4 py-2.5 rounded-xl border-2 font-bold text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm ${
                  highContrast
                    ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400/20'
                    : 'border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{language === 'he' ? 'מועדון המשפחה 👥' : 'Family Club 👥'}</span>
              </button>
            )}

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className={`px-4 py-2.5 rounded-xl border-2 font-bold text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm ${
                  highContrast
                    ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400/20'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>{language === 'he' ? 'הגדרות ופרופיל' : 'Settings & Profile'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: High-Level Consistency Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {/* Streak Card */}
          <div
            className={`p-5 rounded-2xl border-2 text-center transition-all shadow-sm flex flex-col justify-between ${
              highContrast
                ? 'bg-black text-yellow-300 border-yellow-400'
                : theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-orange-400'
                : 'bg-orange-50/80 border-orange-200 text-orange-950'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-2 bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400">
              <Flame className="w-7 h-7 fill-current animate-pulse" />
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black block tracking-tight">
                {currentStreak}
              </span>
              <span className="text-sm font-bold uppercase tracking-wider opacity-80 block mt-1">
                {language === 'he' ? 'ימי אימון ברצף' : 'Day Streak'}
              </span>
            </div>
            <span className="text-xs font-semibold opacity-70 mt-2 block">
              {language === 'he' ? 'התמדה ללא הפסקה' : 'Unbroken habit'}
            </span>
          </div>

          {/* Total Sparks Card */}
          <div
            className={`p-5 rounded-2xl border-2 text-center transition-all shadow-sm flex flex-col justify-between ${
              highContrast
                ? 'bg-black text-yellow-300 border-yellow-400'
                : theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-amber-400'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-2 bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
              <span className="text-2xl">🪙</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black block tracking-tight">
                {totalCoins}
              </span>
              <span className="text-sm font-bold uppercase tracking-wider opacity-80 block mt-1">
                {language === 'he' ? 'סך נקודות Sparks' : 'Total Sparks'}
              </span>
            </div>
            <span className="text-xs font-semibold opacity-70 mt-2 block">
              {language === 'he' ? '+50 בכל אימון יומי' : '+50 per daily workout'}
            </span>
          </div>

          {/* Sessions Completed Card */}
          <div
            className={`p-5 rounded-2xl border-2 text-center transition-all shadow-sm flex flex-col justify-between ${
              highContrast
                ? 'bg-black text-yellow-300 border-yellow-400'
                : theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-emerald-400'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black block tracking-tight">
                14
              </span>
              <span className="text-sm font-bold uppercase tracking-wider opacity-80 block mt-1">
                {language === 'he' ? 'אימונים שהושלמו' : 'Completed Sessions'}
              </span>
            </div>
            <span className="text-xs font-semibold opacity-70 mt-2 block">
              {language === 'he' ? 'רזרבה קוגניטיבית בריאה' : 'Healthy cognitive reserve'}
            </span>
          </div>
        </div>

        {/* Cognitive Pillars (DDA Levels) */}
        <div
          className={`w-full p-5 sm:p-6 rounded-3xl border-2 shadow-sm transition-all ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-blue-500" />
            <span>
              {language === 'he' ? 'עמודי התווך הקוגניטיביים שלך (רמות DDA)' : 'Cognitive Pillars (DDA Levels)'}
            </span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {/* Memory */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
              <Brain className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold block opacity-75">
                {language === 'he' ? 'זיכרון' : 'Memory'}
              </span>
              <span className="text-xl font-black block text-blue-700 dark:text-blue-300">
                {language === 'he' ? `רמה ${profile.memory_level}` : `Level ${profile.memory_level}`}
              </span>
            </div>

            {/* Attention */}
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800">
              <Eye className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold block opacity-75">
                {language === 'he' ? 'קשב' : 'Attention'}
              </span>
              <span className="text-xl font-black block text-purple-700 dark:text-purple-300">
                {language === 'he' ? `רמה ${profile.attention_level}` : `Level ${profile.attention_level}`}
              </span>
            </div>

            {/* Speed */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
              <Zap className="w-5 h-5 mx-auto mb-1 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold block opacity-75">
                {language === 'he' ? 'מהירות' : 'Speed'}
              </span>
              <span className="text-xl font-black block text-amber-700 dark:text-amber-300">
                {language === 'he' ? `רמה ${profile.speed_level}` : `Level ${profile.speed_level}`}
              </span>
            </div>

            {/* Language */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
              <BookOpen className="w-5 h-5 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold block opacity-75">
                {language === 'he' ? 'שפה' : 'Language'}
              </span>
              <span className="text-xl font-black block text-emerald-700 dark:text-emerald-300">
                {language === 'he' ? `רמה ${profile.language_level}` : `Level ${profile.language_level}`}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom: The Badge Gallery */}
        <div
          className={`w-full p-6 sm:p-7 rounded-3xl border-2 shadow-lg transition-all ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <BadgeGallery userBadges={userBadges} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
          <button
            onClick={onReturnToHome}
            className={`flex-1 min-h-[64px] px-8 py-4 rounded-2xl text-xl font-black flex items-center justify-center gap-3 shadow-lg transition-all transform active:scale-95 cursor-pointer ${
              highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-yellow-200'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
            }`}
          >
            {isRtl ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
            <span>{language === 'he' ? 'חזרה לדף הבית' : 'Return to Home'}</span>
          </button>

          {onStartDailyWorkout && (
            <button
              onClick={onStartDailyWorkout}
              className={`sm:w-auto min-h-[64px] px-8 py-4 rounded-2xl text-xl font-black flex items-center justify-center gap-3 border-2 transition-all transform active:scale-95 cursor-pointer shadow-sm ${
                highContrast
                  ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400/20'
                  : theme === 'dark'
                  ? 'border-emerald-600 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40'
                  : 'border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Play className="w-6 h-6 fill-current" />
              <span>{language === 'he' ? 'התחל אימון יומי' : 'Start Workout'}</span>
            </button>
          )}
        </div>
      </main>

      {/* Accessibility Modal */}
      <AccessibilityModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />
    </div>
  );
};
