import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, Split } from 'lucide-react';

interface DividedAttentionProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

export const DividedAttention: React.FC<DividedAttentionProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const totalCycles = 8 + clampedLevel;
  const cycleTimeMs = Math.max(1800, 2800 - clampedLevel * 80);

  const [isReady, setIsReady] = useState(false);
  const [cycleIndex, setCycleIndex] = useState<number>(0);
  const [currentColor, setCurrentColor] = useState<'blue' | 'purple' | 'gold'>('blue');
  const [currentNum, setCurrentNum] = useState<number>(3);
  const [colorResponded, setColorResponded] = useState<boolean>(false);
  const [numResponded, setNumResponded] = useState<boolean>(false);
  const [score, setScore] = useState<{ colorHits: number; numHits: number; mistakes: number }>({
    colorHits: 0,
    numHits: 0,
    mistakes: 0,
  });
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startNextCycle = (idx: number) => {
    if (idx >= totalCycles) {
      setIsFinished(true);
      const totalHits = score.colorHits + score.numHits;
      const pass = totalHits >= 4 && score.mistakes <= 3;
      onFeedbackGiven(pass, 1200);
      if (soundEnabled) audioManager.play(pass ? 'success' : 'soft_error');
      return;
    }

    setCycleIndex(idx);
    setColorResponded(false);
    setNumResponded(false);

    // Pick random color: 35% gold target
    const isGold = Math.random() < 0.35;
    const col: 'blue' | 'purple' | 'gold' = isGold ? 'gold' : (Math.random() < 0.5 ? 'blue' : 'purple');
    setCurrentColor(col);

    // Pick random number: 40% even target
    const isEven = Math.random() < 0.4;
    const num = isEven ? [2, 4, 6, 8][Math.floor(Math.random() * 4)] : [1, 3, 5, 7, 9][Math.floor(Math.random() * 5)];
    setCurrentNum(num);

    timerRef.current = setTimeout(() => {
      startNextCycle(idx + 1);
    }, cycleTimeMs);
  };

  useEffect(() => {
    if (isReady) {
      startNextCycle(0);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isReady, clampedLevel]);

  const handleColorPress = () => {
    if (colorResponded || isFinished) return;
    setColorResponded(true);

    if (currentColor === 'gold') {
      if (soundEnabled) audioManager.play('click');
      setScore(s => ({ ...s, colorHits: s.colorHits + 1 }));
    } else {
      if (soundEnabled) audioManager.play('soft_error');
      setScore(s => ({ ...s, mistakes: s.mistakes + 1 }));
    }
  };

  const handleNumPress = () => {
    if (numResponded || isFinished) return;
    setNumResponded(true);

    if (currentNum % 2 === 0) {
      if (soundEnabled) audioManager.play('click');
      setScore(s => ({ ...s, numHits: s.numHits + 1 }));
    } else {
      if (soundEnabled) audioManager.play('soft_error');
      setScore(s => ({ ...s, mistakes: s.mistakes + 1 }));
    }
  };

if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'קשב מפוצל דו-ערוצי' : 'Dual-Task Divided Attention'}
        scientificProtocol="Dual-Task Attention Paradigm (Kahneman)"
        instructions={
          language === 'he'
            ? `עקבו בו-זמנית אחר שני ערוצים: למעלה – לחצו "זהב!" בכל פעם שהכוכב זוהר בצהוב/זהב; למטה – לחצו "זוגי!" בכל פעם שהמספר המוצג הוא זוגי (2, 4, 6, 8).`
            : `Track two channels at once: Top – tap "Gold!" whenever the star turns gold; Bottom – tap "Even!" whenever the number shown is even.`
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
          <Split className="text-purple-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'קשב מפוצל דו-ערוצי' : 'Divided Attention'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-full">
          {language === 'he' ? `סבב ${cycleIndex + 1}/${totalCycles}` : `Cycle ${cycleIndex + 1}/${totalCycles}`}
        </span>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Channel 1: Visual Star Color */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-md transition-colors"
                style={{
                  backgroundColor:
                    currentColor === 'gold' ? '#eab308' :
                    currentColor === 'blue' ? '#3b82f6' : '#a855f7',
                }}
              >
                ★
              </div>
              <span className="text-sm font-bold text-slate-500">
                {language === 'he' ? 'ערוץ חזותי (צבע כוכב)' : 'Visual Star Color'}
              </span>
            </div>
            <button
              onClick={handleColorPress}
              disabled={colorResponded}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all text-base min-h-[56px]"
            >
              {language === 'he' ? '🌟 זהב!' : '🌟 Gold!'}
            </button>
          </div>

          {/* Channel 2: Numeric Parity */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-md">
                {currentNum}
              </div>
              <span className="text-sm font-bold text-slate-500">
                {language === 'he' ? 'ערוץ מספרי (זוגי / אי-זוגי)' : 'Number Parity'}
              </span>
            </div>
            <button
              onClick={handleNumPress}
              disabled={numResponded}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all text-base min-h-[56px]"
            >
              {language === 'he' ? '🔢 זוגי!' : '🔢 Even!'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 text-center py-4">
          <div className="p-6 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border-2 border-purple-400">
            <CheckCircle2 className="w-12 h-12 text-purple-500 mx-auto mb-2" />
            <h3 className="text-xl font-bold mb-4">
              {language === 'he' ? 'סיכום ביצועי קשב מפוצל' : 'Divided Attention Summary'}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <span className="block text-slate-400">{language === 'he' ? 'זיהויי זהב' : 'Gold Hits'}</span>
                <span className="text-2xl font-bold text-amber-600">{score.colorHits}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <span className="block text-slate-400">{language === 'he' ? 'זיהויי זוגי' : 'Even Hits'}</span>
                <span className="text-2xl font-bold text-indigo-600">{score.numHits}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => startNextCycle(0)}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            {language === 'he' ? 'בצעו שוב' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
};
