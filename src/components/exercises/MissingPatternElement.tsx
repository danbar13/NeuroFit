import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, HelpCircle } from 'lucide-react';

interface MissingPatternElementProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface MatrixProblem {
  sequence: { rotation: number; dotCount: number }[];
  expected: { rotation: number; dotCount: number };
  options: { rotation: number; dotCount: number; isCorrect: boolean }[];
}

export const MissingPatternElement: React.FC<MissingPatternElementProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const [isReady, setIsReady] = useState(false);
  const [problem, setProblem] = useState<MatrixProblem | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    // Generate sequence rule: either rotating line or incrementing dots
    const isRotationRule = Math.random() < 0.5;
    const stepRot = isRotationRule ? 45 : 0;
    const stepDot = isRotationRule ? 0 : 1;

    const baseRot = Math.floor(Math.random() * 4) * 45;
    const baseDots = Math.floor(Math.random() * 2) + 1;

    const seq = [
      { rotation: baseRot, dotCount: baseDots },
      { rotation: baseRot + stepRot, dotCount: baseDots + stepDot },
      { rotation: baseRot + stepRot * 2, dotCount: baseDots + stepDot * 2 },
    ];
    const expected = {
      rotation: baseRot + stepRot * 3,
      dotCount: baseDots + stepDot * 3,
    };

    // Distractors
    const dist1 = { rotation: expected.rotation + 90, dotCount: expected.dotCount, isCorrect: false };
    const dist2 = { rotation: expected.rotation, dotCount: Math.max(1, expected.dotCount - 1), isCorrect: false };
    const dist3 = { rotation: expected.rotation + 45, dotCount: expected.dotCount + 1, isCorrect: false };
    const correctOpt = { ...expected, isCorrect: true };

    const opts = [correctOpt, dist1, dist2, dist3].sort(() => 0.5 - Math.random());

    setProblem({ sequence: seq, expected, options: opts });
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

  const handleSelect = (idx: number, isRight: boolean) => {
    if (isFinished) return;
    const rt = Date.now() - startTime;
    setSelectedIdx(idx);
    setIsCorrect(isRight);
    setIsFinished(true);

    if (soundEnabled) {
      audioManager.play(isRight ? 'success' : 'soft_error');
    }
    onFeedbackGiven(isRight, rt);
  };

  const renderPanelSvg = (item: { rotation: number; dotCount: number }, size = 60) => {
    const center = size / 2;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        <circle cx={center} cy={center} r={size * 0.42} fill="none" stroke="#64748b" strokeWidth="2.5" />
        {/* Pointer line */}
        <line
          x1={center}
          y1={center}
          x2={center + Math.cos((item.rotation - 90) * Math.PI / 180) * (size * 0.35)}
          y2={center + Math.sin((item.rotation - 90) * Math.PI / 180) * (size * 0.35)}
          stroke="#3b82f6"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Dots */}
        {Array.from({ length: item.dotCount }).map((_, i) => (
          <circle
            key={i}
            cx={center - (item.dotCount - 1) * 6 + i * 12}
            cy={center + size * 0.22}
            r="3"
            fill="#e11d48"
          />
        ))}
      </svg>
    );
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'איתור אלמנט חסר בתבנית' : 'Missing Pattern Element'}
        scientificProtocol="Raven Progressive Matrices Sub-attention"
        instructions={
          language === 'he'
            ? `סרקו את שורת הצורות ופענחו את החוקיות הרציפה (סיבוב קו, כמות נקודות וכד'). בחרו את האלמנט המתאים ביותר להשלמת סימן השאלה [?].`
            : `Examine the sequence of panels and deduce the progression rule (rotation, dot counts, etc.). Select the element that completes the question mark [?].`
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
          <HelpCircle className="text-indigo-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'איתור אלמנט חסר' : 'Missing Element'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
        </span>
      </div>

      {problem && (
        <div className="space-y-6">
          {/* 4-Panel Row Sequence */}
          <div className="flex justify-center items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
            {problem.sequence.map((p, i) => (
              <div key={i} className="flex-1 aspect-square bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center p-1 shadow-sm">
                {renderPanelSvg(p, 56)}
              </div>
            ))}
            <div className="flex-1 aspect-square bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border-2 border-dashed border-indigo-400 flex items-center justify-center text-2xl font-black text-indigo-600">
              ?
            </div>
          </div>

          {isFinished && (
            <div className={`p-4 rounded-xl flex items-center justify-between ${
              isCorrect ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-600 dark:text-emerald-300' :
              'bg-amber-500/15 border border-amber-500 text-amber-600 dark:text-amber-300'
            }`}>
              <div className="flex items-center gap-2 font-bold text-lg">
                {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                <span>
                  {isCorrect
                    ? (language === 'he' ? 'היסק לוגי מושלם!' : 'Spot-on deduction!')
                    : (language === 'he' ? 'הבחירה הנכונה סומנה בירוק' : 'Correct choice outlined in green')}
                </span>
              </div>
              <button
                onClick={initRound}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'he' ? 'הבא' : 'Next'}
              </button>
            </div>
          )}

          {/* Options */}
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2 text-center">
              {language === 'he' ? 'בחרו את החלק המשלים:' : 'Select the completing piece:'}
            </span>
            <div className="grid grid-cols-4 gap-2">
              {problem.options.map((opt, idx) => {
                const isSelected = selectedIdx === idx;
                let border = 'border-slate-300 dark:border-slate-600 hover:border-indigo-400';
                if (isFinished) {
                  if (opt.isCorrect) border = 'border-emerald-500 ring-2 ring-emerald-400 bg-emerald-50/40';
                  else if (isSelected) border = 'border-red-500 ring-2 ring-red-400 bg-red-50/40';
                }

return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx, opt.isCorrect)}
                    className={`aspect-square p-2 bg-white dark:bg-slate-800 rounded-xl border-2 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm min-h-[64px] ${border}`}
                  >
                    {renderPanelSvg(opt, 50)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
