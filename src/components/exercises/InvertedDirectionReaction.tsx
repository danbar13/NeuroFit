import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, Compass, ArrowLeft, ArrowRight } from 'lucide-react';

interface InvertedDirectionReactionProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface ArrowStimulus {
  pointing: 'left' | 'right';
  mode: 'direct' | 'inverted'; // direct = blue, inverted = orange
}

export const InvertedDirectionReaction: React.FC<InvertedDirectionReactionProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const totalTrials = 10 + clampedLevel;
  const timeoutMs = Math.max(1200, 2400 - clampedLevel * 90);

  const [isReady, setIsReady] = useState(false);
  const [trialIdx, setTrialIdx] = useState<number>(0);
  const [currentArrow, setCurrentArrow] = useState<ArrowStimulus | null>(null);
  const [correctHits, setCorrectHits] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(100);

  const startTimeRef = useRef<number>(0);
  const rtsRef = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextTrial = (nextIdx: number) => {
    if (nextIdx >= totalTrials) {
      finishTask();
      return;
    }

    const pointing: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right';
    const mode: 'direct' | 'inverted' = Math.random() < 0.5 ? 'direct' : 'inverted';
    setCurrentArrow({ pointing, mode });

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

  const handleArrowPress = (userDirection: 'left' | 'right') => {
    if (!currentArrow || isFinished) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    const rt = Date.now() - startTimeRef.current;

    // Direct mode -> user direction must equal pointing
    // Inverted mode -> user direction must be opposite of pointing
    const expectedDirection =
      currentArrow.mode === 'direct'
        ? currentArrow.pointing
        : currentArrow.pointing === 'left' ? 'right' : 'left';

    const isCorrect = userDirection === expectedDirection;

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
        title={language === 'he' ? 'תגובת כיוונים והיפוך' : 'Inverted Direction Reaction'}
        scientificProtocol="Spatial Compatibility / Simon Effect"
        instructions={
          language === 'he'
            ? `שימו לב לצבע החץ:\n• חץ כחול: לחצו על אותו כיוון שאליו החץ מצביע!\n• חץ כתום: לחצו על הכיוון ההפוך בדיוק!\nפעלו במהירות שיא!`
            : `Notice the arrow color:\n• Blue arrow: Tap the SAME direction it points!\n• Orange arrow: Tap the OPPOSITE direction!\nReact swiftly!`
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
          <Compass className="text-blue-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'תגובת כיוונים והיפוך' : 'Direction Reaction'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-full">
          {language === 'he' ? `חץ ${trialIdx + 1}/${totalTrials}` : `Trial ${trialIdx + 1}/${totalTrials}`}
        </span>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Rule Legend */}
          <div className="flex justify-center gap-6 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              {language === 'he' ? 'כחול = אותו כיוון' : 'Blue = Same'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              {language === 'he' ? 'כתום = כיוון הפוך' : 'Orange = Opposite'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-75 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Central Arrow */}
          {currentArrow && (
            <div className="h-44 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl flex items-center justify-center shadow-inner">
              <div
                className={`p-6 rounded-3xl text-white shadow-xl transition-all ${
                  currentArrow.mode === 'direct' ? 'bg-blue-600' : 'bg-orange-500'
                }`}
              >
                {currentArrow.pointing === 'left' ? (
                  <ArrowLeft className="w-20 h-20" />
                ) : (
                  <ArrowRight className="w-20 h-20" />
                )}
              </div>
            </div>
          )}

          {/* User Tap Buttons: Left vs Right */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleArrowPress('left')}
              className="py-5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 active:scale-95 text-slate-800 dark:text-white font-extrabold text-2xl rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 min-h-[64px]"
            >
              <ArrowLeft className="w-8 h-8" />
              <span>{language === 'he' ? 'שמאלה' : 'Left'}</span>
            </button>

            <button
              onClick={() => handleArrowPress('right')}
              className="py-5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 active:scale-95 text-slate-800 dark:text-white font-extrabold text-2xl rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 min-h-[64px]"
            >
              <span>{language === 'he' ? 'ימינה' : 'Right'}</span>
              <ArrowRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 py-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-bold">
            {language === 'he' ? 'מבחן הכיוונים וההיפוך הושלם!' : 'Direction Task Complete!'}
          </h3>
          <p className="text-slate-500 font-medium">
            {language === 'he'
              ? `תגובה מדויקת ב-${correctHits} מתוך ${totalTrials} חצים.`
              : `Accurate response on ${correctHits} of ${totalTrials} arrows.`}
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
