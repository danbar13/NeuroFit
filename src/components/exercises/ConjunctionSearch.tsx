import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, Search } from 'lucide-react';

interface ConjunctionSearchProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface Item {
  id: number;
  color: 'red' | 'blue' | 'green' | 'amber';
  shape: 'circle' | 'square' | 'triangle';
  isTarget: boolean;
}

export const ConjunctionSearch: React.FC<ConjunctionSearchProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  // 16 items at level 1 up to 36 items at level 10
  const totalItems = Math.min(36, 16 + (clampedLevel - 1) * 2);

  const [isReady, setIsReady] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [targetFeature, setTargetFeature] = useState<{ color: string; shape: string }>({ color: 'red', shape: 'circle' });
  const [startTime, setStartTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const colorHex: Record<string, string> = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#10b981',
    amber: '#f59e0b',
  };

  const colorLabels: Record<string, { he: string; en: string }> = {
    red: { he: 'אדום', en: 'Red' },
    blue: { he: 'כחול', en: 'Blue' },
    green: { he: 'ירוק', en: 'Green' },
    amber: { he: 'צהוב', en: 'Yellow' },
  };

  const shapeLabels: Record<string, { he: string; en: string }> = {
    circle: { he: 'עיגול', en: 'Circle' },
    square: { he: 'ריבוע', en: 'Square' },
    triangle: { he: 'משולש', en: 'Triangle' },
  };

  const initRound = () => {
    const target = { color: 'red', shape: 'circle' } as const;
    setTargetFeature(target);

    const generated: Item[] = [];
    const targetIdx = Math.floor(Math.random() * totalItems);

    for (let i = 0; i < totalItems; i++) {
      if (i === targetIdx) {
        generated.push({ id: i, color: 'red', shape: 'circle', isTarget: true });
      } else {
        // Distractors sharing one feature: e.g. red squares OR blue circles
        const r = Math.random();
        if (r < 0.45) {
          generated.push({ id: i, color: 'red', shape: 'square', isTarget: false });
        } else if (r < 0.85) {
          generated.push({ id: i, color: 'blue', shape: 'circle', isTarget: false });
        } else {
          generated.push({ id: i, color: 'green', shape: 'triangle', isTarget: false });
        }
      }
    }

    setItems(generated);
    setIsFinished(false);
    setIsCorrect(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel]);

  const handleItemClick = (item: Item) => {
    if (isFinished) return;
    const rt = Date.now() - startTime;
    const correct = item.isTarget;

    setIsCorrect(correct);
    setIsFinished(true);

    if (soundEnabled) {
      audioManager.play(correct ? 'success' : 'soft_error');
    }
    onFeedbackGiven(correct, rt);
  };

  const renderShape = (item: Item) => {
    const fill = colorHex[item.color];
    if (item.shape === 'circle') {
      return <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: fill }} />;
    }
    if (item.shape === 'square') {
      return <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: fill }} />;
    }
    return (
      <div
        className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[26px]"
        style={{ borderBottomColor: fill }}
      />
    );
  };

if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'חיפוש חזותי רב-מאפייני' : 'Conjunction Visual Search'}
        scientificProtocol="Treisman Feature Integration Theory (1980)"
        instructions={
          language === 'he'
            ? `סרקו את הלוח במהירות ואתרו את הפריט היחיד שמשלב בדיוק את הצבע והצורה המבוקשים (למשל: עיגול אדום). היזהרו ממסיחים שחולקים רק מאפיין אחד (ריבועים אדומים או עיגולים כחולים)!`
            : `Scan the grid rapidly and locate the unique target combining both specific shape and color. Beware of distractors sharing only one feature!`
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
          <Search className="text-rose-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'חיפוש חזותי רב-מאפייני' : 'Conjunction Visual Search'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel} | ${totalItems} פריטים` : `Level ${clampedLevel} | ${totalItems} items`}
        </span>
      </div>

      {/* Target cue banner */}
      <div className="flex items-center justify-center gap-3 py-3 px-4 mb-4 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 rounded-xl">
        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
          {language === 'he' ? 'מצאו את:' : 'Find the:'}
        </span>
        <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: colorHex[targetFeature.color] }} />
          <span className="font-extrabold text-sm">
            {colorLabels[targetFeature.color][language]} {shapeLabels[targetFeature.shape][language]}
          </span>
        </div>
      </div>

      {isFinished && (
        <div className={`p-4 mb-4 rounded-xl flex items-center justify-between ${
          isCorrect ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-600 dark:text-emerald-300' :
          'bg-amber-500/15 border border-amber-500 text-amber-600 dark:text-amber-300'
        }`}>
          <div className="flex items-center gap-2 font-bold text-lg">
            {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <span>
              {isCorrect
                ? (language === 'he' ? 'איתור מהיר ומדויק!' : 'Rapid and precise detection!')
                : (language === 'he' ? 'זה היה מסיח חלקי, המשיכו להתמקד' : 'That was a distractor, stay focused')}
            </span>
          </div>
          <button
            onClick={initRound}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'he' ? 'הבא' : 'Next'}
          </button>
        </div>
      )}

      {/* Item Matrix */}
      <div
        className="grid gap-2.5 mx-auto p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700"
        style={{
          gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(totalItems))}, minmax(0, 1fr))`,
          maxWidth: '440px',
        }}
      >
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => handleItemClick(it)}
            className={`aspect-square rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm ${
              isFinished && it.isTarget ? 'ring-4 ring-emerald-400 bg-emerald-50' : ''
            }`}
          >
            {renderShape(it)}
          </button>
        ))}
      </div>
    </div>
  );
};
