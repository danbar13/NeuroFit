import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useGamification } from '../../context/GamificationContext';
import { ExerciseHeader } from '../exercise/ExerciseHeader';
import { AccessibilityModal } from '../accessibility/AccessibilityModal';
import { FamilyCoopModal } from '../gamification/FamilyCoopModal';
import { CoinRewardModal } from '../gamification/CoinRewardModal';
import { BadgeUnlockedModal } from '../gamification/BadgeUnlockedModal';
import { NotificationToast } from '../gamification/NotificationToast';
import { getStoredCognitiveProfile } from '../../lib/workoutService';
import type { CognitiveProfile } from '../../types/database';
import {
  Play,
  Brain,
  Eye,
  Zap,
  BookOpen,
  RotateCcw,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle,
  Trophy,
  Settings as SettingsIcon,
} from 'lucide-react';

interface HomeDashboardProps {
  onStartDailyWorkout: () => void;
  onStartBaseline: () => void;
  onOpenCatalog?: () => void;
  onOpenFamilyDashboard?: () => void;
  onOpenUserDashboard?: () => void;
  onOpenSettings?: () => void;
  onOpenAdmin?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onStartDailyWorkout,
  onStartBaseline,
  onOpenCatalog,
  onOpenFamilyDashboard,
  onOpenUserDashboard,
  onOpenSettings,
  onOpenAdmin,
}) => {
  const { theme, highContrast, language } = useAccessibility();
  const {
    currentStreak,
    familyMembers,
    userBadges,
    lastSessionReward,
    newlyUnlockedBadge,
    activeNotification,
    dismissNotification,
    dismissRewardModal,
    dismissBadgeModal,
  } = useGamification();

  const [profile, setProfile] = useState<CognitiveProfile>(getStoredCognitiveProfile);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setProfile(getStoredCognitiveProfile());
  }, []);

  const isRtl = language === 'he';

  const weeklyCoins = familyMembers.reduce((sum, m) => sum + m.weekly_coins, 0);
  const weeklyGoal = 2000;

  const handleOpenFamily = () => {
    if (onOpenFamilyDashboard) {
      onOpenFamilyDashboard();
    } else {
      setIsFamilyModalOpen(true);
    }
  };

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
      {/* 1. Header */}
      <ExerciseHeader
        currentStep={1}
        totalSteps={4}
        title={language === 'he' ? 'דף הבית' : 'Home'}
        hideProgress={true}
        isHome={true}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpenGamification={handleOpenFamily}
        onOpenSettings={onOpenSettings}
      />

      {/* 2. Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-6 max-w-4xl w-full mx-auto animate-fadeIn">
        {/* Welcome Greeting */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="text-center sm:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'he' ? 'אימון מוח מותאם אישית' : 'Personalized Cognitive Fitness'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {language === 'he' ? 'שלום, סבתא שרה!' : 'Welcome, Grandma Sarah!'}
            </h1>
            <p
              className={`text-lg sm:text-xl font-medium mt-1 ${
                highContrast ? 'text-yellow-200' : theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {language === 'he'
                ? 'מוכנים לאימון היומי שלכם? 4 משחקונים קצרים לחיזוק הזיכרון והריכוז.'
                : 'Ready for today’s workout? 4 short, stress-free games for your memory and focus.'}
            </p>
          </div>

          {/* Action Buttons: Profile & Badges + Settings */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0 self-center sm:self-auto">
            {onOpenUserDashboard && (
              <button
                onClick={onOpenUserDashboard}
                className={`px-4 sm:px-5 py-3.5 rounded-2xl border-2 font-black text-base flex items-center justify-center gap-2.5 transition-all transform active:scale-95 cursor-pointer shadow-sm ${
                  highContrast
                    ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400/20'
                    : theme === 'dark'
                    ? 'border-amber-600/70 bg-amber-950/40 text-amber-300 hover:bg-amber-900/40'
                    : 'border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                <span>
                  {language === 'he' ? `הפרופיל שלי (${userBadges.length})` : `My Profile (${userBadges.length})`}
                </span>
              </button>
            )}

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                aria-label={language === 'he' ? 'הגדרות ופרופיל' : 'Settings & Profile'}
                title={language === 'he' ? 'הגדרות ופרופיל' : 'Settings & Profile'}
                className={`px-4 py-3.5 rounded-2xl border-2 font-black text-base flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer shadow-sm ${
                  highContrast
                    ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400/20'
                    : theme === 'dark'
                    ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                }`}
              >
                <SettingsIcon className="w-5 h-5 shrink-0" />
                <span className="hidden sm:inline">
                  {language === 'he' ? 'הגדרות' : 'Settings'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* PRIMARY CALL TO ACTION: START DAILY WORKOUT */}
        <div
          className={`w-full p-6 sm:p-8 rounded-3xl mb-8 border-2 shadow-xl transition-all ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : theme === 'dark'
              ? 'bg-gradient-to-br from-blue-950/80 to-slate-900 border-blue-800'
              : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-transparent'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center sm:text-right">
              <span
                className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3 ${
                  highContrast
                    ? 'bg-yellow-400 text-black'
                    : 'bg-white/20 text-white'
                }`}
              >
                {language === 'he' ? 'האימון המרכזי להיום' : "Today's Core Workout"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mb-2">
                {language === 'he' ? 'אימון יומי מותאם אישית' : 'Personalized Daily Workout'}
              </h2>
              <p className="text-base sm:text-lg opacity-90 max-w-lg mb-4">
                {language === 'he'
                  ? '4 תרגילים בקצב שלכם • ללא שעון עצר מלחיץ • +50 Sparks לצבירה משותפת'
                  : '4 exercises at your own pace • No countdown timers • +50 Sparks for family goal'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-semibold opacity-95">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  {language === 'he' ? 'מותאם לרמתכם (DDA)' : 'Dynamically Tuned (DDA)'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  {language === 'he' ? `רצף ${currentStreak} ימים` : `${currentStreak} Day Streak`}
                </span>
              </div>
            </div>

            {/* Launch Button (Massive interactive target >= 64px) */}
            <button
              onClick={onStartDailyWorkout}
              className={`w-full sm:w-auto min-w-[240px] min-h-[68px] px-8 py-4 rounded-2xl text-xl font-black flex items-center justify-center gap-3 shadow-2xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-yellow-200'
                  : theme === 'dark'
                  ? 'bg-blue-500 hover:bg-blue-400 text-white'
                  : 'bg-white text-blue-900 hover:bg-blue-50'
              }`}
            >
              <Play className="w-7 h-7 fill-current" />
              <span>{language === 'he' ? 'התחל אימון יומי' : 'Start Daily Workout'}</span>
              {isRtl ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 3. Cognitive Profile (Current DDA Levels) */}
        <div className="w-full mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-500" />
              <span>{language === 'he' ? 'פרופיל קוגניטיבי נוכחי (DDA)' : 'Current Cognitive Profile (DDA)'}</span>
            </h2>
            <button
              onClick={onStartBaseline}
              className="text-sm font-bold flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'he' ? 'כיול ראשוני מחדש' : 'Recalibrate Baseline'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Memory */}
            <div
              className={`p-4 rounded-2xl border text-center transition-all shadow-sm ${
                highContrast
                  ? 'bg-black text-yellow-300 border-yellow-400'
                  : theme === 'dark'
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider block opacity-70">
                {language === 'he' ? 'זיכרון עבודה' : 'Memory'}
              </span>
              <span className="text-2xl font-extrabold mt-1 block">
                {language === 'he' ? `רמה ${profile.memory_level}` : `Level ${profile.memory_level}`}
              </span>
            </div>

            {/* Attention */}
            <div
              className={`p-4 rounded-2xl border text-center transition-all shadow-sm ${
                highContrast
                  ? 'bg-black text-yellow-300 border-yellow-400'
                  : theme === 'dark'
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider block opacity-70">
                {language === 'he' ? 'קשב חזותי' : 'Attention'}
              </span>
              <span className="text-2xl font-extrabold mt-1 block">
                {language === 'he' ? `רמה ${profile.attention_level}` : `Level ${profile.attention_level}`}
              </span>
            </div>

            {/* Speed */}
            <div
              className={`p-4 rounded-2xl border text-center transition-all shadow-sm ${
                highContrast
                  ? 'bg-black text-yellow-300 border-yellow-400'
                  : theme === 'dark'
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider block opacity-70">
                {language === 'he' ? 'מהירות עיבוד' : 'Speed'}
              </span>
              <span className="text-2xl font-extrabold mt-1 block">
                {language === 'he' ? `רמה ${profile.speed_level}` : `Level ${profile.speed_level}`}
              </span>
            </div>

            {/* Language */}
            <div
              className={`p-4 rounded-2xl border text-center transition-all shadow-sm ${
                highContrast
                  ? 'bg-black text-yellow-300 border-yellow-400'
                  : theme === 'dark'
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider block opacity-70">
                {language === 'he' ? 'שליפה מילולית' : 'Language'}
              </span>
              <span className="text-2xl font-extrabold mt-1 block">
                {language === 'he' ? `רמה ${profile.language_level}` : `Level ${profile.language_level}`}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Scientific Game Catalog Card (40 Games) */}
        {onOpenCatalog && (
          <div
            onClick={onOpenCatalog}
            className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm mb-4 ${
              highContrast
                ? 'bg-black text-yellow-300 border-yellow-400'
                : theme === 'dark'
                ? 'bg-slate-900 border-slate-800 hover:border-primary-500'
                : 'bg-white border-slate-200 hover:border-primary-400'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-lg block flex items-center gap-2">
                  <span>{language === 'he' ? 'ספריית המשחקים המדעית' : 'Scientific Game Catalog'}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-black">
                    40 {language === 'he' ? 'משחקים' : 'Games'}
                  </span>
                </span>
                <span className="text-sm opacity-80 font-medium">
                  {language === 'he'
                    ? '10 משחקים מדעיים ייחודיים בכל תחום (סטרופ, שבילים, דיג\'יט ספאן, אנלוגיות ועוד)'
                    : '10 distinct paradigms per domain (Stroop, TMT, Digit Span, Analogies, etc.)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                {language === 'he' ? 'לכל המשחקים' : 'Explore'}
              </span>
              {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </div>
          </div>
        )}

        {/* 5. Family Brain Club Preview Card */}
        <div
          onClick={handleOpenFamily}
          className={`w-full p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg block">
                {language === 'he' ? 'מועדון המוח של משפחת ברקאי' : 'Barkai Family Brain Club'}
              </span>
              <span className="text-sm opacity-80 font-medium">
                {language === 'he'
                  ? `יעד שבועי: ${weeklyCoins} מתוך ${weeklyGoal} 🪙 • לחצו לצפייה ועידוד`
                  : `Weekly Goal: ${weeklyCoins} of ${weeklyGoal} 🪙 • Click to cheer`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {language === 'he' ? 'פתיחה' : 'Open'}
            </span>
            {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>

        {/* 5. Admin Portal Shortcut (CMS) */}
        {onOpenAdmin && (
          <div className="w-full mt-6 pt-4 border-t border-slate-700/30 flex justify-center">
            <button
              onClick={onOpenAdmin}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/40 transition-colors"
            >
              <span>🛠️</span>
              <span>{language === 'he' ? 'ניהול תוכן למנהלים (CMS Admin)' : 'CMS Admin Panel'}</span>
            </button>
          </div>
        )}
      </main>

      {/* Modals & Overlays */}
      <AccessibilityModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />

      <FamilyCoopModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
      />

      <CoinRewardModal
        reward={lastSessionReward}
        onClose={dismissRewardModal}
      />

      <BadgeUnlockedModal
        badge={newlyUnlockedBadge}
        onClose={dismissBadgeModal}
      />

      <NotificationToast
        notification={activeNotification}
        onDismiss={dismissNotification}
      />
    </div>
  );
};
