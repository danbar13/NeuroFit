import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, Equal } from 'lucide-react';

interface SpeedArithmeticComparisonProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface MathProblem {
  exprA: string;
  valA: number;
  exprB: string;
  valB: number;
  relation: '<' | '=' | '>';
}

export const SpeedArithmeticComparison: React.FC<SpeedArithmeticComparisonProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const totalTrials = 10 + clampedLevel;
  const timeoutMs = Math.max(2000, 3800 - clampedLevel * 140);

  const [isReady, setIsReady] = useState(false);
  const [trialIdx, setTrialIdx] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [correctHits, setCorrectHits] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(100);

  const startTimeRef = useRef<number>(0);
  const rtsRef = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateProblem = (): MathProblem => {
    const a1 = Math.floor(Math.random() * 12) + 2;
    const a2 = Math.floor(Math.random() * 12) + 2;
    const valA = a1 + a2;

    const r = Math.random();
    let valB: number;
    let exprB: string;
    let rel: '<' | '=' | '>';

    if (r < 0.3) {
      // Equal
      valB = valA;
      const b1 = Math.floor(valB / 2);
      const b2 = valB - b1;
      exprB = `${b1} + ${b2}`;
      rel = '=';
    } else if (r < 0.65) {
      // Greater (valA > valB)
      valB = Math.max(2, valA - (Math.floor(Math.random() * 5) + 1));
      const b1 = Math.floor(valB / 2);
      const b2 = valB - b1;
      exprB = `${b1} + ${b2}`;
      rel = '>';
    } else {
      // Smaller (valA < valB)
      valB = valA + (Math.floor(Math.random() * 5) + 1);
      const b1 = Math.floor(valB / 2);
      const b2 = valB - b1;
      exprB = `${b1} + ${b2}`;
      rel = '<';
    }

    return {
      exprA: `${a1} + ${a2}`,
      valA,
      exprB,
      valB,
      relation: rel,
    };
  };

  const nextTrial = (nextIdx: number) => {
    if (nextIdx >= totalTrials) {
      finishTask();
      return;
    }

    const prob = generateProblem();
    setCurrentProblem(prob);
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

  const handleSelectRel = (rel: '<' | '=' | '>') => {
    if (!currentProblem || isFinished) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    const rt = Date.now() - startTimeRef.current;
    const isCorrect = currentProblem.relation === rel;

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
        title={language === 'he' ? 'השוואת ביטויים מהירה' : 'Speed Arithmetic Comparison'}
        scientificProtocol="Numerical Stroop & Magnitude Processing"
        instructions={
          language === 'he'
            ? `השוו במהירות בין שני הביטויים החשבוניים המוצגים מימין ומשמאל: האם הביטוי השמאלי קטן מ- (<), שווה ל- (=), או גדול מ- (>) הביטוי הימני? הכריעו במהירות שיא!`
            : `Quickly compare the two math expressions: is the left expression less than (<), equal to (=), or greater than (>) the right? Decide at rapid speed!`
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
          <Equal className="text-blue-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'השוואת ביטויים מהירה' : 'Speed Comparison'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-full">
          {language === 'he' ? `תרגיל ${trialIdx + 1}/${totalTrials}` : `Trial ${trialIdx + 1}/${totalTrials}`}
        </span>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-75 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Equation comparison boxes */}
          {currentProblem && (
            <div className="flex items-center justify-center gap-4 py-8">
              <div className="flex-1 py-6 bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-center text-3xl font-black shadow-sm">
                {currentProblem.exprA}
              </div>
              <div className="w-12 text-center text-2xl font-bold text-slate-400">
                vs
              </div>
              <div className="flex-1 py-6 bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-center text-3xl font-black shadow-sm">
                {currentProblem.exprB}
              </div>
            </div>
          )}

          {/* Choice Buttons: <, =, > */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSelectRel('<')}
              className="py-5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-2xl rounded-2xl shadow-lg transition-all min-h-[64px]"
            >
              &lt; {language === 'he' ? '(קטן)' : '(Less)'}
            </button>
            <button
              onClick={() => handleSelectRel('=')}
              className="py-5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-black text-2xl rounded-2xl shadow-lg transition-all min-h-[64px]"
            >
              = {language === 'he' ? '(שווה)' : '(Equal)'}
            </button>
            <button
              onClick={() => handleSelectRel('>')}
              className="py-5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-2xl rounded-2xl shadow-lg transition-all min-h-[64px]"
            >
              &gt; {language === 'he' ? '(גדול)' : '(Greater)'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 py-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-bold">
            {language === 'he' ? 'ההשוואה הושלמה בהצלחה!' : 'Comparison Complete!'}
          </h3>
          <p className="text-slate-500 font-medium">
            {language === 'he'
              ? `דייקתם ב-${correctHits} מתוך ${totalTrials} השוואות.`
              : `Accurately solved ${correctHits} of ${totalTrials} comparisons.`}
          </p>
          <button
            onClick={initRound}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow"
          >
            {language === 'he' ? 'בצעו שוב' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
};
