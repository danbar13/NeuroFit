import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, Octagon } from 'lucide-react';

interface GoNoGoTaskProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface Trial {
  type: 'go' | 'nogo';
  stimulusColor: string;
}

export const GoNoGoTask: React.FC<GoNoGoTaskProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const totalTrials = 12 + clampedLevel;
  const stimulusDurationMs = Math.max(700, 1300 - clampedLevel * 60);
  const isiDurationMs = 600;

  const [isReady, setIsReady] = useState(false);
  const [currentTrialIdx, setCurrentTrialIdx] = useState<number>(-1);
  const [currentTrial, setCurrentTrial] = useState<Trial | null>(null);
  const [respondedThisTrial, setRespondedThisTrial] = useState<boolean>(false);
  const [score, setScore] = useState<{ hits: number; correctInhibitions: number; falseAlarms: number; misses: number }>({
    hits: 0,
    correctInhibitions: 0,
    falseAlarms: 0,
    misses: 0,
  });
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const trialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trialStartTimeRef = useRef<number>(0);
  const responseTimesRef = useRef<number[]>([]);

  // Generate sequence of trials (75% Go, 25% No-Go to build prepotent response impulse)
  const trialsRef = useRef<Trial[]>([]);

  const startTask = () => {
    const list: Trial[] = [];
    for (let i = 0; i < totalTrials; i++) {
      const isNoGo = Math.random() < 0.28 && i > 0;
      list.push({
        type: isNoGo ? 'nogo' : 'go',
        stimulusColor: isNoGo ? '#ef4444' : '#10b981',
      });
    }
    trialsRef.current = list;
    setCurrentTrialIdx(0);
    setRespondedThisTrial(false);
    setIsFinished(false);
    setScore({ hits: 0, correctInhibitions: 0, falseAlarms: 0, misses: 0 });
    responseTimesRef.current = [];

    runTrial(0);
  };

  const runTrial = (idx: number) => {
    if (idx >= trialsRef.current.length) {
      finishTask();
      return;
    }

    const t = trialsRef.current[idx];
    setCurrentTrialIdx(idx);
    setCurrentTrial(t);
    setRespondedThisTrial(false);
    trialStartTimeRef.current = Date.now();

    // After stimulusDurationMs, evaluate trial if not responded
    trialTimerRef.current = setTimeout(() => {
      // Evaluate outcome for this trial
      setCurrentTrial(null); // blank during ISI

      setScore(prev => {
        if (t.type === 'go') {
          // Missed GO
          return { ...prev, misses: prev.misses + 1 };
        } else {
          // Successfully inhibited NO-GO
          return { ...prev, correctInhibitions: prev.correctInhibitions + 1 };
        }
      });

      // ISI before next trial
      trialTimerRef.current = setTimeout(() => {
        runTrial(idx + 1);
      }, isiDurationMs);
    }, stimulusDurationMs);
  };

  const handleAction = () => {
    if (!currentTrial || respondedThisTrial || isFinished) return;

    const rt = Date.now() - trialStartTimeRef.current;
    setRespondedThisTrial(true);

    if (currentTrial.type === 'go') {
      // Correct HIT
      if (soundEnabled) audioManager.play('click');
      responseTimesRef.current.push(rt);
      setScore(prev => ({ ...prev, hits: prev.hits + 1 }));
    } else {
      // False Alarm (Failure of inhibition)
      if (soundEnabled) audioManager.play('soft_error');
      setScore(prev => ({ ...prev, falseAlarms: prev.falseAlarms + 1 }));
    }
  };

  const finishTask = () => {
    setIsFinished(true);
    const avgRt = responseTimesRef.current.length > 0
      ? responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length
      : 800;

    const totalSuccessful = score.hits + score.correctInhibitions;
    const accuracy = totalSuccessful / totalTrials;
    onFeedbackGiven(accuracy >= 0.75, Math.round(avgRt));
    if (soundEnabled) {
      audioManager.play(accuracy >= 0.75 ? 'success' : 'soft_error');
    }
  };

  useEffect(() => {
    if (isReady) {
      startTask();
    }
    return () => {
      if (trialTimerRef.current) clearTimeout(trialTimerRef.current);
    };
  }, [isReady, clampedLevel]);

if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'מבחן Go / No-Go (עיכוב תגובה)' : 'Go / No-Go Inhibition'}
        scientificProtocol="Go / No-Go Sustained Attention Protocol"
        instructions={
          language === 'he'
            ? `כאשר מופיע עיגול ירוק (GO), לחצו במהירות על הכפתור "צא!"! אך כאשר מופיע מתומן אדום (NO-GO), עיצרו את עצמכם ואל תלחצו כלל!`
            : `When a Green circle appears (GO), tap the "GO!" button rapidly. When a Red octagon appears (NO-GO), withhold your response and do not press!`
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
          <Octagon className="text-emerald-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'מבחן Go / No-Go' : 'Go / No-Go Inhibition'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel} | ${currentTrialIdx + 1}/${totalTrials}` : `Level ${clampedLevel} | ${currentTrialIdx + 1}/${totalTrials}`}
        </span>
      </div>

      {!isFinished ? (
        <div className="text-center space-y-6">
          <div className="h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
            {currentTrial ? (
              currentTrial.type === 'go' ? (
                <div className="w-28 h-28 rounded-full bg-emerald-500 shadow-xl flex items-center justify-center text-white text-3xl font-black animate-scaleIn">
                  GO!
                </div>
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-red-600 shadow-xl flex items-center justify-center text-white text-xl font-black animate-scaleIn">
                  STOP!
                </div>
              )
            ) : (
              <span className="text-3xl text-slate-300 font-bold">+</span>
            )}
          </div>

          <button
            onClick={handleAction}
            className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-2xl rounded-2xl shadow-xl transition-all min-h-[72px]"
          >
            {language === 'he' ? '🟢 תגובה (GO!)' : '🟢 PRESS (GO!)'}
          </button>
        </div>
      ) : (
        <div className="space-y-6 text-center py-4">
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border-2 border-emerald-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-xl font-bold mb-4">
              {language === 'he' ? 'המבחן הושלם בהצלחה!' : 'Task Completed!'}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <span className="block text-slate-400">{language === 'he' ? 'תגובות מדויקות (Hits)' : 'Hits'}</span>
                <span className="text-2xl font-bold text-emerald-600">{score.hits}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <span className="block text-slate-400">{language === 'he' ? 'עיכוב מוצלח (Inhibitions)' : 'Inhibitions'}</span>
                <span className="text-2xl font-bold text-teal-600">{score.correctInhibitions}</span>
              </div>
            </div>
          </div>

          <button
            onClick={startTask}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            {language === 'he' ? 'בצעו שוב' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
};
