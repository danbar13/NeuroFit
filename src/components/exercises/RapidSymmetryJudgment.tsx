import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, FlipHorizontal } from 'lucide-react';

interface RapidSymmetryJudgmentProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

export const RapidSymmetryJudgment: React.FC<RapidSymmetryJudgmentProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const totalTrials = 8 + clampedLevel;
  const timeoutMs = Math.max(1400, 2600 - clampedLevel * 100);
  const gridSize = 6; // 6x6 grid

  const [isReady, setIsReady] = useState(false);
  const [trialIdx, setTrialIdx] = useState<number>(0);
  const [gridMatrix, setGridMatrix] = useState<boolean[][]>([]);
  const [isSymmetricTarget, setIsSymmetricTarget] = useState<boolean>(true);
  const [correctHits, setCorrectHits] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(100);

  const startTimeRef = useRef<number>(0);
  const rtsRef = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateGrid = () => {
    const isSym = Math.random() < 0.5;
    setIsSymmetricTarget(isSym);

    // Create 6x6 matrix
    const matrix: boolean[][] = [];
    for (let r = 0; r < gridSize; r++) {
      matrix.push(new Array(gridSize).fill(false));
    }

    // Populate left half (columns 0, 1, 2)
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < 3; c++) {
        matrix[r][c] = Math.random() < 0.45;
        // Mirror to right half (columns 3, 4, 5)
        matrix[r][gridSize - 1 - c] = matrix[r][c];
      }
    }

    if (!isSym) {
      // Break symmetry by flipping 1 or 2 pixels on the right
      const r = Math.floor(Math.random() * gridSize);
      const c = 3 + Math.floor(Math.random() * 3);
      matrix[r][c] = !matrix[r][c];
    }

    setGridMatrix(matrix);
  };

  const nextTrial = (nextIdx: number) => {
    if (nextIdx >= totalTrials) {
      finishTask();
      return;
    }

    generateGrid();
    setTrialIdx(nextIdx);
    setProgressPercent(100);
    startTimeRef.current = Date.now();

    const startT = Date.now();
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    animIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startT;
      const left = Math.max(0, 100 - (elapsed / timeoutMs) * 100);
      setProgressPercent(left);
      if (left <= 0 && animIntervalRef.current) {
        clearInterval(animIntervalRef.current);
      }
    }, 50);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (soundEnabled) audioManager.play('soft_error');
      nextTrial(nextIdx + 1);
    }, timeoutMs);
  };

  const initRound = () => {
    setTrialIdx(0);
    setCorrectHits(0);
    setIsFinished(false);
    rtsRef.current = [];
    nextTrial(0);
  };

  const handleDecision = (userSaysSymmetric: boolean) => {
    if (isFinished) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    const rt = Date.now() - startTimeRef.current;
    const isCorrect = userSaysSymmetric === isSymmetricTarget;

    if (soundEnabled) audioManager.play(isCorrect ? 'click' : 'soft_error');

    if (isCorrect) {
      setCorrectHits(c => c + 1);
      rtsRef.current.push(rt);
    }

    nextTrial(trialIdx + 1);
  };

  const finishTask = () => {
    setIsFinished(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    const avgRt = rtsRef.current.length > 0
      ? rtsRef.current.reduce((a, b) => a + b, 0) / rtsRef.current.length
      : timeoutMs;

    const pass = correctHits >= Math.floor(totalTrials * 0.7);
    onFeedbackGiven(pass, Math.round(avgRt));
    if (soundEnabled) audioManager.play(pass ? 'success' : 'soft_error');
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    };
  }, [isReady, clampedLevel]);

if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'שיפוט סימטריה בזק' : 'Rapid Symmetry Judgment'}
        scientificProtocol="Visual Symmetry Detection Speed"
        instructions={
          language === 'he'
            ? `הביטו בדגם הנקודות בלוח. האם הדגם סימטרי לחלוטין (משקף את עצמו ימין-שמאל סביב ציר המרכז), או א-סימטרי? הכריעו במהירות לפני שהזמן אוזל!`
            : `Examine the grid pattern. Is the pattern perfectly bilateral symmetric (mirrored left-to-right), or asymmetrical? Decide swiftly before time runs out!`
        }
        levelNumber={clampedLevel}
      />
    );
  }

  return (
    <div className={`p-6 rounded-2xl max-w-xl mx-auto ${
      highContrast ? 'border-2 border-yellow-400 bg-black text-yellow-300' :
      theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white shadow-xl text-slate-800'
    }`}>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <FlipHorizontal className="text-teal-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'שיפוט סימטריה בזק' : 'Symmetry Judgment'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded-full">
          {language === 'he' ? `דגם ${trialIdx + 1}/${totalTrials}` : `Pattern ${trialIdx + 1}/${totalTrials}`}
        </span>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Timer bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-500 h-full transition-all duration-75 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Symmetry Matrix with dotted center line */}
          <div className="relative p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl w-64 h-64 mx-auto flex flex-col justify-between shadow-inner">
            {/* Center Axis Divider */}
            <div className="absolute top-2 bottom-2 left-1/2 w-0.5 border-l-2 border-dashed border-teal-500/60" />

            {gridMatrix.map((row, r) => (
              <div key={r} className="flex justify-between">
                {row.map((cell, c) => (
                  <div
                    key={c}
                    className={`w-7 h-7 rounded-lg transition-all ${
                      cell ? 'bg-teal-600 shadow-sm' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleDecision(true)}
              className="py-5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-xl rounded-2xl shadow-lg transition-all min-h-[64px]"
            >
              {language === 'he' ? '✨ סימטרי' : '✨ Symmetric'}
            </button>
            <button
              onClick={() => handleDecision(false)}
              className="py-5 bg-slate-600 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-xl rounded-2xl shadow-lg transition-all min-h-[64px]"
            >
              {language === 'he' ? '❌ לא סימטרי' : '❌ Asymmetric'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 py-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-bold">
            {language === 'he' ? 'שיפוט הסימטריה הושלם!' : 'Symmetry Judgment Complete!'}
          </h3>
          <p className="text-slate-500 font-medium">
            {language === 'he'
              ? `זיהיתם נכון ${correctHits} מתוך ${totalTrials} דגמים.`
              : `Correctly judged ${correctHits} of ${totalTrials} patterns.`}
          </p>
          <button
            onClick={initRound}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow"
          >
            {language === 'he' ? 'בצעו שוב' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
};
