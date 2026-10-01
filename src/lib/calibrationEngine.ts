import type { ExerciseCategory } from '../types/exercise';

export interface TestResultItem {
  category: ExerciseCategory;
  accuracy: boolean; // true = 100%, false = 0%
  responseTimeMs: number;
}

export interface CalibrationSummary {
  memoryLevel: 1 | 2 | 3;
  attentionLevel: 1 | 2 | 3;
  speedLevel: 1 | 2 | 3;
  languageLevel: 1 | 2 | 3;
  overallAccuracyPercent: number;
  averageResponseTimeSeconds: number;
  welcomeCoins: number;
}

/**
 * PRD Calibration Formula:
 * - Accuracy > 85% & Fast (< 2.5s) => Level 3 (Advanced)
 * - Accuracy 60-84% & Avg (2.5 - 5.0s) => Level 2 (Standard)
 * - Accuracy < 60% or Slow (> 5.0s) => Level 1 (Maximal hints, slowest pace)
 */
export function calculateCategoryLevel(accuracyRatio: number, avgResponseTimeMs: number): 1 | 2 | 3 {
  const seconds = avgResponseTimeMs / 1000;

  if (accuracyRatio >= 0.85 && seconds <= 2.5) {
    return 3;
  } else if (accuracyRatio >= 0.60 && seconds <= 5.0) {
    return 2;
  } else {
    return 1;
  }
}

export function computeCalibrationResults(results: Record<ExerciseCategory, { correctCount: number; totalCount: number; totalResponseTimeMs: number }>): CalibrationSummary {
  const categories: ExerciseCategory[] = ['memory', 'attention', 'speed', 'language'];
  
  const levels: Record<ExerciseCategory, 1 | 2 | 3> = {
    memory: 2,
    attention: 2,
    speed: 2,
    language: 2,
  };

  let totalCorrect = 0;
  let totalTrials = 0;
  let accumulatedTimeMs = 0;

  categories.forEach((cat) => {
    const data = results[cat] || { correctCount: 1, totalCount: 1, totalResponseTimeMs: 3000 };
    const ratio = data.totalCount > 0 ? data.correctCount / data.totalCount : 0.7;
    const avgTime = data.totalCount > 0 ? data.totalResponseTimeMs / data.totalCount : 3000;
    
    levels[cat] = calculateCategoryLevel(ratio, avgTime);

    totalCorrect += data.correctCount;
    totalTrials += data.totalCount;
    accumulatedTimeMs += data.totalResponseTimeMs;
  });

  const overallAccuracyPercent = totalTrials > 0 ? Math.round((totalCorrect / totalTrials) * 100) : 80;
  const averageResponseTimeSeconds = totalTrials > 0 ? parseFloat((accumulatedTimeMs / totalTrials / 1000).toFixed(2)) : 3.2;

  return {
    memoryLevel: levels.memory,
    attentionLevel: levels.attention,
    speedLevel: levels.speed,
    languageLevel: levels.language,
    overallAccuracyPercent,
    averageResponseTimeSeconds,
    welcomeCoins: 50, // Welcome gift coins
  };
}
