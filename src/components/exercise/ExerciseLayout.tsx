import React, { useState } from 'react';
import { ExerciseHeader } from './ExerciseHeader';
import { ExerciseFooter } from './ExerciseFooter';
import { AccessibilityModal } from '../accessibility/AccessibilityModal';
import { ScientificRationaleModal } from './ScientificRationaleModal';
import { PauseModal } from './PauseModal';
import { InteractiveDemoArea } from './InteractiveDemoArea';
import type { ScientificRationaleInfo } from '../../types/exercise';
import { useAccessibility } from '../../context/AccessibilityContext';

const SAMPLE_RATIONALE: ScientificRationaleInfo = {
  title: 'זיכרון עבודה מרחבי',
  category: 'memory',
  what_we_train:
    'אנו מאמנים את קליפת המוח הקדם-מצחית לשמור ולעבד מידע ויזואלי לטווח קצר תוך כדי שינוי ומניפולציה.',
  daily_benefit:
    'תרגול זה מסייע לנו בחיי היומיום לזכור פרטים לטווח קצר, כמו היכן הנחנו את המפתחות, לזכור הוראות הכוונה בזמן נהיגה, או לעקוב אחר מיקומם של נכדים בפארק.',
  benefitDescription:
    'תרגול זה מאמן את קליפת המוח הקדם-מצחית לשמור ולעבד מידע ויזואלי לטווח קצר תוך כדי שינוי ומניפולציה.',
  realWorldImpact:
    'מסייע בחיי היומיום לזכור היכן הנחנו את המפתחות, לזכור הוראות הכוונה, או לעקוב אחר הנכדים.',
};

export const ExerciseLayout: React.FC = () => {
  const { highContrast } = useAccessibility();

  // Exercise Navigation & Session State
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [totalSteps] = useState<number>(5);
  const [roundCounter, setRoundCounter] = useState<number>(0);
  const [hasCompletedFeedback, setHasCompletedFeedback] = useState<boolean>(false);

  // Modals state
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  const [isRationaleOpen, setIsRationaleOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Stats for DDA engine logging
  const [lastMetrics, setLastMetrics] = useState<{
    accuracy: boolean;
    responseTimeMs: number;
  } | null>(null);

  const handleFeedbackGiven = (correct: boolean, responseTimeMs: number) => {
    setLastMetrics({ accuracy: correct, responseTimeMs });
    // Reveal Next button in bottom bar
    setHasCompletedFeedback(true);
  };

  const handleNextExercise = () => {
    setHasCompletedFeedback(false);
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setCurrentStep(1); // loop for interactive testing
    }
    setRoundCounter((prev) => prev + 1);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-150 ${
        highContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. TOP BAR (Sticky) */}
      <ExerciseHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        title="Visual Working Memory"
        onPause={() => setIsPaused(true)}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
      />

      {/* 2. MAIN INTERACTION AREA (60-70% of screen) */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-8 max-w-4xl w-full mx-auto"
        role="main"
      >
        {/* Instruction Header Banner (High readability, bold) */}
        <div
          className={`w-full max-w-2xl text-center py-4 px-6 rounded-3xl mb-4 border-2 transition-all ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : 'bg-white text-blue-950 border-blue-200 shadow-sm'
          }`}
        >
          <span className="text-xs sm:text-sm uppercase font-extrabold tracking-widest text-current/70 block mb-1">
            EXERCISE {currentStep} OF {totalSteps} • WORKING MEMORY
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Where is the puppy hiding?
          </h1>
        </div>

        {/* The Interactive Game Area */}
        <InteractiveDemoArea
          key={roundCounter}
          resetTrigger={roundCounter}
          onFeedbackGiven={handleFeedbackGiven}
        />

        {/* Real-time DDA Debug / Transparency Indicator for User Assurance */}
        {lastMetrics && (
          <div
            className={`mt-4 text-sm font-mono px-4 py-2 rounded-xl border ${
              highContrast
                ? 'bg-gray-900 text-yellow-400 border-yellow-400/40'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            Adaptive Calibrator: Response time {(lastMetrics.responseTimeMs / 1000).toFixed(2)}s •
            Difficulty Level dynamically adjusted
          </div>
        )}
      </main>

      {/* 3. BOTTOM BAR (Sticky) */}
      <ExerciseFooter
        showNext={hasCompletedFeedback}
        onNext={handleNextExercise}
        onOpenRationale={() => setIsRationaleOpen(true)}
        nextButtonLabel={
          currentStep === totalSteps ? 'Complete Session 🎉' : 'Next Exercise'
        }
      />

      {/* MODALS */}
      <AccessibilityModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />

      <ScientificRationaleModal
        isOpen={isRationaleOpen}
        onClose={() => setIsRationaleOpen(false)}
        rationale={SAMPLE_RATIONALE}
      />

      <PauseModal
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onExit={() => {
          setIsPaused(false);
          alert('Session saved. Ready to return whenever you like!');
        }}
      />
    </div>
  );
};
