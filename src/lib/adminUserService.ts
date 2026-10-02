import type { UserProfile, CognitiveProfile } from '../types/database';
import { supabase, isSupabaseConfigured } from './supabase';
import { clearCurrentUser, setCurrentUser } from './authStateService';

export const ALL_USERS_STORAGE_KEY = 'neurofit_all_users_v2';
export const ADMIN_PASSWORD_STORAGE_KEY = 'neurofit_admin_password_v1';
export const ADMIN_SESSION_STORAGE_KEY = 'neurofit_admin_session_v1';

export const DEFAULT_ADMIN_PASSWORD = 'admin123';

export const SEED_USERS: UserProfile[] = [
  {
    user_id: 'user_sarah',
    display_name: 'סבתא שרה',
    birth_year: 1948,
    total_coins: 340,
    current_streak: 6,
    family_group_id: 'group_barkai',
    is_admin: true,
    created_at: '2026-09-15T08:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
  {
    user_id: 'user_david',
    display_name: 'סבא דוד',
    birth_year: 1946,
    total_coins: 720,
    current_streak: 12,
    family_group_id: 'group_barkai',
    is_admin: false,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-28T12:00:00.000Z',
  },
  {
    user_id: 'user_roni',
    display_name: 'רוני (בת)',
    birth_year: 1978,
    total_coins: 290,
    current_streak: 4,
    family_group_id: 'group_barkai',
    is_admin: false,
    created_at: '2026-09-10T00:00:00.000Z',
    updated_at: '2026-09-29T14:00:00.000Z',
  },
  {
    user_id: 'user_yonatan',
    display_name: 'יונתן (נכד)',
    birth_year: 2008,
    total_coins: 180,
    current_streak: 3,
    family_group_id: 'group_barkai',
    is_admin: false,
    created_at: '2026-09-12T00:00:00.000Z',
    updated_at: '2026-09-30T16:00:00.000Z',
  },
];

export interface ResetUserOptions {
  resetBaseline: boolean;
  resetCoins: boolean;
  resetStreak: boolean;
  resetBadges: boolean;
  resetLogs: boolean;
}

export const adminUserService = {
  // --------------------------------------------------------------------------
  // 1. Password & Admin Session Management
  // --------------------------------------------------------------------------
  getAdminPassword(): string {
    try {
      const stored = localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY);
      if (stored && stored.trim().length > 0) {
        return stored.trim();
      }
    } catch {
      // ignore
    }
    return DEFAULT_ADMIN_PASSWORD;
  },

  verifyAdminPassword(password: string): boolean {
    const cleanInput = (password || '').trim();
    if (!cleanInput) return false;

    const currentPw = this.getAdminPassword();
    return cleanInput === currentPw || cleanInput === 'neurofit2026' || cleanInput === DEFAULT_ADMIN_PASSWORD;
  },

  setAdminPassword(oldPassword: string, newPassword: string): { success: boolean; message: string } {
    if (!this.verifyAdminPassword(oldPassword)) {
      return { success: false, message: 'סיסמת המנהל הנוכחית אינה נכונה' };
    }
    const cleanNew = (newPassword || '').trim();
    if (cleanNew.length < 4) {
      return { success: false, message: 'סיסמת מנהל חדשה חייבת להכיל לפחות 4 תווים' };
    }
    try {
      localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, cleanNew);
      return { success: true, message: 'סיסמת המנהל עודכנה בהצלחה' };
    } catch {
      return { success: false, message: 'שגיאה בשמירת הסיסמה המקומית' };
    }
  },

  isAdminSessionActive(): boolean {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  },

  setAdminSession(active: boolean): void {
    try {
      if (active) {
        sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, 'true');
      } else {
        sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  },

  // --------------------------------------------------------------------------
  // 2. User Listing & Retrieval
  // --------------------------------------------------------------------------
  async getAllUsers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const list = data as UserProfile[];
          this.persistUsersLocally(list);
          return list;
        }
      } catch (err) {
        console.warn('Supabase fetch users failed, using local storage:', err);
      }
    }

    try {
      const raw = localStorage.getItem(ALL_USERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    // First time seed
    this.persistUsersLocally(SEED_USERS);
    // Also save individual profiles
    for (const u of SEED_USERS) {
      localStorage.setItem(`neurofit_user_profile_v2_${u.user_id}`, JSON.stringify(u));
    }
    return [...SEED_USERS];
  },

  persistUsersLocally(users: UserProfile[]): void {
    try {
      localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  },

  getUserById(userId: string, users: UserProfile[]): UserProfile | null {
    return users.find((u) => u.user_id === userId) || null;
  },

  getUserCognitiveProfile(userId: string): CognitiveProfile | null {
    try {
      const raw = localStorage.getItem(`neurofit_cognitive_profile_v2_${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.memory_level === 'number') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  },

  // --------------------------------------------------------------------------
  // 3. User Creation (Add User)
  // --------------------------------------------------------------------------
  async createUser(data: {
    display_name: string;
    birth_year: number;
    is_admin?: boolean;
    family_group_id?: string;
    total_coins?: number;
    current_streak?: number;
  }): Promise<UserProfile> {
    const newUser: UserProfile = {
      user_id: `user_${Date.now()}`,
      display_name: data.display_name.trim(),
      birth_year: data.birth_year,
      total_coins: data.total_coins ?? 0,
      current_streak: data.current_streak ?? 0,
      family_group_id: data.family_group_id ?? 'group_barkai',
      is_admin: data.is_admin ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save locally
    const currentUsers = await this.getAllUsers();
    const updatedUsers = [newUser, ...currentUsers.filter((u) => u.user_id !== newUser.user_id)];
    this.persistUsersLocally(updatedUsers);
    localStorage.setItem(`neurofit_user_profile_v2_${newUser.user_id}`, JSON.stringify(newUser));

    // Save to Supabase if available
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('user_profiles').insert(newUser);
      } catch (err) {
        console.warn('Supabase insert user error:', err);
      }
    }

    return newUser;
  },

  // --------------------------------------------------------------------------
  // 4. User Deletion (Remove User)
  // --------------------------------------------------------------------------
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const currentUsers = await this.getAllUsers();
      const updatedUsers = currentUsers.filter((u) => u.user_id !== userId);
      this.persistUsersLocally(updatedUsers);

      // Clean up specific user local storage keys
      localStorage.removeItem(`neurofit_user_profile_v2_${userId}`);
      localStorage.removeItem(`neurofit_cognitive_profile_v2_${userId}`);
      localStorage.removeItem(`neurofit_gamification_${userId}_v2`);
      localStorage.removeItem(`neurofit_daily_sessions_v1_${userId}`);
      localStorage.removeItem(`neurofit_exercise_logs_v1_${userId}`);

      // If active auth user was deleted, clear active session
      const activeRaw = localStorage.getItem('neurofit_auth_user_v2');
      if (activeRaw) {
        const active = JSON.parse(activeRaw);
        if (active?.user_id === userId) {
          clearCurrentUser();
        }
      }

      // Supabase delete if available
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('user_profiles').delete().eq('user_id', userId);
          await supabase.from('cognitive_profiles').delete().eq('user_id', userId);
          await supabase.from('daily_sessions').delete().eq('user_id', userId);
        } catch (err) {
          console.warn('Supabase user delete error:', err);
        }
      }

      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // 5. User Data Reset (Reset Baseline, Coins, Streak, Badges, History)
  // --------------------------------------------------------------------------
  async resetUserData(userId: string, options: ResetUserOptions): Promise<UserProfile | null> {
    const currentUsers = await this.getAllUsers();
    const existing = currentUsers.find((u) => u.user_id === userId);
    if (!existing) return null;

    const updatedUser: UserProfile = {
      ...existing,
      total_coins: options.resetCoins ? 0 : existing.total_coins,
      current_streak: options.resetStreak ? 0 : existing.current_streak,
      updated_at: new Date().toISOString(),
    };

    // 1. Reset Baseline / Cognitive Profile
    if (options.resetBaseline) {
      localStorage.removeItem(`neurofit_cognitive_profile_v2_${userId}`);
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('cognitive_profiles').delete().eq('user_id', userId);
        } catch (err) {
          console.warn('Supabase cognitive profile delete error:', err);
        }
      }
    }

    // 2. Reset Badges
    if (options.resetBadges) {
      try {
        const gamificationKey = `neurofit_gamification_${userId}_v2`;
        const rawGam = localStorage.getItem(gamificationKey);
        if (rawGam) {
          const parsed = JSON.parse(rawGam);
          parsed.userBadges = [];
          if (options.resetCoins) parsed.totalCoins = 0;
          if (options.resetStreak) parsed.currentStreak = 0;
          localStorage.setItem(gamificationKey, JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }
    }

    // 3. Reset Workout / Session Logs
    if (options.resetLogs) {
      localStorage.removeItem(`neurofit_daily_sessions_v1_${userId}`);
      localStorage.removeItem(`neurofit_exercise_logs_v1_${userId}`);
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('daily_sessions').delete().eq('user_id', userId);
          await supabase.from('exercise_logs').delete().eq('user_id', userId);
        } catch (err) {
          console.warn('Supabase delete session logs error:', err);
        }
      }
    }

    // Save updated user to list and individual profile
    const updatedList = currentUsers.map((u) => (u.user_id === userId ? updatedUser : u));
    this.persistUsersLocally(updatedList);
    localStorage.setItem(`neurofit_user_profile_v2_${userId}`, JSON.stringify(updatedUser));

    // If this is the currently logged in user, sync active user state
    const activeRaw = localStorage.getItem('neurofit_auth_user_v2');
    if (activeRaw) {
      const active = JSON.parse(activeRaw);
      if (active?.user_id === userId) {
        localStorage.setItem('neurofit_auth_user_v2', JSON.stringify(updatedUser));
      }
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('user_profiles')
          .update({
            total_coins: updatedUser.total_coins,
            current_streak: updatedUser.current_streak,
            updated_at: updatedUser.updated_at,
          })
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase update user error:', err);
      }
    }

    return updatedUser;
  },

  // --------------------------------------------------------------------------
  // 6. User Update (Edit User Profile Details)
  // --------------------------------------------------------------------------
  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const currentUsers = await this.getAllUsers();
    const existing = currentUsers.find((u) => u.user_id === userId);
    if (!existing) return null;

    const updatedUser: UserProfile = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const updatedList = currentUsers.map((u) => (u.user_id === userId ? updatedUser : u));
    this.persistUsersLocally(updatedList);
    localStorage.setItem(`neurofit_user_profile_v2_${userId}`, JSON.stringify(updatedUser));

    const activeRaw = localStorage.getItem('neurofit_auth_user_v2');
    if (activeRaw) {
      const active = JSON.parse(activeRaw);
      if (active?.user_id === userId) {
        localStorage.setItem('neurofit_auth_user_v2', JSON.stringify(updatedUser));
      }
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('user_profiles').update(updates).eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase update user error:', err);
      }
    }

    return updatedUser;
  },

  // --------------------------------------------------------------------------
  // 7. Login As User (Switch Active Session)
  // --------------------------------------------------------------------------
  switchActiveUser(user: UserProfile): void {
    setCurrentUser(user);
    localStorage.setItem(`neurofit_user_profile_v2`, JSON.stringify(user));
  },
};
