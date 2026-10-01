import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, Gauge, Zap } from 'lucide-react';

interface ChoiceReactionTimeProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

export const ChoiceReactionTime: React.FC<ChoiceReactionTimeProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const totalTrials = 6;
  const [isReady, setIsReady] = useState(false);
  const [trialIdx, setTrialIdx] = useState<number>(0);
  const [phase, setPhase] = useState<'waiting' | 'active' | 'result'>('waiting');
  const [activeBoxIdx, setActiveBoxIdx] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [fastestRt, setFastestRt] = useState<number>(9999);
  const [tooEarly, setTooEarly] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startTrial = (idx: number) => {
    if (idx >= totalTrials) {
      finishTask();
      return;
    }

    setTrialIdx(idx);
    setPhase('waiting');
    setActiveBoxIdx(null);
    setTooEarly(false);

    // Random jitter delay between 1200ms and 3000ms
    const delay = 1200 + Math.random() * 1800;
    timerRef.current = setTimeout(() => {
      const target = Math.floor(Math.random() * 4);
      setActiveBoxIdx(target);
      setPhase('active');
      startTimeRef.current = Date.now();
      if (soundEnabled) audioManager.play('click');
    }, delay);
  };

  const handleBoxClick = (boxIdx: number) => {
    if (phase === 'waiting') {
      // False start / clicked too early
      if (timerRef.current) clearTimeout(timerRef.current);
      setTooEarly(true);
      if (soundEnabled) audioManager.play('soft_error');
      setTimeout(() => startTrial(trialIdx), 1500);
      return;
    }

    if (phase === 'active' && activeBoxIdx !== null) {
      if (boxIdx === activeBoxIdx) {
        const rt = Date.now() - startTimeRef.current;
        if (soundEnabled) audioManager.play('click');

        const nextRts = [...reactionTimes, rt];
        setReactionTimes(nextRts);
        if (rt < fastestRt) setFastestRt(rt);

        setPhase('waiting');
        setActiveBoxIdx(null);
        setTimeout(() => startTrial(trialIdx + 1), 600);
      }
    }
  };

  const finishTask = () => {
    setIsFinished(true);
    const avgRt = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 500;

    const pass = avgRt <= 650;
    onFeedbackGiven(pass, avgRt);
    if (soundEnabled) audioManager.play(pass ? 'success' : 'soft_error');
  };

  const initRound = () => {
    setTrialIdx(0);
    setReactionTimes([]);
    setFastestRt(9999);
    setIsFinished(false);
    startTrial(0);
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isReady, clampedLevel]);

  if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'זמן תגובה פשוט ומורכב' : 'Choice Reaction Time'}
        scientificProtocol="Hick-Hyman Law Choice Reaction Time"
        instructions={
          language === 'he'
            ? `המתינו בדריכות. ברגע שברק זוהר (⚡) יופיע באחד מארבעת הריבועים, לחצו עליו מהר ככל האפשר! אל תלחצו מוקדם מדי לפני הופעת הברק.`
            : `Stay poised. The instant a lightning bolt (⚡) flashes in one of the 4 boxes, tap it as fast as possible! Do not tap prematurely.`
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
          <Gauge className="text-yellow-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'זמן תגובה מהיר' : 'Choice Reaction Time'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 rounded-full">
          {language === 'he' ? `מדידה ${trialIdx + 1}/${totalTrials}` : `Trial ${trialIdx + 1}/${totalTrials}`}
        </span>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {tooEarly && (
            <div className="p-3 bg-red-500/15 border border-red-500 text-red-600 dark:text-red-400 rounded-xl text-center font-bold text-sm animate-shake">
              {language === 'he' ? '⚠️ לחיצה מוקדמת מדי! המתינו להופעת הברק...' : '⚠️ Too early! Wait for the flash...'}
            </div>
          )}

          {phase === 'waiting' && !tooEarly && (
            <div className="text-center py-2 text-sm font-bold text-slate-400 animate-pulse">
              {language === 'he' ? 'היו מוכנים לתגובת ברק...' : 'Get ready for lightning onset...'}
            </div>
          )}

          {/* 4 Quadrants */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {Array.from({ length: 4 }).map((_, idx) => {
              const isActive = phase === 'active' && activeBoxIdx === idx;

return (
                <button
                  key={idx}
                  onClick={() => handleBoxClick(idx)}
                  className={`aspect-square rounded-3xl border-3 flex items-center justify-center transition-all duration-75 shadow-md min-h-[96px] ${
                    isActive
                      ? 'bg-amber-400 border-amber-300 ring-8 ring-amber-300 text-white scale-105 shadow-2xl'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-slate-400 active:scale-95'
                  }`}
                >
                  {isActive && <Zap className="w-16 h-16 fill-white text-white animate-bounce" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center space-y-6 py-4">
          <div className="p-6 bg-yellow-50 dark:bg-yellow-950/40 rounded-2xl border-2 border-yellow-400">
            <CheckCircle2 className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-xl font-bold mb-4">
              {language === 'he' ? 'מדידת מהירות התגובה הושלמה!' : 'Reaction Measurement Complete!'}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <span className="block text-slate-400">{language === 'he' ? 'ממוצע' : 'Average RT'}</span>
                <span className="text-3xl font-black text-amber-600">
                  {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)} ms
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <span className="block text-slate-400">{language === 'he' ? 'שיא מהירות' : 'Fastest RT'}</span>
                <span className="text-3xl font-black text-emerald-600">{fastestRt} ms</span>
              </div>
            </div>
          </div>

          <button
            onClick={initRound}
            className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            {language === 'he' ? 'בצעו שוב' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
};
