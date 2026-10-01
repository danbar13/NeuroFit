import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useGamification } from '../../context/GamificationContext';
import {
  calculateFamilyCoopProgress,
  sortMembersByStreak,
  canSendEncouragement,
} from '../../lib/gamificationEngine';
import { audioManager } from '../../lib/soundEffects';
import {
  Users,
  Flame,
  Coins,
  Trophy,
  X,
  Sparkles,
  HeartHandshake,
  CheckCircle,
  Sun,
  Brain,
} from 'lucide-react';

interface FamilyCoopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilyCoopModal: React.FC<FamilyCoopModalProps> = ({ isOpen, onClose }) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const {
    familyMembers,
    userBadges,
    sendEncouragementToMember,
    completeDailyWorkout,
  } = useGamification();

  const [activeTab, setActiveTab] = useState<'coop' | 'badges'>('coop');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isHe = language === 'he';

  // Ticket G-2: Shared Co-op Goal
  const coopProgress = calculateFamilyCoopProgress(familyMembers, 150);

  // Ticket G-3: Sort by consistency streak (high to low)
  const sortedMembers = sortMembersByStreak(familyMembers);

  const handleSendApplause = (memberId: string) => {
    const res = sendEncouragementToMember(memberId);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const renderBadgeIcon = (icon: string) => {
    switch (icon) {
      case 'Sun':
        return <Sun className="w-8 h-8 text-amber-500" />;
      case 'Flame':
        return <Flame className="w-8 h-8 text-rose-500 fill-rose-500" />;
      case 'Brain':
        return <Brain className="w-8 h-8 text-indigo-500" />;
      default:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="family-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
    >
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl p-5 sm:p-7 shadow-2xl transition-all border-4 ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 text-slate-100 border-slate-700'
            : 'bg-white text-gray-900 border-blue-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-current/20 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                highContrast
                  ? 'bg-yellow-400 text-black'
                  : theme === 'dark'
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                  : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h2 id="family-modal-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isHe ? 'מועדון המוח המשפחתי' : 'Family Brain Club'}
              </h2>
              <p className="text-sm sm:text-base text-current/80">
                {isHe ? 'משפחת ברקאי • משתפים פעולה ומעודדים זה את זה' : 'Barkai Family • Supporting each other'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioManager.playTap(soundEnabled);
              onClose();
            }}
            aria-label="סגור"
            className={`min-w-[56px] min-h-[56px] rounded-2xl flex items-center justify-center font-bold border-2 transition-transform active:scale-95 ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : theme === 'dark'
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
            }`}
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Tab Switcher: Co-op Goal & Streaks vs. Badges */}
        <div className="flex gap-2 my-4 shrink-0">
          <button
            onClick={() => setActiveTab('coop')}
            className={`flex-1 min-h-[54px] rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border-2 transition-all ${
              activeTab === 'coop'
                ? highContrast
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : theme === 'dark'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-indigo-700 text-white border-indigo-800'
                : highContrast
                ? 'bg-gray-900 text-white border-gray-700'
                : theme === 'dark'
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            <HeartHandshake className="w-6 h-6" />
            <span>{isHe ? 'יעד משותף והתמדה' : 'Shared Goal & Streaks'}</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 min-h-[54px] rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border-2 transition-all ${
              activeTab === 'badges'
                ? highContrast
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : theme === 'dark'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-indigo-700 text-white border-indigo-800'
                : highContrast
                ? 'bg-gray-900 text-white border-gray-700'
                : theme === 'dark'
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            <Trophy className="w-6 h-6" />
            <span>{isHe ? 'תגי ההישג שלי' : 'My Badges'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
              {userBadges.length}
            </span>
          </button>
        </div>

        {/* Temporary Feedback Message */}
        {toastMessage && (
          <div className="mb-3 p-3 bg-emerald-500 text-white rounded-xl text-center font-bold text-sm sm:text-base animate-fade-in shrink-0">
            {toastMessage}
          </div>
        )}

        {/* Scrollable Tab Content */}
        <div className="py-2 space-y-6 overflow-y-auto flex-1 pr-1">
          {activeTab === 'coop' && (
            <>
              {/* Ticket G-2: Shared Co-op Goal Card */}
              <div
                className={`p-5 rounded-3xl border-3 transition-all ${
                  highContrast
                    ? 'bg-black border-yellow-400 text-yellow-300'
                    : theme === 'dark'
                    ? 'bg-slate-800/90 border-slate-700 text-slate-100'
                    : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                    <h3 className="text-xl sm:text-2xl font-black">
                      {isHe ? 'היעד המשפחתי המשותף לשבוע זה' : 'Family Weekly Co-op Goal'}
                    </h3>
                  </div>
                  <span className="text-sm font-semibold opacity-80">
                    {isHe ? 'מיום א׳ עד שבת' : 'Sun - Sat'}
                  </span>
                </div>

                <p className="text-base opacity-90 mb-4">
                  {isHe
                    ? 'אנחנו לא מתחרים – כל אימון של כל בן משפחה מוסיף נקודות ליעד המשותף!'
                    : 'We collaborate, not compete – every workout adds points to our joint target!'}
                </p>

                {/* Cooperative Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-bold text-lg">
                    <span>
                      {coopProgress.totalWeeklyCoins} {isHe ? 'מתוך' : 'of'} {coopProgress.targetWeeklyCoins} 🪙
                    </span>
                    <span>{coopProgress.progressPercent}%</span>
                  </div>

                  <div className="w-full h-7 rounded-full bg-black/20 overflow-hidden p-1 border">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        highContrast
                          ? 'bg-yellow-400'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${Math.min(coopProgress.progressPercent, 100)}%` }}
                    />
                  </div>

                  {coopProgress.isGoalReached && (
                    <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base sm:text-lg mt-2">
                      <CheckCircle className="w-6 h-6 shrink-0" />
                      <span>{isHe ? 'איזה יופי! המשפחה השיגה את היעד השבועי! 🎉' : 'Hurray! The family achieved the weekly goal! 🎉'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket G-3 & G-4: Consistency Tracker with 👏 Micro-Interactions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Flame className="w-6 h-6 text-rose-500 fill-rose-500" />
                    <span>{isHe ? 'התמדה ברצף (ללא השוואת ציונים)' : 'Consistency Tracker (No Scores)'}</span>
                  </h3>
                  <span className="text-sm opacity-70">
                    {isHe ? 'מדורג לפי רצף ימים' : 'Sorted by streak days'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {sortedMembers.map((member) => {
                    const isSelf = member.user_id === 'user_sarah';
                    const cooldown = canSendEncouragement(member.last_applause_sent_at);

                    return (
                      <div
                        key={member.user_id}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                          isSelf
                            ? highContrast
                              ? 'bg-yellow-400/20 border-yellow-300 ring-2 ring-yellow-400'
                              : theme === 'dark'
                              ? 'bg-indigo-950/60 border-indigo-600'
                              : 'bg-blue-50/80 border-blue-300'
                            : highContrast
                            ? 'bg-gray-900 border-gray-700'
                            : theme === 'dark'
                            ? 'bg-slate-800 border-slate-700'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        {/* Member Identity & Streak */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg ${member.avatar_color}`}
                          >
                            {member.display_name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">{member.display_name}</span>
                              {isSelf && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-current/15 font-semibold">
                                  {isHe ? 'אני' : 'Me'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-rose-500 font-extrabold text-base mt-0.5">
                              <Flame className="w-5 h-5 fill-rose-500" />
                              <span>{member.current_streak} {isHe ? 'ימי אימון רצופים' : 'day streak'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Ticket G-4: Send Encouragement (👏) Button */}
                        {!isSelf ? (
                          <button
                            onClick={() => handleSendApplause(member.user_id)}
                            disabled={!cooldown.allowed}
                            aria-label={`שלח מחיאות כפיים ל${member.display_name}`}
                            title={
                              cooldown.allowed
                                ? isHe ? 'שלח/י מחיאות כפיים ועידוד' : 'Send applause'
                                : isHe ? `ניתן לעודד שוב בעוד ${cooldown.remainingMinutes} דק׳` : `Cooldown: ${cooldown.remainingMinutes}m`
                            }
                            className={`min-h-[52px] px-4 rounded-xl font-bold flex items-center gap-2 border-2 transition-transform active:scale-95 ${
                              cooldown.allowed
                                ? highContrast
                                  ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                                  : theme === 'dark'
                                  ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700'
                                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                : 'opacity-40 cursor-not-allowed bg-gray-200 text-gray-500 border-gray-300'
                            }`}
                          >
                            <span className="text-2xl">👏</span>
                            <span className="text-sm hidden sm:inline">
                              {cooldown.allowed ? (isHe ? 'כל הכבוד!' : 'Cheer!') : `${cooldown.remainingMinutes}m`}
                            </span>
                          </button>
                        ) : (
                          <div className="text-sm font-semibold opacity-70 px-3">
                            {member.total_coins} 🪙
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Ticket G-5 Badges Shelf */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <h3 className="text-2xl font-black mb-1">
                  {isHe ? 'ארון התגים וההישגים' : 'Trophy & Badge Case'}
                </h3>
                <p className="text-base opacity-80">
                  {isHe
                    ? 'תגים מוענקים על התמדה, משמעת וגיוון קוגניטיבי בריא'
                    : 'Badges are awarded for consistency and cognitive diversity'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userBadges.map((badge) => (
                  <div
                    key={badge.badge_id}
                    className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 transition-all ${
                      highContrast
                        ? 'bg-gray-900 border-yellow-400 text-white'
                        : theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl shrink-0 ${
                        highContrast
                          ? 'bg-yellow-400 text-black'
                          : theme === 'dark'
                          ? 'bg-slate-700'
                          : 'bg-amber-100'
                      }`}
                    >
                      {renderBadgeIcon(badge.icon_name)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{badge.badge_name}</h4>
                      <p className="text-sm opacity-80 mt-0.5">{badge.badge_description}</p>
                      <span className="text-xs opacity-60 mt-1 block">
                        {isHe ? 'הושג בהצלחה' : 'Unlocked'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Workout Simulator (Ticket G-1 & G-5 Demo Trigger) */}
        <div className="pt-4 border-t-2 border-current/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              completeDailyWorkout();
            }}
            title="סימולציה: השלם אימון כדי לצבור +50 נקודות, לבדוק בונוס רצף 7 ימים ופתיחת תגים"
            className={`w-full sm:w-auto min-h-[54px] px-5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 border-2 transition-transform active:scale-95 ${
              highContrast
                ? 'bg-gray-900 text-yellow-400 border-yellow-400 hover:bg-black'
                : theme === 'dark'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600 hover:bg-emerald-900'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <Coins className="w-5 h-5 text-amber-500" />
            <span>{isHe ? '⚡ הדמיית סיום אימון (+50 נק׳ / רצף)' : '⚡ Simulate Finish Workout (+50 Coins)'}</span>
          </button>

          <button
            onClick={() => {
              audioManager.playTap(soundEnabled);
              onClose();
            }}
            className={`w-full sm:w-auto min-h-[54px] min-w-[140px] px-6 rounded-2xl font-bold text-lg flex items-center justify-center shadow-md transition-transform active:scale-95 ${
              highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : theme === 'dark'
                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                : 'bg-blue-800 text-white hover:bg-blue-900'
            }`}
          >
            {isHe ? 'סגירה' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
