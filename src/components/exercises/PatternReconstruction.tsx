import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, Shapes } from 'lucide-react';

interface PatternReconstructionProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface PatternCard {
  id: number;
  shapes: { type: 'circle' | 'square' | 'triangle' | 'diamond'; color: string; pos: 'top' | 'bottom' | 'left' | 'right' | 'center' }[];
}

export const PatternReconstruction: React.FC<PatternReconstructionProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const [isReady, setIsReady] = useState(false);
  const [phase, setPhase] = useState<'memorize' | 'select' | 'result'>('memorize');
  const [targetPattern, setTargetPattern] = useState<PatternCard | null>(null);
  const [options, setOptions] = useState<PatternCard[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'];
  const shapeTypes: ('circle' | 'square' | 'triangle' | 'diamond')[] = ['circle', 'square', 'triangle', 'diamond'];

  const generateCard = (id: number, complexity: number): PatternCard => {
    const numElements = Math.min(4, 2 + Math.floor(complexity / 3));
    const positions: ('top' | 'bottom' | 'left' | 'right' | 'center')[] = ['center', 'top', 'bottom', 'left', 'right'];
    const shapes = [];

    for (let i = 0; i < numElements; i++) {
      shapes.push({
        type: shapeTypes[(id + i) % shapeTypes.length],
        color: colors[(id + i * 2) % colors.length],
        pos: positions[i],
      });
    }

    return { id, shapes };
  };

  const initRound = () => {
    const target = generateCard(1, clampedLevel);
    // Create 3 distractor cards with slight variations
    const dist1: PatternCard = {
      id: 2,
      shapes: target.shapes.map((s, idx) => idx === 0 ? { ...s, color: colors[(colors.indexOf(s.color) + 1) % colors.length] } : s),
    };
    const dist2: PatternCard = {
      id: 3,
      shapes: target.shapes.map((s, idx) => idx === target.shapes.length - 1 ? { ...s, type: shapeTypes[(shapeTypes.indexOf(s.type) + 1) % shapeTypes.length] } : s),
    };
    const dist3: PatternCard = {
      id: 4,
      shapes: [...target.shapes].reverse(),
    };

    const allOptions = [target, dist1, dist2, dist3].sort(() => 0.5 - Math.random());

    setTargetPattern(target);
    setOptions(allOptions);
    setIsCorrect(null);
    setPhase('memorize');

    const viewTime = Math.max(2500, 4500 - clampedLevel * 150);
    setTimeout(() => {
      setPhase('select');
      setStartTime(Date.now());
    }, viewTime);
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel]);

  const handleSelect = (id: number) => {
    if (phase !== 'select' || !targetPattern) return;
    const rt = Date.now() - startTime;
    const correct = id === targetPattern.id;
    setIsCorrect(correct);
    setPhase('result');

    if (soundEnabled) {
      audioManager.play(correct ? 'success' : 'soft_error');
    }
    onFeedbackGiven(correct, rt);
  };

  const renderShapeIcon = (type: string, color: string) => {
    switch (type) {
      case 'circle':
        return <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: color }} />;
      case 'square':
        return <div className="w-8 h-8 rounded-md shadow-sm" style={{ backgroundColor: color }} />;
      case 'triangle':
        return (
          <div
            className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px]"
            style={{ borderBottomColor: color }}
          />
        );
      case 'diamond':
        return <div className="w-7 h-7 rotate-45 shadow-sm" style={{ backgroundColor: color }} />;
      default:
        return null;
    }
  };

  const renderPatternBox = (pattern: PatternCard, isLarge = false) => {
    return (
      <div className={`relative flex items-center justify-center bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl ${
        isLarge ? 'w-56 h-56 mx-auto' : 'w-full h-36'
      }`}>
        {pattern.shapes.map((s, idx) => {
          let posClass = 'absolute';
          if (s.pos === 'center') posClass += ' inset-0 m-auto flex items-center justify-center';
          if (s.pos === 'top') posClass += ' top-3 left-1/2 -translate-x-1/2';
          if (s.pos === 'bottom') posClass += ' bottom-3 left-1/2 -translate-x-1/2';
          if (s.pos === 'left') posClass += ' left-3 top-1/2 -translate-y-1/2';
          if (s.pos === 'right') posClass += ' right-3 top-1/2 -translate-y-1/2';

          return (
            <div key={idx} className={posClass}>
              {renderShapeIcon(s.type, s.color)}
            </div>
          );
        })}
      </div>
    );
  };

if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'שחזור תבנית גיאומטרית' : 'Pattern Reconstruction'}
        scientificProtocol="Benton Visual Retention Test (BVRT)"
        instructions={
          language === 'he'
            ? `התבוננו בקפידה במערך הצורות והצבעים המוצג במרכז. לאחר היעלמותו, בחרו את התבנית הזהה מבין 4 האפשרויות.`
            : `Examine the composite geometric pattern. After it disappears, identify the exact matching configuration among the 4 choices.`
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
          <Shapes className="text-violet-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'שחזור תבנית גיאומטרית' : 'Pattern Reconstruction'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
        </span>
      </div>

      {phase === 'memorize' && targetPattern && (
        <div className="text-center">
          <div className="py-2 px-4 mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold rounded-lg animate-pulse">
            {language === 'he' ? '👀 זכרו את הרכב הצורות והמיקומים...' : '👀 Memorize the shapes and spatial layout...'}
          </div>
          {renderPatternBox(targetPattern, true)}
        </div>
      )}

      {phase === 'select' && (
        <div>
          <div className="text-center py-2 px-4 mb-4 bg-violet-500/10 border border-violet-500/30 text-violet-700 dark:text-violet-300 font-bold rounded-lg">
            {language === 'he' ? 'איזו תבנית זהה לחלוטין לזו שהוצגה?' : 'Which pattern exactly matches the one shown?'}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className="p-3 bg-white dark:bg-slate-700/50 rounded-2xl border-2 border-slate-200 dark:border-slate-600 hover:border-violet-500 hover:scale-[1.02] transition-all flex flex-col items-center gap-2 shadow-sm"
              >
                <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                {renderPatternBox(opt)}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && targetPattern && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl flex items-center justify-between ${
            isCorrect ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-600 dark:text-emerald-300' :
            'bg-amber-500/15 border border-amber-500 text-amber-600 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-2 font-bold text-lg">
              {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              <span>
                {isCorrect
                  ? (language === 'he' ? 'מדויק! הבחנה חזותית מצוינת!' : 'Accurate! Excellent visual retention!')
                  : (language === 'he' ? 'הייתה אי-התאמה קלה בפרטים' : 'Slight mismatch in details')}
              </span>
            </div>
            <button
              onClick={initRound}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
            >
              <RotateCcw className="w-4 h-4" />
              {language === 'he' ? 'הבא' : 'Next'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-xs font-bold text-slate-500 block mb-2">
              {language === 'he' ? 'התבנית המקורית הנכונה:' : 'The original target pattern:'}
            </span>
            {renderPatternBox(targetPattern, true)}
          </div>
        </div>
      )}
    </div>
  );
};
