import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, Compass } from 'lucide-react';

interface VanishingPathMemoryProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

export const VanishingPathMemory: React.FC<VanishingPathMemoryProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const gridSize = 4;
  const pathLength = Math.min(8, 3 + Math.floor(clampedLevel / 2)); // 3 to 8 steps

  const [isReady, setIsReady] = useState(false);
  const [phase, setPhase] = useState<'showing' | 'recall' | 'result'>('showing');
  const [pathSteps, setPathSteps] = useState<number[]>([]);
  const [userSteps, setUserSteps] = useState<number[]>([]);
  const [activeShowIdx, setActiveShowIdx] = useState<number>(-1);
  const [startTime, setStartTime] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const generateValidPath = (): number[] => {
    const path: number[] = [];
    let current = Math.floor(Math.random() * (gridSize * gridSize));
    path.push(current);

    while (path.length < pathLength) {
      const r = Math.floor(current / gridSize);
      const c = current % gridSize;
      const neighbors: number[] = [];

      if (r > 0) neighbors.push((r - 1) * gridSize + c);
      if (r < gridSize - 1) neighbors.push((r + 1) * gridSize + c);
      if (c > 0) neighbors.push(r * gridSize + (c - 1));
      if (c < gridSize - 1) neighbors.push(r * gridSize + (c + 1));

      const unvisited = neighbors.filter(n => !path.includes(n));
      if (unvisited.length === 0) {
        // Retry path generation if stuck
        return generateValidPath();
      }
      current = unvisited[Math.floor(Math.random() * unvisited.length)];
      path.push(current);
    }
    return path;
  };

  const initRound = () => {
    const newPath = generateValidPath();
    setPathSteps(newPath);
    setUserSteps([]);
    setIsCorrect(null);
    setPhase('showing');

    // Animate path sequentially
    let step = 0;
    const interval = setInterval(() => {
      if (step < newPath.length) {
        setActiveShowIdx(newPath[step]);
        if (soundEnabled) audioManager.play('click');
        step++;
      } else {
        clearInterval(interval);
        setActiveShowIdx(-1);
        setPhase('recall');
        setStartTime(Date.now());
      }
    }, 700);
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel]);

  const handleCellClick = (idx: number) => {
    if (phase !== 'recall') return;
    if (userSteps.includes(idx)) return;

    if (soundEnabled) audioManager.play('click');
    const nextUser = [...userSteps, idx];
    setUserSteps(nextUser);

    const stepIdx = nextUser.length - 1;
    // Immediate error check or completion
    if (nextUser[stepIdx] !== pathSteps[stepIdx]) {
      // Made a mistake
      const rt = Date.now() - startTime;
      setIsCorrect(false);
      setPhase('result');
      if (soundEnabled) audioManager.play('soft_error');
      onFeedbackGiven(false, rt);
      return;
    }

    if (nextUser.length === pathSteps.length) {
      // Completed successfully
      const rt = Date.now() - startTime;
      setIsCorrect(true);
      setPhase('result');
      if (soundEnabled) audioManager.play('success');
      onFeedbackGiven(true, rt);
    }
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'זכירת מסלול מבוך' : 'Vanishing Path Memory'}
        scientificProtocol="Spatial Navigation & Route Learning Paradigm"
        instructions={
          language === 'he'
            ? `עקבו בעיניים אחר המסלול הזוהר המוצג שלב אחר שלב ברשת. לאחר שהמסלול ייעלם, לחצו על המשבצות לפי סדר הופעתן מתחילת המסלול ועד סופו.`
            : `Follow the glowing pathway displayed step-by-step. Once hidden, tap the cells in sequence along that route from start to finish.`
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

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Compass className="text-teal-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'זכירת מסלול מבוך' : 'Vanishing Path Memory'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel} | ${pathLength} צעדים` : `Level ${clampedLevel} | ${pathLength} steps`}
        </span>
      </div>

      {phase === 'showing' && (
        <div className="text-center py-2 px-4 mb-4 bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-bold rounded-lg animate-pulse">
          {language === 'he' ? '👀 עקבו אחר המסלול הנפרש עכשיו...' : '👀 Follow the unfolding path...'}
        </div>
      )}

      {phase === 'recall' && (
        <div className="text-center py-2 px-4 mb-4 bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-bold rounded-lg">
          {language === 'he'
            ? `שחזרו את המסלול מההתחלה (${userSteps.length}/${pathSteps.length})`
            : `Trace the path from the start (${userSteps.length}/${pathSteps.length})`}
        </div>
      )}

      {phase === 'result' && (
        <div className={`p-4 mb-4 rounded-xl flex items-center justify-between ${
          isCorrect ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-600 dark:text-emerald-300' :
          'bg-amber-500/15 border border-amber-500 text-amber-600 dark:text-amber-300'
        }`}>
          <div className="flex items-center gap-2 font-bold text-lg">
            {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <span>
              {isCorrect
                ? (language === 'he' ? 'ניווט ללא דופי! מסלול מדויק!' : 'Flawless route recall!')
                : (language === 'he' ? 'הייתה סטייה מהמסלול המקורי' : 'Deviated from the original route')}
            </span>
          </div>
          <button
            onClick={initRound}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'he' ? 'נסה שוב' : 'Try Again'}
          </button>
        </div>
      )}

      {/* Grid */}
      <div
        className="grid grid-cols-4 gap-3 mx-auto mb-4"
        style={{ maxWidth: '340px' }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
          const isCurrentlyShowing = activeShowIdx === idx;
          const userStepIndex = userSteps.indexOf(idx);
          const pathStepIndex = pathSteps.indexOf(idx);

          let cellClass = 'bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600';

          if (phase === 'showing' && isCurrentlyShowing) {
            cellClass = 'bg-teal-500 border-teal-400 ring-4 ring-teal-300 text-white scale-105 shadow-lg';
          } else if (phase === 'recall' && userStepIndex !== -1) {
            cellClass = 'bg-teal-600 text-white border-teal-500 font-bold';
          } else if (phase === 'result') {
            if (pathStepIndex !== -1) {
              cellClass = 'bg-teal-500 text-white border-teal-400';
            }
          }

return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={phase !== 'recall'}
              className={`aspect-square rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-150 min-h-[64px] ${cellClass}`}
            >
              {phase === 'showing' && isCurrentlyShowing && '●'}
              {phase === 'recall' && userStepIndex !== -1 && (userStepIndex + 1)}
              {phase === 'result' && pathStepIndex !== -1 && (pathStepIndex + 1)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
