import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, TrendingUp } from 'lucide-react';

interface RapidNumericalSequenceProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface SequenceProblem {
  terms: number[];
  expected: number;
  options: number[];
}

export const RapidNumericalSequence: React.FC<RapidNumericalSequenceProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const totalTrials = 8 + clampedLevel;
  const timeoutMs = Math.max(2200, 4200 - clampedLevel * 150);

  const [isReady, setIsReady] = useState(false);
  const [trialIdx, setTrialIdx] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<SequenceProblem | null>(null);
  const [correctHits, setCorrectHits] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(100);

  const startTimeRef = useRef<number>(0);
  const rtsRef = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateProblem = (): SequenceProblem => {
    const rules = ['add', 'sub', 'mul'] as const;
    const rule = clampedLevel <= 3 ? 'add' : rules[Math.floor(Math.random() * (clampedLevel <= 6 ? 2 : 3))];

    let terms: number[] = [];
    let expected = 0;

    if (rule === 'add') {
      const step = Math.floor(Math.random() * 5) + 2;
      const start = Math.floor(Math.random() * 10) + 1;
      terms = [start, start + step, start + step * 2, start + step * 3];
      expected = start + step * 4;
    } else if (rule === 'sub') {
      const step = Math.floor(Math.random() * 4) + 2;
      const start = 30 + Math.floor(Math.random() * 15);
      terms = [start, start - step, start - step * 2, start - step * 3];
      expected = start - step * 4;
    } else {
      // Multiply x2
      const start = Math.floor(Math.random() * 4) + 1;
      terms = [start, start * 2, start * 4, start * 8];
      expected = start * 16;
    }

    const opts = new Set<number>([expected]);
    while (opts.size < 4) {
      const delta = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
      const fake = expected + delta;
      if (fake > 0) opts.add(fake);
    }

    return {
      terms,
      expected,
      options: Array.from(opts).sort(() => 0.5 - Math.random()),
    };
  };

  const nextTrial = (nextIdx: number) => {
    if (nextIdx >= totalTrials) {
      finishTask();
      return;
    }

    setCurrentProblem(generateProblem());
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

  const handleSelectChoice = (val: number) => {
    if (!currentProblem || isFinished) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    const rt = Date.now() - startTimeRef.current;
    const isCorrect = val === currentProblem.expected;

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
        title={language === 'he' ? 'השלמת סדרה מהירה' : 'Rapid Numerical Sequence'}
        scientificProtocol="Inductive Reasoning Speed Battery"
        instructions={
          language === 'he'
            ? `פענחו במהירות את החוקיות בסדרה החשבונית ובחרו את המספר המתאים להשלמת סימן השאלה [?]. עשו זאת במהירות לפני תום הזמן!`
            : `Quickly discover the arithmetic progression pattern and choose the number that completes the question mark [?] before time elapses!`
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
          <TrendingUp className="text-emerald-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'השלמת סדרה מהירה' : 'Rapid Sequence'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
          {language === 'he' ? `סדרה ${trialIdx + 1}/${totalTrials}` : `Sequence ${trialIdx + 1}/${totalTrials}`}
        </span>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Timer bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-75 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Sequence Row */}
          {currentProblem && (
            <div className="flex justify-center items-center gap-3 py-6">
              {currentProblem.terms.map((t, i) => (
                <div key={i} className="w-14 h-16 bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center text-2xl font-black shadow-sm">
                  {t}
                </div>
              ))}
              <div className="w-14 h-16 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-dashed border-emerald-400 rounded-xl flex items-center justify-center text-3xl font-black text-emerald-600">
                ?
              </div>
            </div>
          )}

          {/* Choices */}
          {currentProblem && (
            <div className="grid grid-cols-2 gap-4">
              {currentProblem.options.map((val) => (
                <button
                  key={val}
                  onClick={() => handleSelectChoice(val)}
                  className="py-4 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:scale-105 active:scale-95 text-2xl font-black rounded-2xl shadow-md transition-all min-h-[64px]"
                >
                  {val}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center space-y-4 py-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-bold">
            {language === 'he' ? 'פענוח הסדרות הושלם!' : 'Sequence Deduction Complete!'}
          </h3>
          <p className="text-slate-500 font-medium">
            {language === 'he'
              ? `השלמתם נכון ${correctHits} מתוך ${totalTrials} סדרות.`
              : `Successfully completed ${correctHits} of ${totalTrials} sequences.`}
          </p>
          <button
            onClick={initRound}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
          >
            {language === 'he' ? 'בצעו שוב' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
};
