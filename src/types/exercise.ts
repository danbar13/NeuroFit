export type ExerciseCategory = 'memory' | 'attention' | 'speed' | 'language';

export interface ExerciseStepInfo {
  currentStep: number;
  totalSteps: number;
}

export interface ScientificRationaleInfo {
  title: string;
  category: ExerciseCategory;
  what_we_train: string; // From baseline_test_content_matrix.md
  daily_benefit: string; // From baseline_test_content_matrix.md
  benefitDescription?: string;
  realWorldImpact?: string;
  neuroplasticityNote?: string;
}

export interface FeedbackState {
  isCorrect: boolean;
  message: string;
  correctAnswerIndex?: number;
  highlightIndexes?: number[];
}
