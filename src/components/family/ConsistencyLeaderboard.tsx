import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useGamification } from '../../context/GamificationContext';
import { sortMembersByStreak, canSendEncouragement, type FamilyMemberStats } from '../../lib/gamificationEngine';
import { FloatingReaction, type ReactionParticle } from './FloatingReaction';
import { Flame, Clock, Heart } from 'lucide-react';

interface ConsistencyLeaderboardProps {
  members: FamilyMemberStats[];
  currentUserId?: string;
}

export const ConsistencyLeaderboard: React.FC<ConsistencyLeaderboardProps> = ({
  members,
  currentUserId = 'user_sarah',
}) => {
  const { theme, highContrast, language } = useAccessibility();
  const { sendEncouragementToMember } = useGamification();

  // Floating particles mapped by member id
  const [particlesByMember, setParticlesByMember] = useState<Record<string, ReactionParticle[]>>({});

  // Feedback message banner per row
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const sortedMembers = sortMembersByStreak(members);

  const handleSendReaction = (
    memberId: string,
    reactionType: 'clap' | 'heart'
  ) => {
    const result = sendEncouragementToMember(memberId, reactionType);
    setFeedbackMessage(result.message);

    if (result.success) {
      // Spawn floating particles
      const emoji = reactionType === 'heart' ? '❤️' : '👏';
      const newParticle: ReactionParticle = {
        id: Date.now() + Math.random(),
        emoji,
        x: (Math.random() - 0.5) * 60,
      };

      setParticlesByMember((prev) => ({
        ...prev,
        [memberId]: [...(prev[memberId] || []), newParticle],
      }));

      // Cleanup particles after animation
      setTimeout(() => {
        setParticlesByMember((prev) => ({
          ...prev,
          [memberId]: (prev[memberId] || []).filter((p) => p.id !== newParticle.id),
        }));
      }, 1300);

      // Auto dismiss feedback banner
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 4000);
    }
  };

  return (
    <div
      className={`w-full p-5 sm:p-7 rounded-3xl border-2 shadow-lg transition-all ${
        highContrast
          ? 'bg-black text-yellow-300 border-yellow-400'
          : theme === 'dark'
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Title & Privacy Note */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2 tracking-tight">
          <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
          <span>
            {language === 'he' ? 'מדד ההתמדה המשפחתי' : 'Consistency Leaderboard'}
          </span>
        </h3>

        <span className="text-xs sm:text-sm font-extrabold opacity-75 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
          {language === 'he' ? 'לפי ימי רצף • ללא השוואת ציונים' : 'By Streak Days • No Score Comparisons'}
        </span>
      </div>

      <p
        className={`text-sm sm:text-base font-medium mb-6 ${
          highContrast ? 'text-yellow-200' : theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
        }`}
      >
        {language === 'he'
          ? 'התמדה היא הכוח האמיתי! אנחנו מעודדים אחד את השני על עצם האימון, ללא תחרות וללא ציונים.'
          : 'Consistency is true strength! We celebrate each other for showing up, with zero pressure and zero scores.'}
      </p>

      {/* Temporary feedback banner */}
      {feedbackMessage && (
        <div
          role="status"
          className={`mb-4 p-3 rounded-2xl border text-sm font-bold flex items-center gap-2 animate-fadeIn ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300'
          }`}
        >
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Member Rows */}
      <div className="space-y-3">
        {sortedMembers.map((member, index) => {
          const isCurrentUser = member.user_id === currentUserId;
          const { allowed, remainingMinutes } = canSendEncouragement(member.last_applause_sent_at);
          const memberParticles = particlesByMember[member.user_id] || [];

          return (
            <div
              key={member.user_id}
              className={`relative p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-visible ${
                isCurrentUser
                  ? highContrast
                    ? 'bg-yellow-400/20 border-yellow-300 ring-2 ring-yellow-400'
                    : theme === 'dark'
                    ? 'bg-blue-950/40 border-blue-600 ring-1 ring-blue-500/50'
                    : 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400/40'
                  : highContrast
                  ? 'bg-black border-yellow-400/80'
                  : theme === 'dark'
                  ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Floating particles animation */}
              <FloatingReaction particles={memberParticles} />

              {/* Left/Start side: Avatar & Name & Streak info */}
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Ranking order badge */}
                <span className="text-sm sm:text-base font-black w-6 text-center opacity-60 shrink-0">
                  #{index + 1}
                </span>

                {/* Avatar Initial */}
                <div
                  className={`w-12 h-12 rounded-2xl ${member.avatar_color} text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm`}
                >
                  {member.display_name.charAt(0)}
                </div>

                {/* Display Name & Gentle Streak */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-lg sm:text-xl truncate">
                      {member.display_name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-600 text-white shrink-0">
                        {language === 'he' ? 'את/ה' : 'You'}
                      </span>
                    )}
                  </div>

                  {/* STREAK INDICATOR */}
                  {member.current_streak > 0 ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Flame className="w-5 h-5 text-orange-500 fill-orange-500 shrink-0 animate-pulse" />
                      <span className="text-sm sm:text-base font-bold text-orange-600 dark:text-orange-400">
                        {language === 'he'
                          ? `${member.current_streak} ימי אימון רצופים`
                          : `${member.current_streak} Days Streak`}
                      </span>
                    </div>
                  ) : (
                    /* ZERO STREAK GENTLE INDICATOR (AC requirement) */
                    <div className="flex items-center gap-1.5 mt-0.5 opacity-80">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 italic">
                        {language === 'he'
                          ? '⏳ ממתין/ה לאימון ראשון'
                          : '⏳ Waiting for first workout'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right/End side: Micro-interactions (Clap 👏 & Heart ❤️) */}
              <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-center">
                {isCurrentUser ? (
                  <span className="text-xs sm:text-sm font-bold opacity-70 px-3 py-2 rounded-xl bg-slate-200/60 dark:bg-slate-800">
                    {language === 'he' ? 'הפרופיל שלך' : 'Your Profile'}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Clap Button (min 64x64px touch target) */}
                    <button
                      type="button"
                      disabled={!allowed}
                      onClick={() => handleSendReaction(member.user_id, 'clap')}
                      aria-label={
                        language === 'he'
                          ? `שלח מחיאות כפיים ל${member.display_name}`
                          : `Send applause to ${member.display_name}`
                      }
                      className={`min-w-[64px] min-h-[64px] px-3 py-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all transform active:scale-90 cursor-pointer shadow-sm ${
                        allowed
                          ? highContrast
                            ? 'bg-yellow-400 text-black hover:bg-yellow-300 font-black border-2 border-yellow-300'
                            : 'bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span className="text-2xl leading-none">👏</span>
                      <span className="text-xs font-bold leading-none">
                        {allowed ? (language === 'he' ? 'כל הכבוד' : 'Cheer') : `${remainingMinutes}m`}
                      </span>
                    </button>

                    {/* Heart Button (min 64x64px touch target) */}
                    <button
                      type="button"
                      disabled={!allowed}
                      onClick={() => handleSendReaction(member.user_id, 'heart')}
                      aria-label={
                        language === 'he'
                          ? `שלח חיזוק ואהבה ל${member.display_name}`
                          : `Send heart to ${member.display_name}`
                      }
                      className={`min-w-[64px] min-h-[64px] px-3 py-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all transform active:scale-90 cursor-pointer shadow-sm ${
                        allowed
                          ? highContrast
                            ? 'bg-yellow-400 text-black hover:bg-yellow-300 font-black border-2 border-yellow-300'
                            : 'bg-rose-100 dark:bg-rose-950/70 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span className="text-2xl leading-none">❤️</span>
                      <span className="text-xs font-bold leading-none">
                        {allowed ? (language === 'he' ? 'חיזוק' : 'Heart') : `${remainingMinutes}m`}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
