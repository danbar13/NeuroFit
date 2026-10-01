import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useGamification } from '../../context/GamificationContext';
import { ExerciseHeader } from '../exercise/ExerciseHeader';
import { AccessibilityModal } from '../accessibility/AccessibilityModal';
import { BadgeUnlockedModal } from '../gamification/BadgeUnlockedModal';
import { CoinRewardModal } from '../gamification/CoinRewardModal';
import { NotificationToast } from '../gamification/NotificationToast';
import { CoopWeeklyGoal } from './CoopWeeklyGoal';
import { ConsistencyLeaderboard } from './ConsistencyLeaderboard';
import {
  Users,
  Copy,
  Check,
  Sparkles,
  Trophy,
  ArrowRight,
  ArrowLeft,
  BellRing,
  Play,
} from 'lucide-react';

interface FamilyDashboardScreenProps {
  onReturnToHome: () => void;
  onStartDailyWorkout?: () => void;
}

export const FamilyDashboardScreen: React.FC<FamilyDashboardScreenProps> = ({
  onReturnToHome,
  onStartDailyWorkout,
}) => {
  const { theme, highContrast, language } = useAccessibility();
  const {
    familyMembers,
    userBadges,
    lastSessionReward,
    newlyUnlockedBadge,
    activeNotification,
    triggerIncomingCheer,
    dismissNotification,
    dismissRewardModal,
    dismissBadgeModal,
  } = useGamification();

  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges'>('leaderboard');

  const isRtl = language === 'he';
  const inviteCode = 'BARKAI-BRAIN-2026';

  const handleCopyInviteCode = () => {
    navigator.clipboard?.writeText?.(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
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
      {/* 1. Header (Sticky) */}
      <ExerciseHeader
        currentStep={1}
        totalSteps={4}
        title={language === 'he' ? 'מועדון המוח המשפחתי' : 'Family Brain Club'}
        hideProgress={true}
        onHome={onReturnToHome}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpenGamification={() => {}}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col items-center px-4 py-6 max-w-4xl w-full mx-auto animate-fadeIn space-y-6">
        {/* Top Hero: Family Group Card & Invite Code */}
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
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
              }`}
            >
              <Users className="w-8 h-8" />
            </div>

            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider block opacity-75">
                {language === 'he' ? 'קבוצה משפחתית פעילה' : 'Active Family Group'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight truncate">
                {language === 'he' ? 'משפחת ברקאי' : 'Barkai Family'}
              </h1>
              <p
                className={`text-sm sm:text-base font-medium ${
                  highContrast ? 'text-yellow-200' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {language === 'he'
                  ? `${familyMembers.length} בני משפחה משתפים פעולה ומעודדים זה את זה`
                  : `${familyMembers.length} members collaborating and cheering each other`}
              </p>
            </div>
          </div>

          {/* Invite Code Pill */}
          <div className="flex flex-col sm:items-end gap-1 shrink-0">
            <span className="text-xs font-bold opacity-75">
              {language === 'he' ? 'קוד הצטרפות לקבוצה:' : 'Group Invite Code:'}
            </span>
            <button
              onClick={handleCopyInviteCode}
              aria-label="העתק קוד הזמנה"
              className={`px-4 py-2.5 rounded-xl border-2 font-mono font-bold text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm ${
                highContrast
                  ? 'bg-black text-yellow-300 border-yellow-400 hover:bg-yellow-400/20'
                  : copiedCode
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{inviteCode}</span>
              {copiedCode && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  {language === 'he' ? 'הועתק!' : 'Copied!'}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Controls: Co-op & Streaks vs Badges */}
        <div className="flex w-full gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-base sm:text-lg transition-all cursor-pointer ${
              activeTab === 'leaderboard'
                ? highContrast
                  ? 'bg-yellow-400 text-black shadow-md'
                  : 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {language === 'he' ? 'יעד משותף והתמדה 🎯' : 'Co-op Goal & Streaks 🎯'}
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-base sm:text-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'badges'
                ? highContrast
                  ? 'bg-yellow-400 text-black shadow-md'
                  : 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span>{language === 'he' ? `תגי הישג (${userBadges.length})` : `Badges (${userBadges.length})`}</span>
          </button>
        </div>

        {activeTab === 'leaderboard' && (
          <>
            {/* Requirement 1: Co-op Weekly Goal Component (Jar / Battery) */}
            <CoopWeeklyGoal members={familyMembers} targetWeeklyCoins={2000} />

            {/* Requirement 2 & 3: Consistency Leaderboard & Micro-Interactions */}
            <ConsistencyLeaderboard members={familyMembers} currentUserId="user_sarah" />

            {/* Requirement 3: Receiver Simulation / Testing Card */}
            <div
              className={`w-full p-5 rounded-2xl border transition-all ${
                highContrast
                  ? 'bg-black text-yellow-300 border-yellow-400'
                  : theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-800'
                  : 'bg-indigo-50/50 border-indigo-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-base block">
                      {language === 'he'
                        ? 'בדיקת קבלת חיזוק (In-App Toast)'
                        : 'Test Receiver Cheering Notification'}
                    </span>
                    <span className="text-xs sm:text-sm opacity-80 font-medium">
                      {language === 'he'
                        ? 'הדמיית התראה שמתקבלת כאשר בן משפחה מעודד אותך'
                        : 'Simulate receiving a cheering toast from a family member'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => triggerIncomingCheer('סבא דוד', 'heart')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm ${
                      highContrast
                        ? 'bg-yellow-400 text-black hover:bg-yellow-300 font-black'
                        : 'bg-rose-500 hover:bg-rose-600 text-white'
                    }`}
                  >
                    <span>❤️</span>
                    <span>{language === 'he' ? 'עידוד מסבא דוד' : 'Cheer from David'}</span>
                  </button>

                  <button
                    onClick={() => triggerIncomingCheer('רוני (בת)', 'clap')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm ${
                      highContrast
                        ? 'bg-yellow-400 text-black hover:bg-yellow-300 font-black'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    <span>👏</span>
                    <span>{language === 'he' ? 'כפיים מרוני' : 'Clap from Roni'}</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Badges Tab View */}
        {activeTab === 'badges' && (
          <div
            className={`w-full p-5 sm:p-7 rounded-3xl border-2 shadow-lg transition-all ${
              highContrast
                ? 'bg-black text-yellow-300 border-yellow-400'
                : theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-black flex items-center gap-2 mb-1">
                <Trophy className="w-6 h-6 text-amber-500" />
                <span>{language === 'he' ? 'ארון התגים וההישגים שלי' : 'My Trophy & Badge Case'}</span>
              </h3>
              <p className="text-sm font-medium opacity-80">
                {language === 'he'
                  ? 'תגים מוענקים על התמדה, משמעת יומית וגיוון קוגניטיבי בריא.'
                  : 'Badges are awarded for consistency, daily dedication, and healthy cognitive diversity.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userBadges.map((b) => (
                <div
                  key={b.badge_id}
                  className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                    highContrast
                      ? 'bg-black text-yellow-300 border-yellow-400'
                      : theme === 'dark'
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      highContrast
                        ? 'bg-yellow-400 text-black'
                        : 'bg-amber-400 text-amber-950 shadow-md'
                    }`}
                  >
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg">{b.badge_name}</h4>
                    <p className="text-xs sm:text-sm font-medium opacity-80">{b.badge_description}</p>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {language === 'he' ? '✓ הושג בהצלחה' : '✓ Unlocked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
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

      {/* Gamification Modals */}
      <CoinRewardModal
        reward={lastSessionReward}
        onClose={dismissRewardModal}
      />

      <BadgeUnlockedModal
        badge={newlyUnlockedBadge}
        onClose={dismissBadgeModal}
      />

      {/* In-App Toast for Received Cheers */}
      <NotificationToast
        notification={activeNotification}
        onDismiss={dismissNotification}
      />
    </div>
  );
};
