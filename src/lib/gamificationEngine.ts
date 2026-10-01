import type { UserBadge } from '../types/database';

export interface FamilyMemberStats {
  user_id: string;
  display_name: string;
  current_streak: number;
  weekly_coins: number;
  total_coins: number;
  avatar_color: string;
  last_applause_sent_at?: number; // timestamp
}

export interface SessionRewardResult {
  baseCoins: number;
  streakBonus: number;
  totalEarned: number;
  previousCoins: number;
  newTotalCoins: number;
  previousStreak: number;
  newStreak: number;
  unlockedBadges: UserBadge[];
}

export const BADGE_DEFINITIONS: Record<string, { badge_id: string; badge_name_he: string; badge_name_en: string; description_he: string; description_en: string; icon_name: UserBadge['icon_name'] }> = {
  early_bird: {
    badge_id: 'early_bird',
    badge_name_he: 'משכים קום',
    badge_name_en: 'Early Bird',
    description_he: 'השלמת אימון יומי לפני השעה 09:00 בבוקר',
    description_en: 'Completed a daily workout before 09:00 AM',
    icon_name: 'Sun',
  },
  flexible_mind: {
    badge_id: 'flexible_mind',
    badge_name_he: 'מוח גמיש',
    badge_name_en: 'Flexible Mind',
    description_he: 'תרגלת את כל 4 עמודי התווך הקוגניטיביים השבוע',
    description_en: 'Trained all 4 cognitive categories this week',
    icon_name: 'Brain',
  },
  streak_7: {
    badge_id: 'streak_7',
    badge_name_he: 'שבוע של אלופים',
    badge_name_en: '7-Day Champion',
    description_he: 'התמדה מרשימה של 7 ימי אימון רצופים',
    description_en: 'Impressive streak of 7 consecutive training days',
    icon_name: 'Flame',
  },
};

/**
 * Ticket G-1 & G-5: Process Daily Session Completion
 */
export function calculateSessionCompletionRewards(params: {
  currentCoins: number;
  currentStreak: number;
  completedAtDate: Date;
  completedCategoriesCount: number;
  existingBadgeIds: string[];
}): SessionRewardResult {
  const { currentCoins, currentStreak, completedAtDate, completedCategoriesCount, existingBadgeIds } = params;

  const baseCoins = 50;
  const newStreak = currentStreak + 1;
  const streakBonus = newStreak === 7 ? 200 : 0;
  const totalEarned = baseCoins + streakBonus;
  const newTotalCoins = currentCoins + totalEarned;

  const unlockedBadges: UserBadge[] = [];

  // 1. Early bird badge (< 09:00)
  const hour = completedAtDate.getHours();
  if (hour < 9 && !existingBadgeIds.includes('early_bird')) {
    unlockedBadges.push({
      user_id: 'current-user',
      badge_id: 'early_bird',
      badge_name: BADGE_DEFINITIONS.early_bird.badge_name_he,
      badge_description: BADGE_DEFINITIONS.early_bird.description_he,
      icon_name: 'Sun',
      awarded_at: new Date().toISOString(),
    });
  }

  // 2. Flexible mind badge (all 4 categories)
  if (completedCategoriesCount >= 4 && !existingBadgeIds.includes('flexible_mind')) {
    unlockedBadges.push({
      user_id: 'current-user',
      badge_id: 'flexible_mind',
      badge_name: BADGE_DEFINITIONS.flexible_mind.badge_name_he,
      badge_description: BADGE_DEFINITIONS.flexible_mind.description_he,
      icon_name: 'Brain',
      awarded_at: new Date().toISOString(),
    });
  }

  // 3. 7-Day Champion streak badge
  if (newStreak >= 7 && !existingBadgeIds.includes('streak_7')) {
    unlockedBadges.push({
      user_id: 'current-user',
      badge_id: 'streak_7',
      badge_name: BADGE_DEFINITIONS.streak_7.badge_name_he,
      badge_description: BADGE_DEFINITIONS.streak_7.description_he,
      icon_name: 'Flame',
      awarded_at: new Date().toISOString(),
    });
  }

  return {
    baseCoins,
    streakBonus,
    totalEarned,
    previousCoins: currentCoins,
    newTotalCoins,
    previousStreak: currentStreak,
    newStreak,
    unlockedBadges,
  };
}

/**
 * Ticket G-2: Shared Family Co-op Goal Calculation
 */
export function calculateFamilyCoopProgress(members: FamilyMemberStats[], targetWeeklyCoins: number = 2000) {
  const totalWeeklyCoins = members.reduce((sum, m) => sum + m.weekly_coins, 0);
  const progressRatio = targetWeeklyCoins > 0 ? Math.min(totalWeeklyCoins / targetWeeklyCoins, 1) : 0;
  const progressPercent = Math.round(progressRatio * 100);
  const isGoalReached = totalWeeklyCoins >= targetWeeklyCoins;

  return {
    totalWeeklyCoins,
    targetWeeklyCoins,
    progressPercent,
    isGoalReached,
  };
}

/**
 * Ticket G-3: Sort Members by Consistency Streak (Descending)
 */
export function sortMembersByStreak(members: FamilyMemberStats[]): FamilyMemberStats[] {
  return [...members].sort((a, b) => b.current_streak - a.current_streak);
}

/**
 * Ticket G-4: Check Encouragement Cooldown (1 hour)
 */
export function canSendEncouragement(lastSentTimestamp?: number): { allowed: boolean; remainingMinutes: number } {
  if (!lastSentTimestamp) return { allowed: true, remainingMinutes: 0 };
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const elapsed = Date.now() - lastSentTimestamp;
  if (elapsed >= ONE_HOUR_MS) {
    return { allowed: true, remainingMinutes: 0 };
  }
  const remainingMinutes = Math.ceil((ONE_HOUR_MS - elapsed) / (60 * 1000));
  return { allowed: false, remainingMinutes };
}
