import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  FamilyMemberStats,
  SessionRewardResult,
} from '../lib/gamificationEngine';
import {
  calculateSessionCompletionRewards,
  canSendEncouragement,
} from '../lib/gamificationEngine';
import type { UserBadge, FamilyNotification, UserProfile } from '../types/database';
import { audioManager } from '../lib/soundEffects';
import { evaluateBadges } from '../lib/badgeEvaluation';

interface GamificationContextType {
  totalCoins: number;
  currentStreak: number;
  familyMembers: FamilyMemberStats[];
  userBadges: UserBadge[];
  activeNotification: FamilyNotification | null;
  lastSessionReward: SessionRewardResult | null;
  newlyUnlockedBadge: UserBadge | null;
  completeDailyWorkout: () => SessionRewardResult;
  sendEncouragementToMember: (memberId: string, reactionType?: 'clap' | 'heart') => { success: boolean; message: string };
  triggerIncomingCheer: (senderName?: string, reactionType?: 'clap' | 'heart') => void;
  dismissNotification: () => void;
  dismissRewardModal: () => void;
  dismissBadgeModal: () => void;
}

const getStorageKey = (userId?: string) => `neurofit_gamification_${userId || 'guest'}_v2`;

const INITIAL_SARAH_FAMILY: FamilyMemberStats[] = [
  {
    user_id: 'user_david',
    display_name: 'סבא דוד',
    current_streak: 12,
    weekly_coins: 380,
    total_coins: 720,
    avatar_color: 'bg-indigo-600',
  },
  {
    user_id: 'user_sarah', // Current user
    display_name: 'סבתא שרה (את/ה)',
    current_streak: 6,
    weekly_coins: 250,
    total_coins: 340,
    avatar_color: 'bg-emerald-600',
  },
  {
    user_id: 'user_roni',
    display_name: 'רוני (בת)',
    current_streak: 4,
    weekly_coins: 160,
    total_coins: 290,
    avatar_color: 'bg-purple-600',
  },
  {
    user_id: 'user_yonatan',
    display_name: 'יונתן (נכד)',
    current_streak: 3,
    weekly_coins: 140,
    total_coins: 210,
    avatar_color: 'bg-amber-600',
  },
  {
    user_id: 'user_yossi',
    display_name: 'סבא יוסי',
    current_streak: 0,
    weekly_coins: 0,
    total_coins: 70,
    avatar_color: 'bg-teal-600',
  },
];

const INITIAL_SARAH_BADGES: UserBadge[] = [
  {
    user_id: 'user_sarah',
    badge_id: 'early_bird',
    badge_name: 'משכים קום',
    badge_description: 'השלמת אימון יומי לפני השעה 09:00 בבוקר',
    icon_name: 'Sun',
    awarded_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const getInitialFamilyForUser = (user?: UserProfile | null): FamilyMemberStats[] => {
  if (!user || user.user_id === 'user_sarah') {
    return INITIAL_SARAH_FAMILY;
  }
  const myName = user.display_name ? `${user.display_name} (את/ה)` : 'אני (את/ה)';
  return [
    {
      user_id: 'user_david',
      display_name: 'סבא דוד',
      current_streak: 12,
      weekly_coins: 380,
      total_coins: 720,
      avatar_color: 'bg-indigo-600',
    },
    {
      user_id: user.user_id,
      display_name: myName,
      current_streak: 0,
      weekly_coins: 0,
      total_coins: 50,
      avatar_color: 'bg-emerald-600',
    },
    {
      user_id: 'user_sarah',
      display_name: 'סבתא שרה',
      current_streak: 6,
      weekly_coins: 250,
      total_coins: 340,
      avatar_color: 'bg-purple-600',
    },
    {
      user_id: 'user_roni',
      display_name: 'רוני (בת)',
      current_streak: 4,
      weekly_coins: 160,
      total_coins: 290,
      avatar_color: 'bg-teal-600',
    },
    {
      user_id: 'user_yonatan',
      display_name: 'יונתן (נכד)',
      current_streak: 3,
      weekly_coins: 140,
      total_coins: 210,
      avatar_color: 'bg-amber-600',
    },
  ];
};

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

interface GamificationProviderProps {
  children: React.ReactNode;
  currentUser?: UserProfile | null;
}

export const GamificationProvider: React.FC<GamificationProviderProps> = ({ children, currentUser }) => {
  const isSarah = !currentUser || currentUser.user_id === 'user_sarah';

  const [totalCoins, setTotalCoins] = useState<number>(isSarah ? 340 : 50);
  const [currentStreak, setCurrentStreak] = useState<number>(isSarah ? 6 : 0);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberStats[]>(() => getInitialFamilyForUser(currentUser));
  const [userBadges, setUserBadges] = useState<UserBadge[]>(() => (isSarah ? INITIAL_SARAH_BADGES : []));

  const [activeNotification, setActiveNotification] = useState<FamilyNotification | null>(null);
  const [lastSessionReward, setLastSessionReward] = useState<SessionRewardResult | null>(null);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<UserBadge | null>(null);

  // Load from local storage when currentUser changes or mounts
  useEffect(() => {
    const key = getStorageKey(currentUser?.user_id);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.totalCoins === 'number') setTotalCoins(parsed.totalCoins);
        if (typeof parsed.currentStreak === 'number') setCurrentStreak(parsed.currentStreak);
        if (Array.isArray(parsed.familyMembers)) setFamilyMembers(parsed.familyMembers);
        if (Array.isArray(parsed.userBadges)) setUserBadges(parsed.userBadges);
        return;
      }
    } catch {
      // fallback
    }

    // Default initialization if nothing saved yet
    if (isSarah) {
      setTotalCoins(340);
      setCurrentStreak(6);
      setFamilyMembers(INITIAL_SARAH_FAMILY);
      setUserBadges(INITIAL_SARAH_BADGES);
    } else {
      setTotalCoins(50);
      setCurrentStreak(0);
      setFamilyMembers(getInitialFamilyForUser(currentUser));
      setUserBadges([]);
    }
  }, [currentUser?.user_id]);

  // Save to local storage
  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(
        getStorageKey(currentUser?.user_id),
        JSON.stringify({
          totalCoins,
          currentStreak,
          familyMembers,
          userBadges,
        })
      );
    } catch {
      // ignore
    }
  }, [totalCoins, currentStreak, familyMembers, userBadges, currentUser?.user_id]);

  // Complete Daily Workout
  const completeDailyWorkout = (): SessionRewardResult => {
    const activeUserId = currentUser?.user_id || 'user_sarah';
    const existingBadgeIds = userBadges.map((b) => b.badge_id);

    const result = calculateSessionCompletionRewards({
      currentCoins: totalCoins,
      currentStreak,
      completedAtDate: new Date(),
      completedCategoriesCount: 4,
      existingBadgeIds,
    });

    setTotalCoins(result.newTotalCoins);
    setCurrentStreak(result.newStreak);

    // Update active user in family list
    setFamilyMembers((prev) =>
      prev.map((member) =>
        member.user_id === activeUserId
          ? {
              ...member,
              current_streak: result.newStreak,
              weekly_coins: member.weekly_coins + result.totalEarned,
              total_coins: result.newTotalCoins,
            }
          : member
      )
    );

    // Evaluate behavioral badges via BadgeEvaluationLogic
    const badgeEval = evaluateBadges(activeUserId, {
      completed_at: new Date(),
      current_streak: result.newStreak,
      completedCategories: ['memory', 'attention', 'speed', 'language'],
      totalSessionsCount: currentStreak + 1,
      existingBadgeIds,
    });

    const combinedNewBadges = [
      ...result.unlockedBadges,
      ...badgeEval.newlyUnlockedBadges.filter(
        (nb) => !result.unlockedBadges.some((rb) => rb.badge_id === nb.badge_id)
      ),
    ];

    // If new badge was unlocked
    if (combinedNewBadges.length > 0) {
      setUserBadges((prev) => [...prev, ...combinedNewBadges]);
      setNewlyUnlockedBadge(combinedNewBadges[0]);
    }

    setLastSessionReward({
      ...result,
      unlockedBadges: combinedNewBadges,
    });
    audioManager.playSuccess(true);
    return {
      ...result,
      unlockedBadges: combinedNewBadges,
    };
  };

  // Send Encouragement (Applause 👏 or Heart ❤️)
  const sendEncouragementToMember = (
    memberId: string,
    reactionType: 'clap' | 'heart' = 'clap'
  ): { success: boolean; message: string } => {
    const targetMember = familyMembers.find((m) => m.user_id === memberId);
    if (!targetMember) return { success: false, message: 'משתמש לא נמצא' };

    const check = canSendEncouragement(targetMember.last_applause_sent_at);
    if (!check.allowed) {
      return {
        success: false,
        message: `ניתן לעודד שוב בעוד ${check.remainingMinutes} דקות (מניעת ספאם)`,
      };
    }

    // Update cooldown timestamp
    const now = Date.now();
    setFamilyMembers((prev) =>
      prev.map((m) => (m.user_id === memberId ? { ...m, last_applause_sent_at: now } : m))
    );

    audioManager.playSuccess(true);
    const icon = reactionType === 'heart' ? '❤️' : '👏';
    return {
      success: true,
      message: `שלחת חיזוק חם ועידוד ל${targetMember.display_name}! ${icon}`,
    };
  };

  // Receiver UI: Display In-App Toast when notification is received
  const triggerIncomingCheer = (
    senderName: string = 'סבא דוד',
    reactionType: 'clap' | 'heart' = 'heart'
  ) => {
    const now = Date.now();
    const icon = reactionType === 'heart' ? '❤️' : '👏';
    const notif: FamilyNotification = {
      notification_id: `notif_${now}`,
      from_user_id: 'user_david',
      to_user_id: currentUser?.user_id || 'user_sarah',
      sender_name: senderName,
      message: `${senderName} שלח/ה לך עידוד חם! ${icon} גאים בך מאוד!`,
      notification_type: 'encouragement',
      created_at: new Date().toISOString(),
    };
    setActiveNotification(notif);
    audioManager.playSuccess(true);
  };

  const dismissNotification = () => {
    setActiveNotification(null);
  };

  const dismissRewardModal = () => {
    setLastSessionReward(null);
  };

  const dismissBadgeModal = () => {
    setNewlyUnlockedBadge(null);
  };

  return (
    <GamificationContext.Provider
      value={{
        totalCoins,
        currentStreak,
        familyMembers,
        userBadges,
        activeNotification,
        lastSessionReward,
        newlyUnlockedBadge,
        completeDailyWorkout,
        sendEncouragementToMember,
        triggerIncomingCheer,
        dismissNotification,
        dismissRewardModal,
        dismissBadgeModal,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = (): GamificationContextType => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
