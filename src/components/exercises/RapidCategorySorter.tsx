import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, Sliders } from 'lucide-react';

interface RapidCategorySorterProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface ItemToClassify {
  id: string;
  name: { he: string; en: string };
  category: 'living' | 'inanimate';
  emoji: string;
}

const ITEMS: ItemToClassify[] = [
  { id: '1', name: { he: 'דולפין', en: 'Dolphin' }, category: 'living', emoji: '🐬' },
  { id: '2', name: { he: 'מזלג', en: 'Fork' }, category: 'inanimate', emoji: '🍴' },
  { id: '3', name: { he: 'אלון', en: 'Oak Tree' }, category: 'living', emoji: '🌳' },
  { id: '4', name: { he: 'טלפון', en: 'Telephone' }, category: 'inanimate', emoji: '☎️' },
  { id: '5', name: { he: 'נשר', en: 'Eagle' }, category: 'living', emoji: '🦅' },
  { id: '6', name: { he: 'ספה', en: 'Sofa' }, category: 'inanimate', emoji: '🛋️' },
  { id: '7', name: { he: 'פרפר', en: 'Butterfly' }, category: 'living', emoji: '🦋' },
  { id: '8', name: { he: 'שעון', en: 'Clock' }, category: 'inanimate', emoji: '⏰' },
  { id: '9', name: { he: 'סוס', en: 'Horse' }, category: 'living', emoji: '🐎' },
  { id: '10', name: { he: 'מחברת', en: 'Notebook' }, category: 'inanimate', emoji: '📓' },
  { id: '11', name: { he: 'צב', en: 'Turtle' }, category: 'living', emoji: '🐢' },
  { id: '12', name: { he: 'גיטרה', en: 'Guitar' }, category: 'inanimate', emoji: '🎸' },
];

export const RapidCategorySorter: React.FC<RapidCategorySorterProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const totalTrials = 10 + clampedLevel;
  const timeoutMs = Math.max(1200, 2400 - clampedLevel * 100);

  const [isReady, setIsReady] = useState(false);
  const [trialIdx, setTrialIdx] = useState<number>(0);
  const [currentItem, setCurrentItem] = useState<ItemToClassify | null>(null);
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

    const picked = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    setCurrentItem(picked);
    setTrialIdx(nextIdx);
    setProgressPercent(100);
    startTimeRef.current = Date.now();

    // Visual countdown bar
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

    // Timeout
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // Timeout counts as miss
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

  const handleClassify = (cat: 'living' | 'inanimate') => {
    if (!currentItem || isFinished) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    const rt = Date.now() - startTimeRef.current;
    const isCorrect = currentItem.category === cat;

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

    const pass = correctHits >= Math.floor(totalTrials * 0.75);
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
        title={language === 'he' ? 'מיון בזק קטגוריאלי' : 'Rapid Category Sorter'}
        scientificProtocol="Rapid Visual Categorization (Thorpe, 1996)"
        instructions={
          language === 'he'
            ? `סווגו בשבריר שנייה את הפריט המופיע במרכז: האם הוא 'חי / צומח' 🌿 או 'דומם' 🧱? פעלו במהירות לפני שפס הזמן יסתיים!`
            : `Classify the item in the center in a fraction of a second: is it 'Living' 🌿 or 'Inanimate' 🧱? Respond swiftly before the timer bar depletes!`
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
          <Sliders className="text-orange-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'מיון בזק קטגוריאלי' : 'Rapid Category Sorter'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 rounded-full">
          {language === 'he' ? `פריט ${trialIdx + 1}/${totalTrials}` : `Item ${trialIdx + 1}/${totalTrials}`}
        </span>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Timer Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full transition-all duration-75 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Central Item Display */}
          {currentItem && (
            <div className="h-44 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-inner">
              <span className="text-5xl">{currentItem.emoji}</span>
              <span className="text-3xl font-black">{currentItem.name[language]}</span>
            </div>
          )}

          {/* Classification Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleClassify('living')}
              className="py-5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xl rounded-2xl shadow-lg transition-all flex flex-col items-center gap-1 min-h-[64px]"
            >
              <span>🌿</span>
              <span>{language === 'he' ? 'חי / צומח' : 'Living'}</span>
            </button>

            <button
              onClick={() => handleClassify('inanimate')}
              className="py-5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xl rounded-2xl shadow-lg transition-all flex flex-col items-center gap-1 min-h-[64px]"
            >
              <span>🧱</span>
              <span>{language === 'he' ? 'דומם' : 'Inanimate'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 py-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-bold">
            {language === 'he' ? 'מיון הבזק הושלם!' : 'Rapid Sorting Complete!'}
          </h3>
          <p className="text-slate-500 font-medium">
            {language === 'he'
              ? `דייקתם ב-${correctHits} מתוך ${totalTrials} פריטים במהירות שיא.`
              : `Categorized ${correctHits} of ${totalTrials} items with lightning speed.`}
          </p>
          <button
            onClick={initRound}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow"
          >
            {language === 'he' ? 'בצעו שוב' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
};
