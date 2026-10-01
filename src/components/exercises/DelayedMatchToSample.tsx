import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, Layers } from 'lucide-react';

interface DelayedMatchToSampleProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface GlyphPattern {
  id: number;
  centerColor: string;
  dotPositions: number[]; // 0 to 7 positions on circle ring
}

export const DelayedMatchToSample: React.FC<DelayedMatchToSampleProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const [isReady, setIsReady] = useState(false);
  const [phase, setPhase] = useState<'sample' | 'delay' | 'choice' | 'result'>('sample');
  const [targetGlyph, setTargetGlyph] = useState<GlyphPattern | null>(null);
  const [choices, setChoices] = useState<GlyphPattern[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const colors = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];

  const initRound = () => {
    // Generate target
    const numDots = Math.min(6, 2 + Math.floor(clampedLevel / 2));
    const dots: number[] = [];
    while (dots.length < numDots) {
      const p = Math.floor(Math.random() * 8);
      if (!dots.includes(p)) dots.push(p);
    }
    const color = colors[Math.floor(Math.random() * colors.length)];

    const target: GlyphPattern = { id: 1, centerColor: color, dotPositions: dots };

    // Generate distractors
    const dist1: GlyphPattern = {
      id: 2,
      centerColor: color,
      dotPositions: dots.map(p => (p + 1) % 8), // Rotated
    };
    const dist2: GlyphPattern = {
      id: 3,
      centerColor: color,
      dotPositions: dots.slice(0, -1).concat([(dots[0] + 4) % 8]), // One dot changed
    };
    const dist3: GlyphPattern = {
      id: 4,
      centerColor: colors[(colors.indexOf(color) + 1) % colors.length], // Color changed
      dotPositions: [...dots],
    };

    setTargetGlyph(target);
    setChoices([target, dist1, dist2, dist3].sort(() => 0.5 - Math.random()));
    setIsCorrect(null);
    setPhase('sample');

    // Show sample for 2.5s
    setTimeout(() => {
      setPhase('delay');
      // Delay mask for 1.8s
      setTimeout(() => {
        setPhase('choice');
        setStartTime(Date.now());
      }, 1800);
    }, 2500);
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel]);

  const handleSelect = (id: number) => {
    if (phase !== 'choice' || !targetGlyph) return;
    const rt = Date.now() - startTime;
    const correct = id === targetGlyph.id;
    setIsCorrect(correct);
    setPhase('result');

    if (soundEnabled) {
      audioManager.play(correct ? 'success' : 'soft_error');
    }
    onFeedbackGiven(correct, rt);
  };

  const renderGlyph = (g: GlyphPattern, size = 110) => {
    const center = size / 2;
    const radius = size * 0.35;

    return (
      <svg width={size} height={size} className="mx-auto">
        {/* Outer Ring */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        {/* Center Node */}
        <circle cx={center} cy={center} r={size * 0.16} fill={g.centerColor} className="shadow-md" />
        {/* Perimeter Dots */}
        {g.dotPositions.map((pos, idx) => {
          const angle = (pos * (360 / 8) - 90) * (Math.PI / 180);
          const cx = center + radius * Math.cos(angle);
          const cy = center + radius * Math.sin(angle);
          return <circle key={idx} cx={cx} cy={cy} r={size * 0.08} fill={g.centerColor} stroke="#ffffff" strokeWidth="1.5" />;
        })}
      </svg>
    );
  };

if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'התאמה לדגם מושהה' : 'Delayed Match to Sample'}
        scientificProtocol="Delayed Non-Match / Match to Sample (DMTS)"
        instructions={
          language === 'he'
            ? `הביטו היטב בדגם הסמלים המוצג במרכז. לאחר מספר שניות של השהיה והסוואה, זהו את הדגם המקורי המדויק מבין 4 האפשרויות.`
            : `Observe the sample glyph pattern. After a brief masked delay, choose the exact original pattern among 4 options.`
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
          <Layers className="text-pink-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'התאמה לדגם מושהה' : 'Delayed Match to Sample'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
        </span>
      </div>

      {phase === 'sample' && targetGlyph && (
        <div className="text-center py-6">
          <div className="py-2 px-4 mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold rounded-lg animate-pulse">
            {language === 'he' ? '👀 שננו את הדגם המקורי...' : '👀 Memorize the sample pattern...'}
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl inline-block border-2 border-pink-400">
            {renderGlyph(targetGlyph, 140)}
          </div>
        </div>
      )}

      {phase === 'delay' && (
        <div className="text-center py-16">
          <div className="inline-block p-6 rounded-full bg-slate-100 dark:bg-slate-700 animate-spin">
            <Layers className="w-10 h-10 text-pink-500" />
          </div>
          <span className="block mt-4 text-sm font-bold text-slate-400">
            {language === 'he' ? 'שמרו את הדגם בזיכרון...' : 'Holding pattern in memory...'}
          </span>
        </div>
      )}

      {phase === 'choice' && (
        <div>
          <div className="text-center py-2 px-4 mb-4 bg-pink-500/10 border border-pink-500/30 text-pink-700 dark:text-pink-300 font-bold rounded-lg">
            {language === 'he' ? 'איזה מבין הדגמים הבאים הוא הדגם המקורי?' : 'Which of the following is the original pattern?'}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {choices.map((c, i) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className="p-3 bg-white dark:bg-slate-700/50 rounded-2xl border-2 border-slate-200 dark:border-slate-600 hover:border-pink-500 hover:scale-105 transition-all shadow-md flex flex-col items-center"
              >
                <span className="text-xs font-bold text-slate-400 mb-1">#{i + 1}</span>
                {renderGlyph(c, 100)}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && targetGlyph && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl flex items-center justify-between ${
            isCorrect ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-600 dark:text-emerald-300' :
            'bg-amber-500/15 border border-amber-500 text-amber-600 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-2 font-bold text-lg">
              {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              <span>
                {isCorrect
                  ? (language === 'he' ? 'זיהוי מבריק ומדויק!' : 'Brilliant recognition!')
                  : (language === 'he' ? 'הדגם שנבחר היה שונה במעט' : 'The selected pattern differed slightly')}
              </span>
            </div>
            <button
              onClick={initRound}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
            >
              <RotateCcw className="w-4 h-4" />
              {language === 'he' ? 'הבא' : 'Next'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-xs font-bold text-slate-500 block mb-1">
              {language === 'he' ? 'הדגם המקורי הנכון:' : 'Original Target Pattern:'}
            </span>
            <div className="inline-block p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-emerald-400">
              {renderGlyph(targetGlyph, 110)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
