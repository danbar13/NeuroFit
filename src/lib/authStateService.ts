import type { UserProfile, CognitiveProfile } from '../types/database';

const CURRENT_USER_KEY = 'neurofit_auth_user_v2';
const COGNITIVE_PROFILE_KEY = 'neurofit_cognitive_profile_v2';

/**
 * Returns currently logged-in user profile or null if not yet authenticated.
 */
export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.user_id || parsed.id)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Sets active user profile.
 */
export function setCurrentUser(user: UserProfile): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

/**
 * Log out and clear user state.
 */
export function clearCurrentUser(): void {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(COGNITIVE_PROFILE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Gets cognitive profile for a user. Returns null if baseline assessment has never been completed.
 */
export function getCognitiveProfile(userId: string): CognitiveProfile | null {
  try {
    const raw = localStorage.getItem(`${COGNITIVE_PROFILE_KEY}_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.memory_level === 'number' && parsed.last_assessed_at) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Saves cognitive profile after Baseline Test or Daily Workout DDA.
 */
export function saveCognitiveProfile(profile: CognitiveProfile): void {
  try {
    localStorage.setItem(`${COGNITIVE_PROFILE_KEY}_${profile.user_id}`, JSON.stringify(profile));
  } catch {
    // ignore
  }
}
