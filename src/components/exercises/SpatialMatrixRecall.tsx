import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, LayoutGrid } from 'lucide-react';

interface SpatialMatrixRecallProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

export const SpatialMatrixRecall: React.FC<SpatialMatrixRecallProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  // Grid size: 3x3 for levels 1-3, 4x4 for levels 4-7, 5x5 for levels 8-10
  const gridSize = clampedLevel <= 3 ? 3 : clampedLevel <= 7 ? 4 : 5;
  const totalCells = gridSize * gridSize;
  const targetCount = 3 + Math.floor(clampedLevel * 0.7); // 3 to 10 targets

  const [isReady, setIsReady] = useState(false);
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'result'>('memorize');
  const [targetIndices, setTargetIndices] = useState<number[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    const indices: number[] = [];
    while (indices.length < targetCount) {
      const idx = Math.floor(Math.random() * totalCells);
      if (!indices.includes(idx)) indices.push(idx);
    }
    setTargetIndices(indices);
    setSelectedIndices([]);
    setPhase('memorize');
    setIsCorrect(null);

    // Memorize duration: 2.5s to 3.5s depending on difficulty
    const memDuration = Math.max(2000, 3500 - clampedLevel * 100);
    setTimeout(() => {
      setPhase('recall');
      setStartTime(Date.now());
    }, memDuration);
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel]);

  const handleCellClick = (idx: number) => {
    if (phase !== 'recall') return;

    if (soundEnabled) audioManager.play('click');
    let next: number[];
    if (selectedIndices.includes(idx)) {
      next = selectedIndices.filter(i => i !== idx);
    } else {
      next = [...selectedIndices, idx];
    }
    setSelectedIndices(next);
  };

  const handleVerify = () => {
    if (phase !== 'recall') return;
    const rt = Date.now() - startTime;
    const allMatched =
      targetIndices.length === selectedIndices.length &&
      targetIndices.every(t => selectedIndices.includes(t));

    setIsCorrect(allMatched);
    setPhase('result');

    if (soundEnabled) {
      audioManager.play(allMatched ? 'success' : 'soft_error');
    }
    onFeedbackGiven(allMatched, rt);
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'שחזור מטריצה מרחבית' : 'Spatial Matrix Recall'}
        scientificProtocol="Visual Patterns Test (Della Sala et al., 1999)"
        instructions={
          language === 'he'
            ? `זכרו את מיקום המשבצות הכחולות המוצגות לרגע קצר ברשת ${gridSize}x${gridSize}. כשהן ייעלמו, לחצו על המשבצות המתאימות כדי לשחזר את התבנית במדויק.`
            : `Memorize the positions of highlighted tiles in the ${gridSize}x${gridSize} grid. When they disappear, tap the corresponding cells to reconstruct the pattern.`
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
          <LayoutGrid className="text-indigo-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'שחזור מטריצה מרחבית' : 'Spatial Matrix Recall'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel} | ${targetCount} משבצות` : `Level ${clampedLevel} | ${targetCount} tiles`}
        </span>
      </div>

      {phase === 'memorize' && (
        <div className="text-center py-2 px-4 mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold rounded-lg animate-pulse">
          {language === 'he' ? '👀 שננו את המשבצות המוארות עכשיו!' : '👀 Memorize highlighted cells now!'}
        </div>
      )}

      {phase === 'recall' && (
        <div className="text-center py-2 px-4 mb-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-semibold rounded-lg">
          {language === 'he'
            ? `סמנו את ${targetCount} המשבצות שנעלמו (${selectedIndices.length}/${targetCount})`
            : `Select the ${targetCount} target cells (${selectedIndices.length}/${targetCount})`}
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
                ? (language === 'he' ? 'מצוין! שחזור מושלם!' : 'Excellent! Perfect recall!')
                : (language === 'he' ? 'הייתה החמצה קלה, נסו שוב בשלב הבא' : 'Slight miss, keep training!')}
            </span>
          </div>
          <button
            onClick={initRound}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'he' ? 'נסה שוב' : 'Try Again'}
          </button>
        </div>
      )}

      {/* Grid */}
      <div
        className="grid gap-2.5 mx-auto mb-6 transition-all duration-300"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          maxWidth: `${gridSize * 76}px`,
        }}
      >
        {Array.from({ length: totalCells }).map((_, idx) => {
          const isTarget = targetIndices.includes(idx);
          const isSelected = selectedIndices.includes(idx);

          let bgClass = 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600';
          if (phase === 'memorize' && isTarget) {
            bgClass = 'bg-blue-600 shadow-md ring-4 ring-blue-300 dark:ring-blue-800 scale-95';
          } else if (phase === 'recall') {
            bgClass = isSelected
              ? 'bg-blue-600 text-white font-bold shadow ring-2 ring-blue-400'
              : 'bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600';
          } else if (phase === 'result') {
            if (isTarget && isSelected) {
              bgClass = 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400';
            } else if (isTarget && !isSelected) {
              bgClass = 'bg-blue-400/80 border-2 border-dashed border-blue-600';
            } else if (!isTarget && isSelected) {
              bgClass = 'bg-red-500/80 text-white';
            }
          }

return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={phase !== 'recall'}
              aria-label={`Cell ${idx + 1}`}
              className={`aspect-square rounded-xl transition-all duration-150 flex items-center justify-center min-h-[56px] text-lg ${bgClass}`}
            >
              {phase === 'recall' && isSelected && '✓'}
              {phase === 'result' && isTarget && '★'}
            </button>
          );
        })}
      </div>

      {phase === 'recall' && (
        <button
          onClick={handleVerify}
          disabled={selectedIndices.length === 0}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all text-lg min-h-[56px]"
        >
          {language === 'he' ? 'בדיקת שחזור' : 'Verify Reconstruction'}
        </button>
      )}
    </div>
  );
};
