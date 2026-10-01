import type { UserBadge } from '../types/database';

export interface BadgeDefinition {
  badge_id: string;
  badge_name_he: string;
  badge_name_en: string;
  description_he: string;
  description_en: string;
  detailed_benefit_he: string;
  detailed_benefit_en: string;
  icon_name: 'Sun' | 'Flame' | 'Brain' | 'Sparkles' | 'Trophy';
  accent_color: string;
}

export const ALL_BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    badge_id: 'early_bird',
    badge_name_he: 'משכים קום',
    badge_name_en: 'Early Bird',
    description_he: 'השלמת אימון יומי בין השעות 05:00 ל-09:00 בבוקר',
    description_en: 'Completed a daily workout between 05:00 and 09:00 AM',
    detailed_benefit_he:
      'אימון בוקר מוקדם מפעיל את קליפת המוח הקדם-מצחית ומעלה את רמות הערנות והמיקוד למשך כל היום.',
    detailed_benefit_en:
      'Early morning training activates the prefrontal cortex and sharpens alertness and executive focus for the entire day.',
    icon_name: 'Sun',
    accent_color: 'from-amber-400 to-yellow-500',
  },
  {
    badge_id: 'iron_will',
    badge_name_he: 'איש של ברזל',
    badge_name_en: 'Iron Will',
    description_he: 'הגעה לרצף מופתי של 7 ימי אימון רצופים (Streak = 7)',
    description_en: 'Achieved an inspiring streak of 7 consecutive workout days',
    detailed_benefit_he:
      'התמדה של שבוע רצוף מייצרת הרגל נוירו-פלסטי מוצק ששומר על בריאות תאי המוח ומאט תהליכי שחיקה טבעיים.',
    detailed_benefit_en:
      'A full 7-day streak builds durable neuroplastic habits that fortify brain cells and cognitive resilience.',
    icon_name: 'Flame',
    accent_color: 'from-orange-500 to-red-500',
  },
  {
    badge_id: 'flexible_mind',
    badge_name_he: 'מוח גמיש',
    badge_name_en: 'Flexible Mind',
    description_he: 'תרגול כל 4 הקטגוריות הקוגניטיביות (זיכרון, קשב, מהירות, שפה) בשבוע אחד',
    description_en: 'Trained all 4 cognitive categories (Memory, Attention, Speed, Language) in a single week',
    detailed_benefit_he:
      'גיוון קוגניטיבי מפעיל רשתות עצביות מקבילות במח ומבטיח אימון מאוזן שמונע עייפות מחשבתית חד-גונית.',
    detailed_benefit_en:
      'Cognitive cross-training stimulates multiple neural networks, ensuring well-rounded mental fitness and plasticity.',
    icon_name: 'Brain',
    accent_color: 'from-purple-500 to-indigo-600',
  },
  {
    badge_id: 'first_spark',
    badge_name_he: 'הניצוץ הראשון',
    badge_name_en: 'First Spark',
    description_he: 'השלמת אימון יומי ראשון באפליקציה',
    description_en: 'Completed your very first daily session',
    detailed_benefit_he:
      'הצעד הראשון הוא החשוב ביותר במסע לשימור החדות המחשבתית ואיכות החיים.',
    detailed_benefit_en:
      'The first step is the most crucial milestone in maintaining lifelong cognitive clarity and vitality.',
    icon_name: 'Sparkles',
    accent_color: 'from-blue-400 to-cyan-500',
  },
  {
    badge_id: 'consistency_master',
    badge_name_he: 'אלוף ההתמדה',
    badge_name_en: 'Consistency Master',
    description_he: 'השלמת 14 אימונים יומיים במצטבר',
    description_en: 'Completed 14 cumulative daily workout sessions',
    detailed_benefit_he:
      'אימון מצטבר יוצר רזרבה קוגניטיבית משמעותית המגנה על הזיכרון לטווח הארוך.',
    detailed_benefit_en:
      'Cumulative workouts build powerful cognitive reserve that supports long-term memory and independence.',
    icon_name: 'Trophy',
    accent_color: 'from-emerald-400 to-teal-500',
  },
];

export interface SessionEvaluationData {
  completed_at?: Date | string;
  current_streak: number;
  completedCategories: string[];
  totalSessionsCount?: number;
  existingBadgeIds: string[];
}

export interface BadgeGalleryItem extends BadgeDefinition {
  unlocked: boolean;
  awarded_at?: string;
}

export interface BadgeEvaluationResult {
  newlyUnlockedBadges: UserBadge[];
  hasNewUnlock: boolean;
}

/**
 * Requirement 1: Evaluates which badges should be unlocked immediately after a daily session.
 */
export function evaluateBadges(
  userId: string,
  sessionData: SessionEvaluationData
): BadgeEvaluationResult {
  const {
    completed_at = new Date(),
    current_streak,
    completedCategories,
    totalSessionsCount = 1,
    existingBadgeIds,
  } = sessionData;

  const completedDate = typeof completed_at === 'string' ? new Date(completed_at) : completed_at;
  const hour = completedDate.getHours();
  const newlyUnlockedBadges: UserBadge[] = [];

  // Helper to award a badge if not already unlocked
  const maybeAward = (badgeId: string) => {
    // Also treat legacy 'streak_7' as 'iron_will'
    const alreadyHas =
      existingBadgeIds.includes(badgeId) ||
      (badgeId === 'iron_will' && existingBadgeIds.includes('streak_7'));

    if (alreadyHas) return;

    const def = ALL_BADGE_DEFINITIONS.find((b) => b.badge_id === badgeId);
    if (!def) return;

    newlyUnlockedBadges.push({
      user_id: userId,
      badge_id: def.badge_id,
      badge_name: def.badge_name_he,
      badge_description: def.description_he,
      icon_name: def.icon_name,
      awarded_at: new Date().toISOString(),
    });
  };

  // 1. Condition: Early Bird (between 05:00 and 09:00)
  if (hour >= 5 && hour < 9) {
    maybeAward('early_bird');
  }

  // 2. Condition: Iron Will (current_streak >= 7)
  if (current_streak >= 7) {
    maybeAward('iron_will');
  }

  // 3. Condition: Flexible Mind (completed all 4 categories in week / session)
  const uniqueCategories = new Set(completedCategories);
  if (uniqueCategories.size >= 4) {
    maybeAward('flexible_mind');
  }

  // 4. Condition: First Spark (always unlocked once user completes an exercise)
  maybeAward('first_spark');

  // 5. Condition: Consistency Master (cumulative sessions >= 14)
  if (totalSessionsCount >= 14) {
    maybeAward('consistency_master');
  }

  return {
    newlyUnlockedBadges,
    hasNewUnlock: newlyUnlockedBadges.length > 0,
  };
}

/**
 * Builds the complete gallery model combining all definitions with user's unlocked state.
 */
export function buildBadgeGalleryList(userBadges: UserBadge[]): BadgeGalleryItem[] {
  return ALL_BADGE_DEFINITIONS.map((def) => {
    // Map either exact id or legacy alias
    const matchingBadge = userBadges.find(
      (b) => b.badge_id === def.badge_id || (def.badge_id === 'iron_will' && b.badge_id === 'streak_7')
    );

    return {
      ...def,
      unlocked: !!matchingBadge,
      awarded_at: matchingBadge?.awarded_at,
    };
  });
}
