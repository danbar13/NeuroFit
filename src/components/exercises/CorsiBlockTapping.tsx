import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { CORSI_LEVELS, type CorsiLevelConfig } from '../../data/cognitiveLevelsMatrix';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

interface CorsiBlockTappingProps {
  levelNumber?: number; // 1 - 10
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

export const CorsiBlockTapping: React.FC<CorsiBlockTappingProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, reduceAnimations, soundEnabled, language } = useAccessibility();

  // Find level configuration (clamped 1-10)
  const config: CorsiLevelConfig =
    CORSI_LEVELS.find((l) => l.level === Math.min(10, Math.max(1, levelNumber))) ||
    CORSI_LEVELS[0];

  const totalTiles = config.gridSize * config.gridSize; // 9 or 16

  // Game states: 'idle' | 'demonstrating' | 'input' | 'completed'
  const [isReady, setIsReady] = useState<boolean>(false);
  const [gameState, setGameState] = useState<'idle' | 'demonstrating' | 'input' | 'completed'>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [activeFlashTile, setActiveFlashTile] = useState<number | null>(null);
  const [userTaps, setUserTaps] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const startTimeRef = useRef<number>(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear timeouts helper
  const clearAllTimers = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  // Start round
  const startNewRound = () => {
    clearAllTimers();
    setUserTaps([]);
    setFeedback(null);
    setActiveFlashTile(null);

    // Generate random distinct sequence of tiles
    const newSeq: number[] = [];
    while (newSeq.length < config.sequenceLength) {
      const candidate = Math.floor(Math.random() * totalTiles);
      // Avoid immediate repetition
      if (newSeq.length === 0 || newSeq[newSeq.length - 1] !== candidate) {
        newSeq.push(candidate);
      }
    }
    setSequence(newSeq);
    setGameState('demonstrating');

    // Playback sequence
    const flashDur = reduceAnimations ? 400 : config.flashDurationMs;
    const interval = reduceAnimations ? 250 : config.intervalMs;
    let accumulatedTime = 600;

    newSeq.forEach((tileIndex) => {
      // Flash on
      const tOn = setTimeout(() => {
        setActiveFlashTile(tileIndex);
        audioManager.playTick(soundEnabled);
      }, accumulatedTime);
      timeoutsRef.current.push(tOn);

      accumulatedTime += flashDur;

      // Flash off
      const tOff = setTimeout(() => {
        setActiveFlashTile(null);
      }, accumulatedTime);
      timeoutsRef.current.push(tOff);

      accumulatedTime += interval;
    });

    // Finished demonstrating -> Switch to user input
    const tEnd = setTimeout(() => {
      setGameState('input');
      startTimeRef.current = Date.now();
    }, accumulatedTime);
    timeoutsRef.current.push(tEnd);
  };

  useEffect(() => {
    setIsReady(false);
    clearAllTimers();
    return () => clearAllTimers();
  }, [levelNumber]);

  const handleStartExercise = () => {
    setIsReady(true);
    startNewRound();
  };

  // Handle tile tap during user input
  const handleTileClick = (tileIndex: number) => {
    if (gameState !== 'input') return;

    audioManager.playClick(soundEnabled);
    const updatedTaps = [...userTaps, tileIndex];
    setUserTaps(updatedTaps);

    // Check if user completed required taps
    if (updatedTaps.length === sequence.length) {
      const responseTime = Date.now() - startTimeRef.current;
      setGameState('completed');

      // Check if backward sequence matches
      // Target sequence is REVERSED: sequence.slice().reverse()
      const targetSequence = [...sequence].reverse();
      const isCorrect = updatedTaps.every((val, idx) => val === targetSequence[idx]);

      if (isCorrect) {
        audioManager.playSuccess(soundEnabled);
        setFeedback({
          isCorrect: true,
          message:
            language === 'he'
              ? `מצוין! שחזרתם את הרצף המלא מהסוף להתחלה (${sequence.length} צעדים)!`
              : `Excellent! You recalled the full sequence backwards (${sequence.length} steps)!`,
        });
      } else {
        audioManager.playGentleChime(soundEnabled);
        setFeedback({
          isCorrect: false,
          message:
            language === 'he'
              ? 'הרצף לא היה מדויק הפעם. אל דאגה, המוח מתאמץ ומשתפר בכל ניסיון!'
              : 'Not quite in exact reverse order this time. Every attempt builds neuroplasticity!',
        });
      }

      onFeedbackGiven(isCorrect, responseTime);
    }
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        title={language === 'he' ? 'מבחן קורסי - זיכרון עבודה' : 'Corsi Test - Working Memory'}
        categoryName={language === 'he' ? 'זיכרון עבודה' : 'Working Memory'}
        levelNumber={config.level}
        instructions={
          language === 'he'
            ? `כמה משבצות יידלקו בזו אחר זו (${config.sequenceLength} משבצות). המשימה שלכם: לזכור את הרצף ולהקיש עליו בסדר הפוך - מהסוף להתחלה!`
            : `Tiles will illuminate in sequence (${config.sequenceLength} tiles). Your mission: remember the sequence and tap it backwards in reverse order!`
        }
        scientificTip={
          language === 'he'
            ? 'שחזור רצף לאחור מאמן את האזור הקדם-מצחי לעבד מידע באופן פעיל ולא רק לזהות אותו פסיבית.'
            : 'Reversing sequences trains the prefrontal cortex to actively manipulate mental representations.'
        }
        onStart={handleStartExercise}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-2">
      {/* Instructions header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-2 flex items-center justify-center gap-2">
          <span>{language === 'he' ? 'מבחן קורסי - זיכרון עבודה מרחבי' : 'Corsi Test - Spatial Working Memory'}</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
            }`}
          >
            {language === 'he' ? `רמה ${config.level}` : `Level ${config.level}`}
          </span>
        </h2>
        <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          {gameState === 'demonstrating'
            ? language === 'he'
              ? 'צפו ברצף המשבצות המוארות בעיון...'
              : 'Watch the illuminated sequence closely...'
            : language === 'he'
            ? `כעת לחצו על המשבצות בסדר הפוך! (מהסוף להתחלה - ${config.sequenceLength} משבצות)`
            : `Now tap the tiles in REVERSE order! (Last to first - ${config.sequenceLength} tiles)`}
        </p>
      </div>

      {/* Grid */}
      <div
        className={`grid gap-3 sm:gap-4 p-5 sm:p-6 rounded-3xl shadow-xl transition-all ${
          config.gridSize === 3 ? 'grid-cols-3 w-72 sm:w-88' : 'grid-cols-4 w-80 sm:w-96'
        } ${
          highContrast
            ? 'bg-black border-4 border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 border-2 border-slate-800'
            : 'bg-white border-2 border-slate-200'
        }`}
      >
        {Array.from({ length: totalTiles }).map((_, idx) => {
          const isFlashing = activeFlashTile === idx;
          const userTapOrder = userTaps.indexOf(idx);
          const hasBeenTapped = userTapOrder !== -1;

          let tileBg = '';
          if (isFlashing) {
            tileBg = highContrast
              ? 'bg-yellow-400 scale-105 shadow-2xl ring-4 ring-white'
              : 'bg-amber-400 scale-105 shadow-2xl ring-4 ring-amber-300';
          } else if (hasBeenTapped) {
            tileBg = highContrast
              ? 'bg-blue-600 text-white'
              : 'bg-primary-600 text-white dark:bg-primary-500';
          } else {
            tileBg = highContrast
              ? 'bg-zinc-900 border-2 border-zinc-700 hover:border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700';
          }

          return (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              disabled={gameState !== 'input'}
              className={`aspect-square rounded-2xl flex items-center justify-center font-black text-2xl transition-all duration-150 transform active:scale-95 ${tileBg} ${
                gameState === 'input' ? 'cursor-pointer hover:scale-102' : 'cursor-default'
              }`}
            >
              {hasBeenTapped ? userTapOrder + 1 : ''}
            </button>
          );
        })}
      </div>

      {/* Step Progress / Indicator */}
      <div className="mt-6 flex items-center gap-3">
        <span className="text-base font-bold text-slate-500 dark:text-slate-400">
          {language === 'he' ? 'התקדמות ההקשה:' : 'Input Progress:'}
        </span>
        <div className="flex gap-2">
          {Array.from({ length: config.sequenceLength }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                i < userTaps.length
                  ? highContrast
                    ? 'bg-yellow-400'
                    : 'bg-primary-600'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Result Feedback Banner */}
      {feedback && (
        <div
          className={`mt-6 w-full max-w-lg p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${
            feedback.isCorrect
              ? highContrast
                ? 'bg-yellow-950/60 border-yellow-400 text-yellow-300'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200'
              : highContrast
              ? 'bg-zinc-900 border-zinc-500 text-white'
              : 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 text-blue-900 dark:text-blue-200'
          }`}
        >
          {feedback.isCorrect ? (
            <CheckCircle2 className="w-8 h-8 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="w-8 h-8 shrink-0 text-blue-400" />
          )}
          <div className="flex-1">
            <p className="font-bold text-lg">{feedback.message}</p>
          </div>
          <button
            onClick={startNewRound}
            className={`p-2 rounded-xl transition-all ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-slate-200 dark:bg-slate-800'
            }`}
            title={language === 'he' ? 'נסו שוב' : 'Try Again'}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
