import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, MapPin } from 'lucide-react';

interface ObjectLocationRecallProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface PlacedObject {
  id: string;
  emoji: string;
  name: { he: string; en: string };
  cellIndex: number;
}

const CANDIDATE_OBJECTS = [
  { id: 'key', emoji: '🔑', name: { he: 'מפתח', en: 'Key' } },
  { id: 'clock', emoji: '⏰', name: { he: 'שעון מעורר', en: 'Clock' } },
  { id: 'book', emoji: '📖', name: { he: 'ספר פתוח', en: 'Book' } },
  { id: 'glasses', emoji: '👓', name: { he: 'משקפי ראייה', en: 'Glasses' } },
  { id: 'cup', emoji: '☕', name: { he: 'כוס קפה', en: 'Coffee Cup' } },
  { id: 'plant', emoji: '🌿', name: { he: 'עציץ', en: 'Plant' } },
  { id: 'lamp', emoji: '💡', name: { he: 'מנורה', en: 'Lamp' } },
  { id: 'umbrella', emoji: '☂️', name: { he: 'מטריה', en: 'Umbrella' } },
];

export const ObjectLocationRecall: React.FC<ObjectLocationRecallProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const gridSize = 4; // 4x4 room grid
  const totalCells = gridSize * gridSize;
  const numObjects = Math.min(6, 3 + Math.floor(clampedLevel / 3)); // 3 to 6 objects

  const [isReady, setIsReady] = useState(false);
  const [phase, setPhase] = useState<'memorize' | 'query' | 'result'>('memorize');
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
  const [targetObject, setTargetObject] = useState<PlacedObject | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    // Pick random objects
    const shuffled = [...CANDIDATE_OBJECTS].sort(() => 0.5 - Math.random());
    const chosen = shuffled.slice(0, numObjects);

    // Pick random distinct cells
    const cellIndices: number[] = [];
    while (cellIndices.length < numObjects) {
      const idx = Math.floor(Math.random() * totalCells);
      if (!cellIndices.includes(idx)) cellIndices.push(idx);
    }

    const placed: PlacedObject[] = chosen.map((obj, i) => ({
      ...obj,
      cellIndex: cellIndices[i],
    }));

    setPlacedObjects(placed);
    const target = placed[Math.floor(Math.random() * placed.length)];
    setTargetObject(target);
    setSelectedCell(null);
    setIsCorrect(null);
    setPhase('memorize');

    // Memorization window
    const duration = Math.max(2500, 4500 - clampedLevel * 150);
    setTimeout(() => {
      setPhase('query');
      setStartTime(Date.now());
    }, duration);
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel]);

  const handleCellClick = (idx: number) => {
    if (phase !== 'query' || !targetObject) return;

    const rt = Date.now() - startTime;
    setSelectedCell(idx);
    const correct = idx === targetObject.cellIndex;
    setIsCorrect(correct);
    setPhase('result');

    if (soundEnabled) {
      audioManager.play(correct ? 'success' : 'soft_error');
    }
    onFeedbackGiven(correct, rt);
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'זיכרון מיקומי חפצים' : 'Object Location Recall'}
        scientificProtocol="Object-Location Memory Test (Postma et al., 2008)"
        instructions={
          language === 'he'
            ? `הביטו היטב בחפצים הפזורים בחדר ושננו את מיקומם המדויק. לאחר שייעלמו, תתבקשו להצביע על המשבצת בה הונח חפץ ספציפי.`
            : `Observe the objects placed across the room and memorize their exact positions. Once hidden, identify where a specific target item was located.`
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

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="text-emerald-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'זיכרון מיקומי חפצים' : 'Object Location Recall'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel} | ${numObjects} חפצים` : `Level ${clampedLevel} | ${numObjects} items`}
        </span>
      </div>

      {phase === 'memorize' && (
        <div className="text-center py-2 px-4 mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold rounded-lg animate-pulse">
          {language === 'he' ? '👀 שננו את מיקומי החפצים בחדר...' : '👀 Memorize the positions of all items...'}
        </div>
      )}

      {phase === 'query' && targetObject && (
        <div className="text-center py-3 px-4 mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-lg rounded-xl flex items-center justify-center gap-3">
          <span>{language === 'he' ? 'איפה הונח:' : 'Where was the:'}</span>
          <span className="text-3xl">{targetObject.emoji}</span>
          <span className="underline underline-offset-4">{targetObject.name[language]}</span>
        </div>
      )}

      {phase === 'result' && (
        <div className={`p-4 mb-4 rounded-xl flex items-center justify-between ${
          isCorrect ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-600 dark:text-emerald-300' :
          'bg-amber-500/15 border border-amber-500 text-amber-600 dark:text-amber-300'
        }`}>
          <div className="flex items-center gap-2 font-bold text-lg">
            {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <span>
              {isCorrect
                ? (language === 'he' ? 'מדויק לחלוטין! זיכרון מרחבי מעולה!' : 'Spot on! Superb spatial recall!')
                : (language === 'he' ? `החפץ היה במשבצת המסומנת בירוק` : `The item was in the green cell`)}
            </span>
          </div>
          <button
            onClick={initRound}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'he' ? 'סיבוב הבא' : 'Next Round'}
          </button>
        </div>
      )}

      {/* Grid */}
      <div
        className="grid grid-cols-4 gap-3 mx-auto mb-4"
        style={{ maxWidth: '380px' }}
      >
        {Array.from({ length: totalCells }).map((_, idx) => {
          const placed = placedObjects.find(p => p.cellIndex === idx);
          const isTargetCell = targetObject?.cellIndex === idx;
          const isSelected = selectedCell === idx;

          let cellBg = 'bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600';
          if (phase === 'memorize' && placed) {
            cellBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-600 shadow-sm';
          } else if (phase === 'result') {
            if (isTargetCell) {
              cellBg = 'bg-emerald-500 text-white border-2 border-emerald-600 ring-2 ring-emerald-300';
            } else if (isSelected && !isTargetCell) {
              cellBg = 'bg-red-500 text-white border-2 border-red-600';
            }
          }

return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={phase !== 'query'}
              className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all duration-150 min-h-[64px] ${cellBg} ${
                phase === 'query' ? 'hover:scale-105 hover:border-emerald-500 cursor-pointer' : ''
              }`}
            >
              {phase === 'memorize' && placed && placed.emoji}
              {phase === 'result' && isTargetCell && targetObject?.emoji}
              {phase === 'result' && isSelected && !isTargetCell && '❌'}
            </button>
          );
        })}
      </div>
    </div>
  );
};
