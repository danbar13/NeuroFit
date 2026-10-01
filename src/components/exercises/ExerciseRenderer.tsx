import React from 'react';
import type { ExerciseCategory } from '../../types/exercise';

// --- 1. Working Memory (10 games) ---
import { CorsiBlockTapping } from './CorsiBlockTapping';
import { ReverseDigitSpan } from './ReverseDigitSpan';
import { DualNBack } from './DualNBack';
import { SpatialMatrixRecall } from './SpatialMatrixRecall';
import { ObjectLocationRecall } from './ObjectLocationRecall';
import { PatternReconstruction } from './PatternReconstruction';
import { LetterNumberSequencing } from './LetterNumberSequencing';
import { ChainArithmetic } from './ChainArithmetic';
import { VanishingPathMemory } from './VanishingPathMemory';
import { DelayedMatchToSample } from './DelayedMatchToSample';

// --- 2. Attention (10 games) ---
import { SchulteTable } from './SchulteTable';
import { StroopTask } from './StroopTask';
import { FlankerTask } from './FlankerTask';
import { ConjunctionSearch } from './ConjunctionSearch';
import { GoNoGoTask } from './GoNoGoTask';
import { VisualOddity } from './VisualOddity';
import { DividedAttention } from './DividedAttention';
import { RotatedSilhouette } from './RotatedSilhouette';
import { MissingPatternElement } from './MissingPatternElement';
import { MultipleObjectTracking } from './MultipleObjectTracking';

// --- 3. Processing Speed (10 games) ---
import { SDMTExercise } from './SDMTExercise';
import { TrailMakingTest } from './TrailMakingTest';
import { RuleShiftingFlexibility } from './RuleShiftingFlexibility';
import { RapidCategorySorter } from './RapidCategorySorter';
import { SpeedArithmeticComparison } from './SpeedArithmeticComparison';
import { ChoiceReactionTime } from './ChoiceReactionTime';
import { RapidSymmetryJudgment } from './RapidSymmetryJudgment';
import { RapidNumericalSequence } from './RapidNumericalSequence';
import { InvertedDirectionReaction } from './InvertedDirectionReaction';
import { RapidSymbolPairing } from './RapidSymbolPairing';

// --- 4. Language & Semantic (10 games) ---
import { SemanticIntruder } from './SemanticIntruder';
import { VerbalAnalogies } from './VerbalAnalogies';
import { RemoteAssociatesTask } from './RemoteAssociatesTask';
import { AdvancedAnagrams } from './AdvancedAnagrams';
import { ProverbCompletion } from './ProverbCompletion';
import { ClozeSentenceContext } from './ClozeSentenceContext';
import { AbstractCategoryAssociation } from './AbstractCategoryAssociation';
import { WordRootsFamilies } from './WordRootsFamilies';
import { NuancedSynonyms } from './NuancedSynonyms';
import { DefinitionsEtymology } from './DefinitionsEtymology';

export interface ExerciseRendererProps {
  category: ExerciseCategory;
  levelNumber: number; // 1 to 10
  gameId?: string; // Specific game from catalog
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

/**
 * Full Dynamic Exercise Renderer dispatching to 40 distinct scientific neuropsychological paradigms
 */
export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({
  category,
  levelNumber,
  gameId,
  onFeedbackGiven,
}) => {
  // 1. Direct dispatch if gameId is explicitly supplied
  if (gameId) {
    switch (gameId) {
      // Memory
      case 'memory_corsi':
        return <CorsiBlockTapping levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'memory_reverse_digits':
        return <ReverseDigitSpan levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'memory_dual_nback':
        return <DualNBack levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'memory_spatial_matrix':
        return <SpatialMatrixRecall levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'memory_object_locations':
        return <ObjectLocationRecall levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'memory_pattern_reconstruct':
        return <PatternReconstruction levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'memory_letter_number':
        return <LetterNumberSequencing levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'memory_chain_math':
        return <ChainArithmetic levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'memory_disappearing_path':
        return <VanishingPathMemory levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'memory_delayed_match':
        return <DelayedMatchToSample levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;

      // Attention
      case 'attention_schulte':
        return <SchulteTable levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'attention_stroop':
        return <StroopTask levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'attention_flanker':
        return <FlankerTask levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'attention_conjunction_search':
        return <ConjunctionSearch levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'attention_go_nogo':
        return <GoNoGoTask levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'attention_visuospatial_odd':
        return <VisualOddity levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'attention_divided':
        return <DividedAttention levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'attention_shadow_track':
        return <RotatedSilhouette levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'attention_missing_element':
        return <MissingPatternElement levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'attention_motion_track':
        return <MultipleObjectTracking levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;

      // Processing Speed
      case 'speed_sdmt':
        return <SDMTExercise levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'speed_trail_b':
        return <TrailMakingTest levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'speed_rule_shift':
        return <RuleShiftingFlexibility levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'speed_rapid_categorize':
        return <RapidCategorySorter levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'speed_math_comparison':
        return <SpeedArithmeticComparison levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'speed_reaction_time':
        return <ChoiceReactionTime levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'speed_visual_symmetry':
        return <RapidSymmetryJudgment levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'speed_number_sequence':
        return <RapidNumericalSequence levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'speed_directional_arrows':
        return <InvertedDirectionReaction levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'speed_shape_pairing':
        return <RapidSymbolPairing levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;

      // Language
      case 'lang_semantic_intruder':
        return <SemanticIntruder levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'lang_verbal_analogies':
        return <VerbalAnalogies levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'lang_remote_associates':
        return <RemoteAssociatesTask levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'lang_advanced_anagrams':
        return <AdvancedAnagrams levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'lang_proverb_completion':
        return <ProverbCompletion levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'lang_context_clues':
        return <ClozeSentenceContext levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'lang_category_association':
        return <AbstractCategoryAssociation levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'lang_word_roots':
        return <WordRootsFamilies levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'lang_nuanced_synonyms':
        return <NuancedSynonyms levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;
      case 'lang_definitions_etymology':
        return <DefinitionsEtymology levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />;

      default:
        break;
    }
  }

  // 2. Rotational category mapping (maps level 1-10 to the 10 distinct games per category for daily workouts!)
  const idx = ((levelNumber - 1) % 10 + 10) % 10;

  switch (category) {
    case 'memory': {
      const memoryComponents = [
        <CorsiBlockTapping key="corsi" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <ReverseDigitSpan key="rev_dig" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <DualNBack key="nback" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <SpatialMatrixRecall key="matrix" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <ObjectLocationRecall key="obj_loc" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <PatternReconstruction key="pattern" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <LetterNumberSequencing key="let_num" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <ChainArithmetic key="chain" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <VanishingPathMemory key="path" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <DelayedMatchToSample key="dmts" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
      ];
      return memoryComponents[idx];
    }

    case 'attention': {
      const attentionComponents = [
        <SchulteTable key="schulte" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <StroopTask key="stroop" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <FlankerTask key="flanker" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <ConjunctionSearch key="conj" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <GoNoGoTask key="gonogo" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <VisualOddity key="oddity" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <DividedAttention key="divided" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <RotatedSilhouette key="silhouette" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <MissingPatternElement key="missing" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <MultipleObjectTracking key="mot" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
      ];
      return attentionComponents[idx];
    }

    case 'speed': {
      const speedComponents = [
        <SDMTExercise key="sdmt" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <TrailMakingTest key="tmt" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <RuleShiftingFlexibility key="wcst" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <RapidCategorySorter key="cat_sort" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <SpeedArithmeticComparison key="arith_comp" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <ChoiceReactionTime key="hick" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <RapidSymmetryJudgment key="symm" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <RapidNumericalSequence key="num_seq" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <InvertedDirectionReaction key="simon" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <RapidSymbolPairing key="pair" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
      ];
      return speedComponents[idx];
    }

    case 'language': {
      const languageComponents = [
        <SemanticIntruder key="intruder" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <VerbalAnalogies key="analogies" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <RemoteAssociatesTask key="rat" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <AdvancedAnagrams key="anagram" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <ProverbCompletion key="proverb" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <ClozeSentenceContext key="cloze" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <AbstractCategoryAssociation key="category" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <WordRootsFamilies key="roots" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <NuancedSynonyms key="synonyms" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
        <DefinitionsEtymology key="definitions" levelNumber={levelNumber} onFeedbackGiven={onFeedbackGiven} />,
      ];
      return languageComponents[idx];
    }

    default:
      return null;
  }
};
