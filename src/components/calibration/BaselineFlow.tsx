import React, { useState } from 'react';
import { ExerciseHeader } from '../exercise/ExerciseHeader';
import { ExerciseFooter } from '../exercise/ExerciseFooter';
import { AccessibilityModal } from '../accessibility/AccessibilityModal';
import { ScientificRationaleModal } from '../exercise/ScientificRationaleModal';
import { PauseModal } from '../exercise/PauseModal';
import { OnboardingIntro } from './OnboardingIntro';
import { ExerciseRenderer } from '../exercises/ExerciseRenderer';
import { CalibrationResults } from './CalibrationResults';
import { computeCalibrationResults, type CalibrationSummary } from '../../lib/calibrationEngine';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useGamification } from '../../context/GamificationContext';
import { FamilyCoopModal } from '../gamification/FamilyCoopModal';
import { CoinRewardModal } from '../gamification/CoinRewardModal';
import { BadgeUnlockedModal } from '../gamification/BadgeUnlockedModal';
import { NotificationToast } from '../gamification/NotificationToast';
import { baselineContentMatrix } from '../../data/baselineContentMatrix';
import { saveCognitiveProfile } from '../../lib/authStateService';
import type { ExerciseCategory, ScientificRationaleInfo } from '../../types/exercise';
import type { UserProfile } from '../../types/database';

type CalibrationStage = 'intro' | 'test1' | 'test2' | 'test3' | 'test4' | 'results';

interface BaselineFlowProps {
  currentUser?: UserProfile | null;
  onComplete?: (summary?: CalibrationSummary) => void;
  onExit?: () => void;
}

export const BaselineFlow: React.FC<BaselineFlowProps> = ({ currentUser, onComplete, onExit }) => {
  const { theme, highContrast, language, t } = useAccessibility();
  const {
    lastSessionReward,
    newlyUnlockedBadge,
    activeNotification,
    dismissNotification,
    dismissRewardModal,
    dismissBadgeModal,
  } = useGamification();

  const [stage, setStage] = useState<CalibrationStage>('intro');
  const [hasCompletedFeedback, setHasCompletedFeedback] = useState<boolean>(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState<boolean>(false);

  // Modals state
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  const [isRationaleOpen, setIsRationaleOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Test metrics store for Hidden Scoring Algorithm
  const [testMetrics, setTestMetrics] = useState<Record<ExerciseCategory, { correctCount: number; totalCount: number; totalResponseTimeMs: number }>>({
    memory: { correctCount: 0, totalCount: 0, totalResponseTimeMs: 0 },
    attention: { correctCount: 0, totalCount: 0, totalResponseTimeMs: 0 },
    speed: { correctCount: 0, totalCount: 0, totalResponseTimeMs: 0 },
    language: { correctCount: 0, totalCount: 0, totalResponseTimeMs: 0 },
  });

  const [calibrationSummary, setCalibrationSummary] = useState<CalibrationSummary | null>(null);

  // Record feedback for specific test
  const recordFeedback = (category: ExerciseCategory, isCorrect: boolean, responseTimeMs: number) => {
    setTestMetrics((prev) => ({
      ...prev,
      [category]: {
        correctCount: prev[category].correctCount + (isCorrect ? 1 : 0),
        totalCount: prev[category].totalCount + 1,
        totalResponseTimeMs: prev[category].totalResponseTimeMs + responseTimeMs,
      },
    }));
    setHasCompletedFeedback(true);
  };

  const getCurrentStepNumber = (): number => {
    switch (stage) {
      case 'test1': return 1;
      case 'test2': return 2;
      case 'test3': return 3;
      case 'test4': return 4;
      default: return 1;
    }
  };

  const getStepTitle = (): string => {
    switch (stage) {
      case 'test1': return t.test1Category;
      case 'test2': return t.test2Category;
      case 'test3': return t.test3Category;
      case 'test4': return t.test4Category;
      default: return '';
    }
  };

  const getCurrentRationale = (): ScientificRationaleInfo => {
    const exercises = baselineContentMatrix[language].exercises;

    switch (stage) {
      case 'test1': {
        const r = exercises.ex_working_memory.rationale;
        return {
          title: r.title,
          category: 'memory',
          what_we_train: r.what_we_train,
          daily_benefit: r.daily_benefit,
        };
      }
      case 'test2': {
        const r = exercises.ex_visual_search.rationale;
        return {
          title: r.title,
          category: 'attention',
          what_we_train: r.what_we_train,
          daily_benefit: r.daily_benefit,
        };
      }
      case 'test3': {
        const r = exercises.ex_task_switching.rationale;
        return {
          title: r.title,
          category: 'speed',
          what_we_train: r.what_we_train,
          daily_benefit: r.daily_benefit,
        };
      }
      case 'test4':
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

  const handleNextStep = () => {
    setHasCompletedFeedback(false);

    if (stage === 'test1') {
      setStage('test2');
    } else if (stage === 'test2') {
      setStage('test3');
    } else if (stage === 'test3') {
      setStage('test4');
    } else if (stage === 'test4') {
      // Calculate calibration results with hidden algorithm
      const summary = computeCalibrationResults(testMetrics);
      setCalibrationSummary(summary);
      if (currentUser) {
        saveCognitiveProfile({
          user_id: currentUser.user_id,
          memory_level: summary.memoryLevel,
          attention_level: summary.attentionLevel,
          speed_level: summary.speedLevel,
          language_level: summary.languageLevel,
          baseline_completed: true,
          last_assessed_at: new Date().toISOString(),
        });
      }
      setStage('results');
    }
  };

  const handleRecalibrate = () => {
    setTestMetrics({
      memory: { correctCount: 0, totalCount: 0, totalResponseTimeMs: 0 },
      attention: { correctCount: 0, totalCount: 0, totalResponseTimeMs: 0 },
      speed: { correctCount: 0, totalCount: 0, totalResponseTimeMs: 0 },
      language: { correctCount: 0, totalCount: 0, totalResponseTimeMs: 0 },
    });
    setCalibrationSummary(null);
    setHasCompletedFeedback(false);
    setStage('intro');
  };

  const handleSkipBaseline = () => {
    if (currentUser) {
      saveCognitiveProfile({
        user_id: currentUser.user_id,
        memory_level: 2,
        attention_level: 2,
        speed_level: 2,
        language_level: 2,
        baseline_completed: true,
        last_assessed_at: new Date().toISOString(),
      });
    }
    if (onComplete) {
      onComplete();
    }
  };

  const isTestingStage = stage === 'test1' || stage === 'test2' || stage === 'test3' || stage === 'test4';

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
        hideProgress={!isTestingStage}
        onHome={handleSkipBaseline}
        onPause={() => setIsPaused(true)}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpenGamification={() => setIsFamilyModalOpen(true)}
      />

      {/* 2. MAIN INTERACTION AREA */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6 pb-24 sm:pb-28 max-w-4xl w-full mx-auto"
        role="main"
      >
        {stage === 'intro' && (
          <OnboardingIntro
            onStart={() => setStage('test1')}
            onSkip={handleSkipBaseline}
          />
        )}

        {stage === 'test1' && (
          <div className="w-full flex flex-col items-center">
            <ExerciseRenderer
              category="memory"
              levelNumber={2}
              onFeedbackGiven={(correct, time) => recordFeedback('memory', correct, time)}
            />
          </div>
        )}

        {stage === 'test2' && (
          <div className="w-full flex flex-col items-center">
            <ExerciseRenderer
              category="attention"
              levelNumber={2}
              onFeedbackGiven={(correct, time) => recordFeedback('attention', correct, time)}
            />
          </div>
        )}

        {stage === 'test3' && (
          <div className="w-full flex flex-col items-center">
            <ExerciseRenderer
              category="speed"
              levelNumber={2}
              onFeedbackGiven={(correct, time) => recordFeedback('speed', correct, time)}
            />
          </div>
        )}

        {stage === 'test4' && (
          <div className="w-full flex flex-col items-center">
            <ExerciseRenderer
              category="language"
              levelNumber={2}
              onFeedbackGiven={(correct, time) => recordFeedback('language', correct, time)}
            />
          </div>
        )}

        {stage === 'results' && calibrationSummary && (
          <CalibrationResults
            summary={calibrationSummary}
            onProceedToDaily={() => {
              onComplete?.(calibrationSummary);
            }}
            onRecalibrate={handleRecalibrate}
          />
        )}
      </main>

      {/* 3. BOTTOM BAR (Sticky) */}
      {isTestingStage && (
        <ExerciseFooter
          showNext={hasCompletedFeedback}
          onNext={handleNextStep}
          onOpenRationale={() => setIsRationaleOpen(true)}
          nextButtonLabel={stage === 'test4' ? t.completeSession : t.nextExercise}
        />
      )}

      {/* Accessibility & Rationale Modals */}
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
          if (onExit) {
            onExit();
          } else {
            setStage('intro');
          }
        }}
      />

      {/* Gamification Modals (Tickets G-1, G-2, G-3, G-4, G-5) */}
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
