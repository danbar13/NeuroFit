import type { ExerciseCategory } from '../types/exercise';
import type { CognitiveProfile } from '../types/database';

/**
 * DDA Configuration Thresholds
 * Designed specifically for seniors (65+):
 * - Bias towards success (easier to step down than to step up, preventing cognitive frustration)
 * - Flow State preservation (maintaining comfort-plus challenge)
 */
export const DDA_CONFIG = {
  MIN_LEVEL: 1,
  MAX_LEVEL: 10,
  PROMOTE_ACCURACY_THRESHOLD: 0.85, // 85% accuracy needed to level up
  PROMOTE_TIME_THRESHOLD_MS: 3000,  // Under 3 seconds avg response
  DEMOTE_ACCURACY_THRESHOLD: 0.60,  // Drop below 60% causes level down
  DEMOTE_TIME_THRESHOLD_MS: 6000,   // Over 6 seconds avg response causes level down
} as const;

export type DDAAction = 'promote' | 'demote' | 'maintain';

export interface DDAResult {
  previousLevel: number;
  newLevel: number;
  action: DDAAction;
  accuracy: number; // 0.0 - 1.0
  avgResponseTimeMs: number;
  reason: {
    he: string;
    en: string;
  };
}

/**
 * Normalizes accuracy input to a 0.0 - 1.0 float scale.
 * Supports both percentage input (0-100) and decimal ratio (0.0-1.0).
 */
export function normalizeAccuracy(rawAccuracy: number): number {
  if (rawAccuracy > 1) {
    return Math.min(Math.max(rawAccuracy / 100, 0), 1);
  }
  return Math.min(Math.max(rawAccuracy, 0), 1);
}

/**
 * Calculates the next difficulty level for a specific cognitive category.
 * 
 * @param currentLevel The user's current level in this category (1-10)
 * @param accuracy Float representing accuracy percentage (0.0 to 1.0 or 0 to 100)
 * @param avgResponseTimeMs Integer representing average time per action in milliseconds
 * @param config Optional custom thresholds config (defaults to DDA_CONFIG)
 * @returns new level Integer (1-10)
 */
export function calculateNextLevel(
  currentLevel: number,
  accuracy: number,
  avgResponseTimeMs: number,
  config = DDA_CONFIG
): number {
  const normAccuracy = normalizeAccuracy(accuracy);
  let nextLevel = currentLevel;

  // Rule 1: Check for Promotion (Level Up)
  // Must be highly accurate AND reasonably fast
  if (
    normAccuracy >= config.PROMOTE_ACCURACY_THRESHOLD &&
    avgResponseTimeMs <= config.PROMOTE_TIME_THRESHOLD_MS
  ) {
    nextLevel += 1;
  }
  // Rule 2: Check for Demotion (Level Down)
  // Drop level if accuracy is poor OR if user is struggling significantly with time
  // (Bias towards success: prevent frustration)
  else if (
    normAccuracy <= config.DEMOTE_ACCURACY_THRESHOLD ||
    avgResponseTimeMs >= config.DEMOTE_TIME_THRESHOLD_MS
  ) {
    nextLevel -= 1;
  }

  // Rule 3: Enforce Boundaries (Min 1, Max 10)
  if (nextLevel < config.MIN_LEVEL) return config.MIN_LEVEL;
  if (nextLevel > config.MAX_LEVEL) return config.MAX_LEVEL;

  // If no conditions met, maintain current level (Flow State)
  return nextLevel;
}

/**
 * Evaluates exercise metrics and provides a comprehensive DDA report with bilingual explanations.
 */
export function evaluateDDA(
  currentLevel: number,
  rawAccuracy: number,
  avgResponseTimeMs: number,
  config = DDA_CONFIG
): DDAResult {
  const accuracy = normalizeAccuracy(rawAccuracy);
  const newLevel = calculateNextLevel(currentLevel, accuracy, avgResponseTimeMs, config);
  
  let action: DDAAction = 'maintain';
  if (newLevel > currentLevel) {
    action = 'promote';
  } else if (newLevel < currentLevel) {
    action = 'demote';
  }

  const accuracyPct = Math.round(accuracy * 100);
  const timeSeconds = (avgResponseTimeMs / 1000).toFixed(1);

  let reasonHe = '';
  let reasonEn = '';

  if (action === 'promote') {
    reasonHe = `עליית רמה ל-${newLevel}: ביצוע מעולה! דיוק של ${accuracyPct}% וזמן תגובה מהיר (${timeSeconds} שניות).`;
    reasonEn = `Promoted to Level ${newLevel}: Outstanding performance! ${accuracyPct}% accuracy and fast response time (${timeSeconds}s).`;
  } else if (action === 'demote') {
    if (accuracy <= config.DEMOTE_ACCURACY_THRESHOLD) {
      reasonHe = `התאמה רגועה לרמה ${newLevel}: הפחתת עומס כדי להבטיח חוויה נינוחה והצלחה מתמשכת.`;
      reasonEn = `Adjusted to Level ${newLevel}: Decreased difficulty to maintain a comfortable pace and prevent frustration.`;
    } else {
      reasonHe = `התאמה רגועה לרמה ${newLevel}: מתן מרחב וזמן תגובה מרווחים יותר.`;
      reasonEn = `Adjusted to Level ${newLevel}: Allowing extra time and a more relaxed pace.`;
    }
  } else {
    reasonHe = `שמירה על רמה ${newLevel}: אזור הזרימה המושלם (Flow State) עבורך.`;
    reasonEn = `Maintained Level ${newLevel}: Staying in your optimal Flow State zone.`;
  }

  return {
    previousLevel: currentLevel,
    newLevel,
    action,
    accuracy,
    avgResponseTimeMs,
    reason: {
      he: reasonHe,
      en: reasonEn,
    },
  };
}

/**
 * Simulates or handles exercise completion for user profile state.
 * Compatible with Supabase Client / Local Storage / React State.
 */
export function processExerciseDDA(
  currentProfile: CognitiveProfile,
  category: ExerciseCategory,
  accuracy: number,
  avgResponseTimeMs: number
): {
  updatedProfile: CognitiveProfile;
  ddaResult: DDAResult;
} {
  const categoryField = `${category}_level` as const;
  const currentCategoryLevel = currentProfile[categoryField] ?? 1;

  const ddaResult = evaluateDDA(currentCategoryLevel, accuracy, avgResponseTimeMs);

  const updatedProfile: CognitiveProfile = {
    ...currentProfile,
    [categoryField]: ddaResult.newLevel,
    last_assessed_at: new Date().toISOString(),
  };

  return {
    updatedProfile,
    ddaResult,
  };
}
