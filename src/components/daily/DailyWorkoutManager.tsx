import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useGamification } from '../../context/GamificationContext';
import { ExerciseHeader } from '../exercise/ExerciseHeader';
import { ExerciseFooter } from '../exercise/ExerciseFooter';
import { AccessibilityModal } from '../accessibility/AccessibilityModal';
import { ScientificRationaleModal } from '../exercise/ScientificRationaleModal';
import { PauseModal } from '../exercise/PauseModal';
import { FamilyCoopModal } from '../gamification/FamilyCoopModal';
import { CoinRewardModal } from '../gamification/CoinRewardModal';
import { BadgeUnlockedModal } from '../gamification/BadgeUnlockedModal';
import { NotificationToast } from '../gamification/NotificationToast';

import { ExerciseRenderer } from '../exercises/ExerciseRenderer';
import { IntermissionScreen } from './IntermissionScreen';
import { DailySummaryScreen } from './DailySummaryScreen';

import { baselineContentMatrix } from '../../data/baselineContentMatrix';
import {
  getStoredCognitiveProfile,
  completeDailyWorkoutSession,
  type ExerciseSessionLogItem,
  type WorkoutCompletionResult,
} from '../../lib/workoutService';
import type { ExerciseCategory, ScientificRationaleInfo } from '../../types/exercise';
import type { CognitiveProfile } from '../../types/database';

interface DailyWorkoutManagerProps {
  onReturnToHome: () => void;
  onOpenFamilyDashboard?: () => void;
}

type WorkoutFlowState =
  | 'ex1_memory'
  | 'intermission_1'
  | 'ex2_attention'
  | 'intermission_2'
  | 'ex3_speed'
  | 'intermission_3'
  | 'ex4_language'
  | 'summary';

export const DailyWorkoutManager: React.FC<DailyWorkoutManagerProps> = ({
  onReturnToHome,
  onOpenFamilyDashboard,
}) => {
  const { theme, highContrast, language, t } = useAccessibility();
  const {
    lastSessionReward,
    newlyUnlockedBadge,
    activeNotification,
    completeDailyWorkout,
    dismissNotification,
    dismissRewardModal,
    dismissBadgeModal,
  } = useGamification();

  // 1. Initial State & Profile
  const [profile, setProfile] = useState<CognitiveProfile>(getStoredCognitiveProfile);
  const [flowState, setFlowState] = useState<WorkoutFlowState>('ex1_memory');
  const [hasCompletedFeedback, setHasCompletedFeedback] = useState<boolean>(false);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseSessionLogItem[]>([]);
  const [workoutResult, setWorkoutResult] = useState<WorkoutCompletionResult | null>(null);

  // Modals state
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  const [isRationaleOpen, setIsRationaleOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState<boolean>(false);

  // Duration tracking
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Reload profile on mount
  useEffect(() => {
    setProfile(getStoredCognitiveProfile());
    sessionStartTimeRef.current = Date.now();
  }, []);

  // Feedback recording from an active exercise
  const handleFeedback = (category: ExerciseCategory, isCorrect: boolean, responseTimeMs: number) => {
    const levelPlayed = profile[`${category}_level`];
    const logItem: ExerciseSessionLogItem = {
      category,
      level_played: levelPlayed,
      accuracy_score: isCorrect ? 100 : 0,
      avg_response_time_ms: responseTimeMs,
    };

    setExerciseLogs((prev) => [...prev.filter((l) => l.category !== category), logItem]);
    setHasCompletedFeedback(true);
  };

  // Step calculations for header progress
  const getCurrentStepNumber = (): number => {
    switch (flowState) {
      case 'ex1_memory':
      case 'intermission_1':
        return 1;
      case 'ex2_attention':
      case 'intermission_2':
        return 2;
      case 'ex3_speed':
      case 'intermission_3':
        return 3;
      case 'ex4_language':
      case 'summary':
        return 4;
      default:
        return 1;
    }
  };

  const getCurrentCategory = (): ExerciseCategory => {
    switch (flowState) {
      case 'ex1_memory':
      case 'intermission_1':
        return 'memory';
      case 'ex2_attention':
      case 'intermission_2':
        return 'attention';
      case 'ex3_speed':
      case 'intermission_3':
        return 'speed';
      case 'ex4_language':
      case 'summary':
      default:
        return 'language';
    }
  };

  const getStepTitle = (): string => {
    switch (flowState) {
      case 'ex1_memory':
        return `${t.test1Category} (Level ${profile.memory_level})`;
      case 'ex2_attention':
        return `${t.test2Category} (Level ${profile.attention_level})`;
      case 'ex3_speed':
        return `${t.test3Category} (Level ${profile.speed_level})`;
      case 'ex4_language':
        return `${t.test4Category} (Level ${profile.language_level})`;
      default:
        return language === 'he' ? 'אימון יומי' : 'Daily Workout';
    }
  };

  const getCurrentRationale = (): ScientificRationaleInfo => {
    const exercises = baselineContentMatrix[language].exercises;
    const cat = getCurrentCategory();

    switch (cat) {
      case 'memory': {
        const r = exercises.ex_working_memory.rationale;
        return {
          title: r.title,
          category: 'memory',
          what_we_train: r.what_we_train,
          daily_benefit: r.daily_benefit,
        };
      }
      case 'attention': {
        const r = exercises.ex_visual_search.rationale;
        return {
          title: r.title,
          category: 'attention',
          what_we_train: r.what_we_train,
          daily_benefit: r.daily_benefit,
        };
      }
      case 'speed': {
        const r = exercises.ex_task_switching.rationale;
        return {
          title: r.title,
          category: 'speed',
          what_we_train: r.what_we_train,
          daily_benefit: r.daily_benefit,
        };
      }
      case 'language':
      default: {
        const r = exercises.ex_semantic_retrieval.rationale;
        return {
          title: r.title,
          category: 'language',
          what_we_train: r.what_we_train,
          daily_benefit: r.daily_benefit,
        };
      }
    }
  };

  // Next Step Handlers (NO auto-advance)
  const handleProceedFromExercise = () => {
    setHasCompletedFeedback(false);

    if (flowState === 'ex1_memory') {
      setFlowState('intermission_1');
    } else if (flowState === 'ex2_attention') {
      setFlowState('intermission_2');
    } else if (flowState === 'ex3_speed') {
      setFlowState('intermission_3');
    } else if (flowState === 'ex4_language') {
      // 4th exercise completed! Execute session completion & DDA!
      finalizeWorkoutSession();
    }
  };

  const finalizeWorkoutSession = () => {
    const durationSeconds = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);

    // 1. Process DDA, DB logs, and save profile
    const result = completeDailyWorkoutSession(exerciseLogs, profile.user_id, durationSeconds);
    setWorkoutResult(result);
    setProfile(result.updatedProfile);

    // 2. Trigger gamification reward (+50 coins, 7-day streak bonus check, badges check)
    completeDailyWorkout();

    // 3. Move to summary screen
    setFlowState('summary');
  };

  const isExerciseActive =
    flowState === 'ex1_memory' ||
    flowState === 'ex2_attention' ||
    flowState === 'ex3_speed' ||
    flowState === 'ex4_language';

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-150 ${
        highContrast
          ? 'bg-black text-white'
          : theme === 'dark'
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. TOP BAR (Sticky) */}
      <ExerciseHeader
        currentStep={getCurrentStepNumber()}
        totalSteps={4}
        title={getStepTitle()}
        hideProgress={flowState === 'summary'}
        onHome={onReturnToHome}
        onPause={() => setIsPaused(true)}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpenGamification={() => setIsFamilyModalOpen(true)}
      />

      {/* 2. MAIN INTERACTION AREA */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6 max-w-4xl w-full mx-auto"
        role="main"
      >
        {/* Exercise 1: Memory */}
        {flowState === 'ex1_memory' && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <ExerciseRenderer
              category="memory"
              levelNumber={profile.memory_level}
              onFeedbackGiven={(correct, time) => handleFeedback('memory', correct, time)}
            />
          </div>
        )}

        {/* Intermission 1 */}
        {flowState === 'intermission_1' && (
          <IntermissionScreen
            completedCategory="memory"
            nextCategory="attention"
            currentStep={1}
            totalSteps={4}
            onProceed={() => setFlowState('ex2_attention')}
          />
        )}

        {/* Exercise 2: Attention */}
        {flowState === 'ex2_attention' && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <ExerciseRenderer
              category="attention"
              levelNumber={profile.attention_level}
              onFeedbackGiven={(correct, time) => handleFeedback('attention', correct, time)}
            />
          </div>
        )}

        {/* Intermission 2 */}
        {flowState === 'intermission_2' && (
          <IntermissionScreen
            completedCategory="attention"
            nextCategory="speed"
            currentStep={2}
            totalSteps={4}
            onProceed={() => setFlowState('ex3_speed')}
          />
        )}

        {/* Exercise 3: Speed */}
        {flowState === 'ex3_speed' && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <ExerciseRenderer
              category="speed"
              levelNumber={profile.speed_level}
              onFeedbackGiven={(correct, time) => handleFeedback('speed', correct, time)}
            />
          </div>
        )}

        {/* Intermission 3 */}
        {flowState === 'intermission_3' && (
          <IntermissionScreen
            completedCategory="speed"
            nextCategory="language"
            currentStep={3}
            totalSteps={4}
            onProceed={() => setFlowState('ex4_language')}
          />
        )}

        {/* Exercise 4: Language */}
        {flowState === 'ex4_language' && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <ExerciseRenderer
              category="language"
              levelNumber={profile.language_level}
              onFeedbackGiven={(correct, time) => handleFeedback('language', correct, time)}
            />
          </div>
        )}

        {/* Summary Screen */}
        {flowState === 'summary' && workoutResult && (
          <DailySummaryScreen
            workoutResult={workoutResult}
            onReturnHome={onReturnToHome}
            onOpenFamilyClub={() => {
              if (onOpenFamilyDashboard) {
                onOpenFamilyDashboard();
              } else {
                setIsFamilyModalOpen(true);
              }
            }}
          />
        )}
      </main>

      {/* 3. BOTTOM BAR (Sticky) - appears ONLY during active exercises and when feedback given */}
      {isExerciseActive && (
        <ExerciseFooter
          showNext={hasCompletedFeedback}
          onNext={handleProceedFromExercise}
          onOpenRationale={() => setIsRationaleOpen(true)}
          nextButtonLabel={flowState === 'ex4_language' ? (language === 'he' ? 'סיים אימון יומי 🎉' : 'Finish Daily Workout 🎉') : t.nextExercise}
        />
      )}

      {/* Modals & Overlays */}
      <AccessibilityModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />

      <ScientificRationaleModal
        isOpen={isRationaleOpen}
        onClose={() => setIsRationaleOpen(false)}
        rationale={getCurrentRationale()}
      />

      <PauseModal
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onExit={() => {
          setIsPaused(false);
          onReturnToHome();
        }}
      />

      {/* Family Gamification Modals */}
      <FamilyCoopModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
      />

      <CoinRewardModal
        reward={lastSessionReward}
        onClose={dismissRewardModal}
      />

      <BadgeUnlockedModal
        badge={newlyUnlockedBadge}
        onClose={dismissBadgeModal}
      />

      <NotificationToast
        notification={activeNotification}
        onDismiss={dismissNotification}
      />
    </div>
  );
};
