import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, Scan } from 'lucide-react';

interface VisualOddityProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

export const VisualOddity: React.FC<VisualOddityProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  // 9 items for low levels, up to 16 for higher levels
  const count = clampedLevel <= 4 ? 9 : 16;
  const gridSize = Math.sqrt(count);

  const [isReady, setIsReady] = useState(false);
  const [oddIndex, setOddIndex] = useState<number>(0);
  const [baseRotation, setBaseRotation] = useState<number>(0);
  const [oddRotationOffset, setOddRotationOffset] = useState<number>(90);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    const odd = Math.floor(Math.random() * count);
    const baseRot = Math.floor(Math.random() * 4) * 90;
    // For higher levels, odd offset is smaller (e.g. 45 or 30 deg), for lower levels it is 90 or 180 deg
    const offset = clampedLevel >= 7 ? 45 : clampedLevel >= 4 ? 90 : 180;

    setOddIndex(odd);
    setBaseRotation(baseRot);
    setOddRotationOffset(offset);
    setSelectedIdx(null);
    setIsFinished(false);
    setIsCorrect(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel]);

  const handleClick = (idx: number) => {
    if (isFinished) return;
    const rt = Date.now() - startTime;
    setSelectedIdx(idx);
    const correct = idx === oddIndex;
    setIsCorrect(correct);
    setIsFinished(true);

    if (soundEnabled) {
      audioManager.play(correct ? 'success' : 'soft_error');
    }
    onFeedbackGiven(correct, rt);
  };

  const renderGlyph = (isOdd: boolean) => {
    const rot = isOdd ? (baseRotation + oddRotationOffset) % 360 : baseRotation;
    return (
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        style={{ transform: `rotate(${rot}deg)` }}
        className="transition-transform duration-200"
      >
        {/* Symmetric base cross with an off-center notch */}
        <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3" />
        <line x1="22" y1="4" x2="22" y2="40" stroke="currentColor" strokeWidth="3" />
        <line x1="4" y1="22" x2="40" y2="22" stroke="currentColor" strokeWidth="3" />
        {/* Asymmetric indicator dot */}
        <circle cx="31" cy="13" r="4" fill="#3b82f6" />
      </svg>
    );
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'יוצא דופן חזותי זעיר' : 'Subtle Visual Odd-One-Out'}
        scientificProtocol="Visual Discrimination Matrix"
        instructions={
          language === 'he'
            ? `סרקו את לוח הצורות. כל הצורות פונות לאותו כיוון בדיוק, מלבד צורה אחת בודדת שהזווית או הפרט שלה שונים. מצאו אותה ולחצו עליה במהירות!`
            : `Scan the array of shapes. All are oriented identically except for one single item with a subtle rotation or detail discrepancy. Tap the odd one out!`
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
          <Scan className="text-amber-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'יוצא דופן חזותי זעיר' : 'Visual Odd-One-Out'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel} | ${count} פריטים` : `Level ${clampedLevel} | ${count} items`}
        </span>
      </div>

      {isFinished && (
        <div className={`p-4 mb-4 rounded-xl flex items-center justify-between ${
          isCorrect ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-600 dark:text-emerald-300' :
          'bg-amber-500/15 border border-amber-500 text-amber-600 dark:text-amber-300'
        }`}>
          <div className="flex items-center gap-2 font-bold text-lg">
            {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <span>
              {isCorrect
                ? (language === 'he' ? 'זיהוי מעולה של הפרט החריג!' : 'Excellent anomaly discrimination!')
                : (language === 'he' ? 'היוצא דופן סומן במסגרת ירוקה' : 'The odd item is outlined in green')}
            </span>
          </div>
          <button
            onClick={initRound}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'he' ? 'הבא' : 'Next'}
          </button>
        </div>
      )}

      {/* Grid of Glyphs */}
      <div
        className="grid gap-3 mx-auto p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          maxWidth: '380px',
        }}
      >
        {Array.from({ length: count }).map((_, idx) => {
          const isOdd = idx === oddIndex;
          const isSelected = selectedIdx === idx;

          let ring = '';
          if (isFinished) {
            if (isOdd) ring = 'ring-4 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
            else if (isSelected && !isOdd) ring = 'ring-4 ring-red-500 bg-red-50 dark:bg-red-950/40';
          }

return (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              className={`aspect-square rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-amber-400 hover:scale-105 active:scale-95 transition-all shadow-sm ${ring}`}
            >
              {renderGlyph(isOdd)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
