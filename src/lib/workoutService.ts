import type { CognitiveProfile, DailySession, ExerciseLog } from '../types/database';
import type { ExerciseCategory } from '../types/exercise';
import { evaluateDDA, type DDAResult } from './ddaEngine';
import {
  getCognitiveProfile as getAuthCognitiveProfile,
  saveCognitiveProfile as saveAuthCognitiveProfile,
} from './authStateService';

const COGNITIVE_PROFILE_KEY = 'neurofit_cognitive_profile_v1';
const DAILY_SESSIONS_KEY = 'neurofit_daily_sessions_v1';
const EXERCISE_LOGS_KEY = 'neurofit_exercise_logs_v1';

export const DEFAULT_COGNITIVE_PROFILE: CognitiveProfile = {
  user_id: 'user_sarah',
  memory_level: 2,
  attention_level: 2,
  speed_level: 2,
  language_level: 2,
  baseline_completed: true,
  last_assessed_at: new Date().toISOString(),
};

export interface ExerciseSessionLogItem {
  category: ExerciseCategory;
  level_played: number;
  accuracy_score: number; // 0 - 100
  avg_response_time_ms: number;
}

export interface WorkoutCompletionResult {
  session: DailySession;
  exerciseLogs: ExerciseLog[];
  previousProfile: CognitiveProfile;
  updatedProfile: CognitiveProfile;
  ddaResults: Record<ExerciseCategory, DDAResult>;
}

/**
 * Loads current user's cognitive profile from local storage (or fallback default).
 */
export function getStoredCognitiveProfile(userId?: string): CognitiveProfile {
  // 1. Try auth-scoped profile if userId provided
  if (userId) {
    const authProfile = getAuthCognitiveProfile(userId);
    if (authProfile) {
      return authProfile;
    }
  }

  // 2. Try looking up current user from auth state
  try {
    const rawUser = localStorage.getItem('neurofit_auth_user_v2');
    if (rawUser) {
      const parsedUser = JSON.parse(rawUser);
      if (parsedUser?.user_id && (!userId || parsedUser.user_id === userId)) {
        const authProfile = getAuthCognitiveProfile(parsedUser.user_id);
        if (authProfile) {
          return authProfile;
        }
        return {
          user_id: parsedUser.user_id,
          memory_level: 2,
          attention_level: 2,
          speed_level: 2,
          language_level: 2,
          baseline_completed: false,
          last_assessed_at: '',
        };
      }
    }
  } catch {
    // Ignore parse error
  }

  // 3. Fallback to v1 legacy profile
  try {
    const raw = localStorage.getItem(COGNITIVE_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.memory_level === 'number') {
        if (!userId || parsed.user_id === userId) {
          return parsed;
        }
      }
    }
  } catch {
    // Ignore parse error
  }

  return {
    ...DEFAULT_COGNITIVE_PROFILE,
    user_id: userId || DEFAULT_COGNITIVE_PROFILE.user_id,
  };
}

/**
 * Saves cognitive profile to local storage.
 */
export function saveCognitiveProfile(profile: CognitiveProfile): void {
  try {
    localStorage.setItem(COGNITIVE_PROFILE_KEY, JSON.stringify(profile));
    saveAuthCognitiveProfile(profile);
  } catch {
    // Ignore storage error
  }
}

/**
 * Executes full completion of a 4-exercise daily workout:
 * 1. Inserts record into Daily_Sessions (coins_earned: 50).
 * 2. Inserts 4 items into Exercise_Logs linked to session_id.
 * 3. Runs DDA for each category (evaluating accuracy_score & avg_response_time_ms).
 * 4. Updates Cognitive_Profile with new levels (1-10 clamped, bias towards success).
 */
export function completeDailyWorkoutSession(
  exerciseLogsData: ExerciseSessionLogItem[],
  userId: string = 'user_sarah',
  durationSeconds: number = 180
): WorkoutCompletionResult {
  const previousProfile = getStoredCognitiveProfile(userId);
  const sessionId = `session_${Date.now()}`;
  const nowIso = new Date().toISOString();

  // 1. Daily Session Record
  const session: DailySession = {
    session_id: sessionId,
    user_id: userId,
    completed_at: nowIso,
    coins_earned: 50,
    duration_seconds: durationSeconds,
  };

  // 2. Exercise Logs Records
  const exerciseLogs: ExerciseLog[] = exerciseLogsData.map((item, idx) => ({
    log_id: `log_${Date.now()}_${idx}`,
    session_id: sessionId,
    user_id: userId,
    category: item.category,
    level_played: item.level_played,
    accuracy_score: item.accuracy_score,
    avg_response_time_ms: item.avg_response_time_ms,
    played_at: nowIso,
  }));

  // 3. Run DDA on each category
  const categories: ExerciseCategory[] = ['memory', 'attention', 'speed', 'language'];
  const ddaResults: Record<ExerciseCategory, DDAResult> = {} as Record<ExerciseCategory, DDAResult>;

  const updatedProfile: CognitiveProfile = {
    ...previousProfile,
    last_assessed_at: nowIso,
  };

  categories.forEach((cat) => {
    const logItem = exerciseLogsData.find((l) => l.category === cat);
    const currentLevel = previousProfile[`${cat}_level`];

    if (logItem) {
      const result = evaluateDDA(
        currentLevel,
        logItem.accuracy_score, // handles 0-100 or 0.0-1.0
        logItem.avg_response_time_ms
      );
      ddaResults[cat] = result;
      updatedProfile[`${cat}_level`] = result.newLevel;
    } else {
      // Maintain if not played
      ddaResults[cat] = {
        previousLevel: currentLevel,
        newLevel: currentLevel,
        action: 'maintain',
        accuracy: 1,
        avgResponseTimeMs: 2500,
        reason: {
          he: 'נשמרה רמה',
          en: 'Maintained level',
        },
      };
    }
  });

  // Save updated profile
  saveCognitiveProfile(updatedProfile);

  // Persist session and logs
  try {
    const storedSessions = JSON.parse(localStorage.getItem(DAILY_SESSIONS_KEY) || '[]');
    storedSessions.unshift(session);
    localStorage.setItem(DAILY_SESSIONS_KEY, JSON.stringify(storedSessions.slice(0, 50)));

    const storedLogs = JSON.parse(localStorage.getItem(EXERCISE_LOGS_KEY) || '[]');
    localStorage.setItem(EXERCISE_LOGS_KEY, JSON.stringify([...exerciseLogs, ...storedLogs].slice(0, 100)));
  } catch {
    // Ignore storage errors
  }

  return {
    session,
    exerciseLogs,
    previousProfile,
    updatedProfile,
    ddaResults,
  };
}
