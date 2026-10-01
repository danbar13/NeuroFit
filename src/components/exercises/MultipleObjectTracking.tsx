import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, Activity } from 'lucide-react';

interface MultipleObjectTrackingProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface MovingDot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isTarget: boolean;
}

export const MultipleObjectTracking: React.FC<MultipleObjectTrackingProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const totalDots = 6 + Math.floor(clampedLevel / 3); // 6 to 9 dots
  const targetCount = clampedLevel <= 4 ? 2 : 3; // 2 or 3 targets to track

  const [isReady, setIsReady] = useState(false);
  const [phase, setPhase] = useState<'highlight' | 'moving' | 'pick' | 'result'>('highlight');
  const [dots, setDots] = useState<MovingDot[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const dotsRef = useRef<MovingDot[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const initRound = () => {
    // Generate initial dots
    const generated: MovingDot[] = [];
    for (let i = 0; i < totalDots; i++) {
      generated.push({
        id: i,
        x: 15 + Math.random() * 70, // percentage 15% to 85%
        y: 15 + Math.random() * 70,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        isTarget: i < targetCount, // first N are targets
      });
    }

    // Shuffle IDs so targets aren't just 0..N
    const shuffledTargets = [...generated].sort(() => 0.5 - Math.random());
    dotsRef.current = shuffledTargets;
    setDots([...shuffledTargets]);
    setSelectedIds([]);
    setIsCorrect(null);
    setPhase('highlight');

    // Highlight for 2.2s, then start moving
    setTimeout(() => {
      setPhase('moving');
      startMotion();
    }, 2200);
  };

  const startMotion = () => {
    const motionDuration = 4500;
    const startT = Date.now();

    const updateLoop = () => {
      const now = Date.now();
      if (now - startT > motionDuration) {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setPhase('pick');
        setStartTime(Date.now());
        return;
      }

      dotsRef.current = dotsRef.current.map(d => {
        let nx = d.x + d.vx;
        let ny = d.y + d.vy;
        let nvx = d.vx;
        let nvy = d.vy;

        if (nx <= 8 || nx >= 92) nvx = -nvx;
        if (ny <= 8 || ny >= 92) nvy = -nvy;

        return { ...d, x: Math.max(8, Math.min(92, nx)), y: Math.max(8, Math.min(92, ny)), vx: nvx, vy: nvy };
      });

      setDots([...dotsRef.current]);
      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isReady, clampedLevel]);

  const handleDotClick = (id: number) => {
    if (phase !== 'pick') return;
    if (soundEnabled) audioManager.play('click');

    let next = [...selectedIds];
    if (next.includes(id)) {
      next = next.filter(i => i !== id);
    } else {
      next.push(id);
    }
    setSelectedIds(next);

    if (next.length === targetCount) {
      // Evaluate outcome
      const rt = Date.now() - startTime;
      const targetIds = dotsRef.current.filter(d => d.isTarget).map(d => d.id);
      const allRight = targetIds.every(t => next.includes(t));

      setIsCorrect(allRight);
      setPhase('result');
      if (soundEnabled) audioManager.play(allRight ? 'success' : 'soft_error');
      onFeedbackGiven(allRight, rt);
    }
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'מעקב אחר אובייקטים נעים' : 'Multiple Object Tracking'}
        scientificProtocol="Pylyshyn Multiple Object Tracking (MOT)"
        instructions={
          language === 'he'
            ? `הביטו בעיגולים שיזהרו בתחילת התרגיל בצבע ירוק (${targetCount} כדורים). לאחר מכן הם יהפכו לכחולים רגילים וינועו בחופשיות. עקבו אחריהם ברציפות בעיניים, וכשהתנועה תיעצר סמנו את הכדורים שעקבתם אחריהם!`
            : `Track the ${targetCount} balls that initially glow green. They will turn normal and move around. Keep following them with your eyes continuously and select them when they stop!`
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
          <Activity className="text-cyan-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'מעקב אובייקטים נעים' : 'Multiple Object Tracking'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel} | עקבו אחר ${targetCount} כדורים` : `Level ${clampedLevel} | Track ${targetCount} balls`}
        </span>
      </div>

      {phase === 'highlight' && (
        <div className="text-center py-2 px-4 mb-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg animate-pulse text-sm">
          {language === 'he' ? `👀 נעלו את המבט על ${targetCount} הכדורים הירוקים...` : `👀 Lock eyes onto the ${targetCount} green balls...`}
        </div>
      )}

      {phase === 'moving' && (
        <div className="text-center py-2 px-4 mb-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-bold rounded-lg text-sm">
          {language === 'he' ? '🌀 עקבו ברציפות אחר התנועה...' : '🌀 Follow their motion with your eyes...'}
        </div>
      )}

      {phase === 'pick' && (
        <div className="text-center py-2 px-4 mb-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg text-sm">
          {language === 'he'
            ? `סמנו את ${targetCount} הכדורים שעקבתם אחריהם (${selectedIds.length}/${targetCount})`
            : `Select the ${targetCount} targets you tracked (${selectedIds.length}/${targetCount})`}
        </div>
      )}

      {phase === 'result' && (
        <div className={`p-4 mb-3 rounded-xl flex items-center justify-between ${
          isCorrect ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-600 dark:text-emerald-300' :
          'bg-amber-500/15 border border-amber-500 text-amber-600 dark:text-amber-300'
        }`}>
          <div className="flex items-center gap-2 font-bold text-lg">
            {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <span>
              {isCorrect
                ? (language === 'he' ? 'מעקב ראייה מושלם!' : 'Flawless tracking!')
                : (language === 'he' ? 'חלק מהכדורים אבדו בתנועה' : 'Lost track of targets')}
            </span>
          </div>
          <button
            onClick={initRound}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'he' ? 'הבא' : 'Next'}
          </button>
        </div>
      )}

      {/* Tracking Canvas */}
      <div className="relative w-full h-72 bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 overflow-hidden shadow-inner">
        {dots.map((d) => {
          const isSelected = selectedIds.includes(d.id);
          const showTarget = phase === 'highlight' && d.isTarget;
          const showResult = phase === 'result' && d.isTarget;

          let bg = 'bg-blue-600 shadow';
          if (showTarget || showResult) {
            bg = 'bg-emerald-500 ring-4 ring-emerald-300 shadow-lg';
          } else if (isSelected) {
            bg = 'bg-purple-600 ring-4 ring-purple-300';
          }

return (
            <button
              key={d.id}
              onClick={() => handleDotClick(d.id)}
              disabled={phase !== 'pick'}
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all ${bg} ${
                phase === 'pick' ? 'hover:scale-125 cursor-pointer' : ''
              }`}
            >
              {isSelected ? '✓' : ''}
              {showResult && '★'}
            </button>
          );
        })}
      </div>
    </div>
  );
};
