import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, RotateCw } from 'lucide-react';

interface RotatedSilhouetteProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface ShapeSilhouette {
  id: number;
  path: string; // SVG path
}

const SILHOUETTES: ShapeSilhouette[] = [
  {
    id: 1, // Asymmetric Arrow / Chevron with notch
    path: 'M 10 30 L 30 10 L 40 20 L 25 35 L 40 50 L 30 60 Z',
  },
  {
    id: 2, // L-Shape bracket with tooth
    path: 'M 15 15 L 45 15 L 45 25 L 25 25 L 25 55 L 15 55 Z',
  },
  {
    id: 3, // Asymmetric Key / Cross
    path: 'M 20 10 L 30 10 L 30 25 L 45 25 L 45 35 L 30 35 L 30 60 L 20 60 Z',
  },
  {
    id: 4, // Stepped polygon
    path: 'M 15 45 L 25 45 L 25 30 L 35 30 L 35 15 L 45 15 L 45 60 L 15 60 Z',
  },
];

export const RotatedSilhouette: React.FC<RotatedSilhouetteProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const [isReady, setIsReady] = useState(false);
  const [targetShape, setTargetShape] = useState<ShapeSilhouette>(SILHOUETTES[0]);
  const [targetAngle, setTargetAngle] = useState<number>(0);
  const [options, setOptions] = useState<{ id: number; shape: ShapeSilhouette; angle: number; isMirrored: boolean }[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    const picked = SILHOUETTES[Math.floor(Math.random() * SILHOUETTES.length)];
    const tAngle = Math.floor(Math.random() * 8) * 45;

    setTargetShape(picked);
    setTargetAngle(tAngle);

    // Matching correct option (same shape, different rotation)
    const matchAngle = (tAngle + (Math.floor(Math.random() * 3) + 1) * 90) % 360;
    const correctOpt = { id: 1, shape: picked, angle: matchAngle, isMirrored: false };

    // Distractor 1: Mirrored version of same shape
    const dist1 = { id: 2, shape: picked, angle: (tAngle + 180) % 360, isMirrored: true };

    // Distractor 2 & 3: Different shapes
    const others = SILHOUETTES.filter(s => s.id !== picked.id);
    const dist2 = { id: 3, shape: others[0], angle: Math.floor(Math.random() * 4) * 90, isMirrored: false };
    const dist3 = { id: 4, shape: others[1], angle: Math.floor(Math.random() * 4) * 90, isMirrored: false };

    const shuffled = [correctOpt, dist1, dist2, dist3].sort(() => 0.5 - Math.random());
    setOptions(shuffled);
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

  const handleSelect = (idx: number, opt: typeof options[0]) => {
    if (isFinished) return;
    const rt = Date.now() - startTime;
    setSelectedIdx(idx);
    const correct = opt.id === 1; // ID 1 was designated as correct
    setIsCorrect(correct);
    setIsFinished(true);

    if (soundEnabled) {
      audioManager.play(correct ? 'success' : 'soft_error');
    }
    onFeedbackGiven(correct, rt);
  };

  const renderSilhouetteSvg = (shape: ShapeSilhouette, angle: number, mirrored = false, size = 64) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 70 70"
        style={{
          transform: `rotate(${angle}deg) ${mirrored ? 'scaleX(-1)' : ''}`,
        }}
        className="transition-transform duration-200 fill-slate-800 dark:fill-slate-100"
      >
        <path d={shape.path} />
      </svg>
    );
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'התאמת צלליות בזווית' : 'Rotated Silhouette Matching'}
        scientificProtocol="Shepard Mental Rotation Attention Task"
        instructions={
          language === 'he'
            ? `הביטו בצללית המטרה המוצגת למעלה. מבין ארבע הצלליות למטה, מצאו את זו שהיא אותה צורה בדיוק (רק מסובבת בזווית אחרת). שימו לב: צלליות במראה (הפוכות) או צורות שונות אינן נכונות!`
            : `Examine the target silhouette at the top. From the four choices below, find the one that is the exact same shape merely rotated at another angle.`
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
          <RotateCw className="text-blue-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'התאמת צלליות בזווית' : 'Rotated Silhouette'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
        </span>
      </div>

      {/* Target Preview */}
      <div className="text-center mb-6">
        <span className="text-xs font-bold text-slate-400 block mb-2">
          {language === 'he' ? 'צללית המטרה:' : 'Target Silhouette:'}
        </span>
        <div className="w-24 h-24 mx-auto bg-slate-100 dark:bg-slate-900 border-2 border-blue-400 rounded-2xl flex items-center justify-center shadow-md">
          {renderSilhouetteSvg(targetShape, targetAngle, false, 64)}
        </div>
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
                ? (language === 'he' ? 'סיבוב מנטלי מושלם!' : 'Superb mental rotation!')
                : (language === 'he' ? 'הצללית שנבחרה הייתה שונה או במראה' : 'Incorrect choice or mirrored reflection')}
            </span>
          </div>
          <button
            onClick={initRound}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'he' ? 'הבא' : 'Next'}
          </button>
        </div>
      )}

      {/* 4 Choices */}
      <div className="grid grid-cols-2 gap-4">
        {options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          const isWinner = opt.id === 1;

          let border = 'border-slate-200 dark:border-slate-700 hover:border-blue-400';
          if (isFinished) {
            if (isWinner) border = 'border-emerald-500 ring-2 ring-emerald-400 bg-emerald-50/50';
            else if (isSelected) border = 'border-red-500 ring-2 ring-red-400 bg-red-50/50';
          }

return (
            <button
              key={idx}
              onClick={() => handleSelect(idx, opt)}
              className={`p-4 bg-white dark:bg-slate-800 border-2 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm min-h-[96px] ${border}`}
            >
              <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
              {renderSilhouetteSvg(opt.shape, opt.angle, opt.isMirrored, 56)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
