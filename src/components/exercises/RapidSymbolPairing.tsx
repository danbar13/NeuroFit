import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, Copy } from 'lucide-react';

interface RapidSymbolPairingProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface SymbolSpec {
  ringCount: number;
  innerShape: 'star' | 'square' | 'circle';
  dots: number;
  color: string;
}

export const RapidSymbolPairing: React.FC<RapidSymbolPairingProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const totalTrials = 10 + clampedLevel;
  const timeoutMs = Math.max(1300, 2500 - clampedLevel * 90);

  const [isReady, setIsReady] = useState(false);
  const [trialIdx, setTrialIdx] = useState<number>(0);
  const [symbolLeft, setSymbolLeft] = useState<SymbolSpec | null>(null);
  const [symbolRight, setSymbolRight] = useState<SymbolSpec | null>(null);
  const [isIdenticalTarget, setIsIdenticalTarget] = useState<boolean>(true);
  const [correctHits, setCorrectHits] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(100);

  const startTimeRef = useRef<number>(0);
  const rtsRef = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const colors = ['#2563eb', '#9333ea', '#059669', '#dc2626'];
  const innerShapes: ('star' | 'square' | 'circle')[] = ['star', 'square', 'circle'];

  const generatePair = () => {
    const isSame = Math.random() < 0.5;
    setIsIdenticalTarget(isSame);

    const base: SymbolSpec = {
      ringCount: Math.floor(Math.random() * 2) + 1,
      innerShape: innerShapes[Math.floor(Math.random() * innerShapes.length)],
      dots: Math.floor(Math.random() * 3) + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    let pair: SymbolSpec;
    if (isSame) {
      pair = { ...base };
    } else {
      // Alter one detail
      const mod = Math.random();
      if (mod < 0.33) {
        const others = innerShapes.filter(s => s !== base.innerShape);
        pair = { ...base, innerShape: others[0] };
      } else if (mod < 0.66) {
        pair = { ...base, dots: base.dots === 1 ? 3 : 1 };
      } else {
        pair = { ...base, ringCount: base.ringCount === 1 ? 2 : 1 };
      }
    }

    setSymbolLeft(base);
    setSymbolRight(pair);
  };

  const nextTrial = (nextIdx: number) => {
    if (nextIdx >= totalTrials) {
      finishTask();
      return;
    }

    generatePair();
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

  const handleDecision = (userSaysSame: boolean) => {
    if (isFinished) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    const rt = Date.now() - startTimeRef.current;
    const isCorrect = userSaysSame === isIdenticalTarget;

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

  const renderSymbolSvg = (spec: SymbolSpec) => {
    const size = 80;
    const center = size / 2;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={36} fill="none" stroke={spec.color} strokeWidth="3" />
        {spec.ringCount > 1 && (
          <circle cx={center} cy={center} r={28} fill="none" stroke={spec.color} strokeWidth="2" strokeDasharray="3 3" />
        )}
        {spec.innerShape === 'circle' && <circle cx={center} cy={center} r={12} fill={spec.color} />}
        {spec.innerShape === 'square' && <rect x={center - 10} y={center - 10} width={20} height={20} fill={spec.color} rx={3} />}
        {spec.innerShape === 'star' && <polygon points="40,25 44,35 55,35 46,42 49,53 40,46 31,53 34,42 25,35 36,35" fill={spec.color} />}
        {/* Perimeter dots */}
        {Array.from({ length: spec.dots }).map((_, i) => (
          <circle key={i} cx={center - 10 + i * 10} cy={72} r={3} fill="#64748b" />
        ))}
      </svg>
    );
  };

if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'זיווג סמלים מהיר' : 'Rapid Symbol Pairing'}
        scientificProtocol="Perceptual Speed Identical Pictures Test"
        instructions={
          language === 'he'
            ? `הביטו בצמד הסמלים המוצג במרכז: האם הם זהים לחלוטין בכל פרט ופרט, או שונים? הכריעו במהירות שיא!`
            : `Examine the two symbols side-by-side: are they 100% identical in every detail, or different? Decide at rapid speed!`
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
          <Copy className="text-indigo-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'זיווג סמלים מהיר' : 'Rapid Symbol Pairing'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-full">
          {language === 'he' ? `צמד ${trialIdx + 1}/${totalTrials}` : `Pair ${trialIdx + 1}/${totalTrials}`}
        </span>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Timer bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-75 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Central side-by-side symbols */}
          {symbolLeft && symbolRight && (
            <div className="flex items-center justify-center gap-6 py-8 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-inner">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
                {renderSymbolSvg(symbolLeft)}
              </div>
              <div className="text-2xl font-bold text-slate-400">vs</div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
                {renderSymbolSvg(symbolRight)}
              </div>
            </div>
          )}

          {/* Decision Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleDecision(true)}
              className="py-5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xl rounded-2xl shadow-lg transition-all min-h-[64px]"
            >
              {language === 'he' ? '✓ זהים' : '✓ Identical'}
            </button>
            <button
              onClick={() => handleDecision(false)}
              className="py-5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xl rounded-2xl shadow-lg transition-all min-h-[64px]"
            >
              {language === 'he' ? '✗ שונים' : '✗ Different'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 py-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-bold">
            {language === 'he' ? 'זיווג הסמלים הושלם!' : 'Symbol Pairing Complete!'}
          </h3>
          <p className="text-slate-500 font-medium">
            {language === 'he'
              ? `זיהיתם נכון ${correctHits} מתוך ${totalTrials} צמדים במהירות גבוהה.`
              : `Accurately matched ${correctHits} of ${totalTrials} pairs.`}
          </p>
          <button
            onClick={initRound}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow"
          >
            {language === 'he' ? 'בצעו שוב' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
};
