import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, Timer } from 'lucide-react';

interface TrailMakingProps {
  levelNumber?: number; // 1 - 10
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface TrailNode {
  id: string;
  label: string;
  orderIndex: number; // 0, 1, 2...
  xPercent: number; // 10 to 90
  yPercent: number; // 10 to 90
}

export const TrailMakingTest: React.FC<TrailMakingProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  // In Hebrew: 1 -> א -> 2 -> ב -> 3 -> ג...
  // In English: 1 -> A -> 2 -> B -> 3 -> C...
  const pairsCount = Math.min(6, 2 + Math.ceil(clampedLevel * 0.4)); // 2 to 6 pairs (4 to 12 nodes total)

  const [isReady, setIsReady] = useState<boolean>(false);
  const [nodes, setNodes] = useState<TrailNode[]>([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState<number>(0);
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateTrail = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const hebrewLetters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח'];
    const englishLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const letters = language === 'he' ? hebrewLetters : englishLetters;

    // Alternating sequence: 1, A, 2, B, 3, C...
    const sequenceLabels: string[] = [];
    for (let i = 0; i < pairsCount; i++) {
      sequenceLabels.push((i + 1).toString());
      sequenceLabels.push(letters[i]);
    }

    // Generate non-overlapping random positions on grid (2D plane)
    const generated: TrailNode[] = [];
    const usedPositions: { x: number; y: number }[] = [];

    sequenceLabels.forEach((label, idx) => {
      let x = 0;
      let y = 0;
      let safe = false;
      let attempts = 0;

      while (!safe && attempts < 100) {
        attempts++;
        x = Math.floor(Math.random() * 75) + 12; // 12% to 87%
        y = Math.floor(Math.random() * 70) + 15; // 15% to 85%
        // Check distance against previous nodes
        const tooClose = usedPositions.some((pos) => {
          const dist = Math.hypot(pos.x - x, pos.y - y);
          return dist < 18; // Minimum separation percent
        });
        if (!tooClose) safe = true;
      }

      usedPositions.push({ x, y });
      generated.push({
        id: `node_${idx}`,
        label,
        orderIndex: idx,
        xPercent: x,
        yPercent: y,
      });
    });

    setNodes(generated);
    setCurrentTargetIndex(0);
    setCompletedNodeIds([]);
    setIsCompleted(false);
    setFeedback(null);
    setElapsedTime(0);

    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 200);
  };

  useEffect(() => {
    setIsReady(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [levelNumber, language]);

  const handleStart = () => {
    setIsReady(true);
    generateTrail();
  };

  const handleNodeClick = (node: TrailNode) => {
    if (isCompleted) return;

    if (node.orderIndex === currentTargetIndex) {
      audioManager.playTick(soundEnabled);
      const nextIndex = currentTargetIndex + 1;
      setCompletedNodeIds((prev) => [...prev, node.id]);

      if (nextIndex >= nodes.length) {
        // Complete!
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        const durationMs = Date.now() - startTimeRef.current;
        setIsCompleted(true);
        audioManager.playSuccess(soundEnabled);

        const durationSec = (durationMs / 1000).toFixed(1);
        setFeedback({
          isCorrect: true,
          message:
            language === 'he'
              ? `כל הכבוד! חיברתם את כל ${nodes.length} הנקודות ב-${durationSec} שניות!`
              : `Awesome! Connected all ${nodes.length} nodes in ${durationSec} seconds!`,
        });

        onFeedbackGiven(true, durationMs);
      } else {
        setCurrentTargetIndex(nextIndex);
      }
    } else {
      audioManager.playClick(soundEnabled);
    }
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        title={language === 'he' ? 'מבחן שבילים (Trail Making Test - Part B)' : 'Trail Making Test (Part B)'}
        categoryName={language === 'he' ? 'מהירות עיבוד וגמישות' : 'Cognitive Flexibility'}
        levelNumber={clampedLevel}
        instructions={
          language === 'he'
            ? 'על המסך מפוזרים עיגולים עם מספרים ואותיות. חברו אותם לפי הסדר לסירוגין: 1 -> א -> 2 -> ב -> 3 -> ג...'
            : 'Numbered and lettered circles are scattered on screen. Connect them in alternating order: 1 -> A -> 2 -> B -> 3 -> C...'
        }
        scientificTip={
          language === 'he'
            ? 'מבחן TMT-B בודק את גמישות התפקודים הניהוליים (Executive Function) ואת המעבר המהיר בין משימות (Task Switching).'
            : 'Trail Making Test B evaluates mental set-shifting, executive functioning, and processing speed.'
        }
        onStart={handleStart}
      />
    );
  }

  const currentExpectedLabel = nodes[currentTargetIndex]?.label ?? '';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 py-2">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-black mb-1 flex items-center justify-center gap-2">
          <span>{language === 'he' ? 'מבחן שבילים - חיבור לסירוגין' : 'Trail Making - Alternating Set'}</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
            }`}
          >
            {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
          </span>
        </h2>
        <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300">
          {language === 'he'
            ? 'חברו לפי הסדר לסירוגין: מספר -> אות -> מספר -> אות'
            : 'Connect in alternating order: Number -> Letter -> Number -> Letter'}
        </p>

        {/* Current Target & Timer Status */}
        <div className="flex items-center justify-center gap-6 mt-3">
          <div
            className={`px-4 py-1.5 rounded-xl border-2 flex items-center gap-2 ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 font-black'
                : 'bg-primary-50 dark:bg-primary-950/50 border-primary-300 text-primary-900 dark:text-primary-200 font-bold'
            }`}
          >
            <span>{language === 'he' ? 'האיבר הבא:' : 'Next target:'}</span>
            <span className="text-2xl font-black">{currentExpectedLabel}</span>
          </div>

          <div className="flex items-center gap-2 font-bold text-slate-500">
            <Timer className="w-5 h-5 text-primary-500" />
            <span>{elapsedTime}s</span>
          </div>
        </div>
      </div>

      {/* 2D Canvas Area */}
      <div
        className={`relative w-full h-[420px] sm:h-[480px] min-h-[360px] rounded-3xl border-4 shadow-xl overflow-hidden transition-all select-none ${
          highContrast
            ? 'bg-black border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 border-slate-700'
            : 'bg-slate-50 border-slate-300 shadow-md'
        }`}
      >
        {/* Draw lines between completed nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map((node, idx) => {
            if (idx === 0 || !completedNodeIds.includes(node.id)) return null;
            const prevNode = nodes[idx - 1];
            return (
              <line
                key={`line_${idx}`}
                x1={`${prevNode.xPercent}%`}
                y1={`${prevNode.yPercent}%`}
                x2={`${node.xPercent}%`}
                y2={`${node.yPercent}%`}
                stroke={highContrast ? '#facc15' : '#3b82f6'}
                strokeWidth="4"
                strokeDasharray="6 3"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const isDone = completedNodeIds.includes(node.id);
          const isCurrent = node.orderIndex === currentTargetIndex;

          return (
            <button
              key={node.id}
              onClick={() => handleNodeClick(node)}
              disabled={isDone || isCompleted}
              style={{
                left: `${node.xPercent}%`,
                top: `${node.yPercent}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-black transition-all shadow-md active:scale-95 ${
                isDone
                  ? highContrast
                    ? 'bg-yellow-400 text-black border-2 border-white'
                    : 'bg-emerald-600 text-white border-2 border-emerald-400'
                  : isCurrent
                  ? highContrast
                    ? 'bg-black text-yellow-300 border-4 border-yellow-400 ring-4 ring-yellow-400/50 scale-110'
                    : 'bg-primary-600 text-white border-2 border-primary-400 ring-4 ring-primary-400/40 scale-110'
                  : highContrast
                  ? 'bg-zinc-900 text-white border-2 border-zinc-600 hover:border-yellow-400'
                  : theme === 'dark'
                  ? 'bg-slate-800 text-slate-100 border-2 border-slate-600 hover:border-primary-400'
                  : 'bg-white text-slate-900 border-2 border-slate-300 hover:border-primary-500'
              }`}
            >
              {node.label}
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`mt-4 w-full max-w-lg p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${
            feedback.isCorrect
              ? highContrast
                ? 'bg-yellow-950/60 border-yellow-400 text-yellow-300'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200'
              : highContrast
              ? 'bg-zinc-900 border-zinc-500 text-white'
              : 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 text-blue-900 dark:text-blue-200'
          }`}
        >
          <CheckCircle2 className="w-8 h-8 shrink-0 text-emerald-500" />
          <div className="flex-1">
            <p className="font-bold text-lg">{feedback.message}</p>
          </div>
          <button
            onClick={generateTrail}
            className={`p-2 rounded-xl transition-all ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-slate-200 dark:bg-slate-800'
            }`}
            title={language === 'he' ? 'שחקו שוב' : 'Play Again'}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
