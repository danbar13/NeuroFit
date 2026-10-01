import type {
  UserProfile,
  AccessibilitySettings,
  FamilyGroup,
} from '../types/database';
import { supabase, isSupabaseConfigured } from './supabase';

const USER_PROFILE_STORAGE_KEY = 'neurofit_user_profile_v2';
const ACCESSIBILITY_STORAGE_KEY = 'neurofit_accessibility_settings_v2';
const FAMILY_GROUPS_STORAGE_KEY = 'neurofit_family_groups_v1';

export const INITIAL_FAMILY_GROUPS: FamilyGroup[] = [
  {
    group_id: 'group_barkai',
    group_name: 'משפחת ברקאי',
    invite_code: 'BARK1',
    admin_user_id: 'user_david',
    created_at: '2026-09-01T00:00:00.000Z',
  },
  {
    group_id: 'group_cohen',
    group_name: 'משפחת כהן',
    invite_code: 'COHN7',
    admin_user_id: 'user_cohen_admin',
    created_at: '2026-09-05T00:00:00.000Z',
  },
  {
    group_id: 'group_levy',
    group_name: 'משפחת לוי',
    invite_code: 'LEVY3',
    admin_user_id: 'user_levy_admin',
    created_at: '2026-09-10T00:00:00.000Z',
  },
  {
    group_id: 'group_shalom',
    group_name: 'משפחת שלום',
    invite_code: 'SHAL5',
    admin_user_id: 'user_shalom_admin',
    created_at: '2026-09-12T00:00:00.000Z',
  },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  user_id: 'user_sarah',
  display_name: 'סבתא שרה',
  birth_year: 1948,
  total_coins: 340,
  current_streak: 6,
  family_group_id: 'group_barkai',
  is_admin: true,
  created_at: '2026-09-15T08:00:00.000Z',
  updated_at: '2026-09-30T10:00:00.000Z',
};

// --------------------------------------------------------------------------
// Storage Helpers
// --------------------------------------------------------------------------
function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user_id) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return { ...DEFAULT_USER_PROFILE };
}

function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

function getStoredFamilyGroups(): FamilyGroup[] {
  try {
    const raw = localStorage.getItem(FAMILY_GROUPS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [...INITIAL_FAMILY_GROUPS];
}

// --------------------------------------------------------------------------
// Settings Service
// --------------------------------------------------------------------------
export const settingsService = {
  /**
   * Fetch user profile from Supabase or LocalStorage
   */
  async getUserProfile(userId: string = 'user_sarah'): Promise<UserProfile> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (!error && data) {
          saveStoredProfile(data as UserProfile);
          return data as UserProfile;
        }
      } catch (err) {
        console.warn('Supabase profile fetch failed, using local fallback:', err);
      }
    }
    return getStoredProfile();
  },

  /**
   * Update profile fields (display_name, birth_year, etc.)
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = getStoredProfile();
    const updated: UserProfile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('user_id', userId)
          .select()
          .single();
        if (!error && data) {
          saveStoredProfile(data as UserProfile);
          return data as UserProfile;
        }
      } catch (err) {
        console.warn('Supabase profile update failed, using local update:', err);
      }
    }

    saveStoredProfile(updated);
    return updated;
  },

  /**
   * Join a family group by 5-character invite code
   */
  async joinFamilyByInviteCode(
    userId: string,
    inviteCode: string
  ): Promise<{ success: boolean; group?: FamilyGroup; error?: string }> {
    const cleanCode = inviteCode.trim().toUpperCase();

    if (cleanCode.length !== 5) {
      return { success: false, error: 'קוד ההצטרפות חייב להכיל בדיוק 5 תווים (למשל: COHN7)' };
    }

    const groups = getStoredFamilyGroups();
    const matchedGroup = groups.find((g) => g.invite_code.toUpperCase() === cleanCode);

    if (!matchedGroup) {
      return {
        success: false,
        error: 'קוד ההצטרפות אינו קיים במערכת. נסו BARK1 (משפחת ברקאי) או COHN7 (משפחת כהן).',
      };
    }

    // Update user profile with new family_group_id
    await this.updateUserProfile(userId, {
      family_group_id: matchedGroup.group_id,
    });

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('user_profiles')
          .update({ family_group_id: matchedGroup.group_id })
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase family update fallback:', err);
      }
    }

    return { success: true, group: matchedGroup };
  },

  /**
   * Get family group details by group_id
   */
  async getFamilyGroupById(groupId: string | null): Promise<FamilyGroup | null> {
    if (!groupId) return null;
    const groups = getStoredFamilyGroups();
    return groups.find((g) => g.group_id === groupId) || null;
  },

  /**
   * Persistently sync accessibility settings to backend table Accessibility_Settings
   */
  async saveAccessibilitySettings(
    userId: string = 'user_sarah',
    settings: {
      font_size_multiplier: number;
      high_contrast: boolean;
      reduce_animations: boolean;
      sound_enabled: boolean;
    }
  ): Promise<void> {
    const record: AccessibilitySettings = {
      user_id: userId,
      font_size_multiplier: settings.font_size_multiplier,
      high_contrast: settings.high_contrast,
      reduce_animations: settings.reduce_animations,
      sound_enabled: settings.sound_enabled,
      updated_at: new Date().toISOString(),
    };

    // Save locally
    try {
      localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(record));
    } catch {
      // ignore
    }

    // Trigger database upsert in background
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('accessibility_settings').upsert(record);
      } catch (err) {
        console.warn('Background sync to Accessibility_Settings failed:', err);
      }
    }
  },

  /**
   * Secure Logout function
   */
  async logoutUser(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    // We keep accessibility preferences so the device stays accessible, but can reset active session
  },
};
