import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, Binary } from 'lucide-react';

interface LetterNumberSequencingProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'];
const ENGLISH_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export const LetterNumberSequencing: React.FC<LetterNumberSequencingProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  // Sequence length: 3 items for level 1, up to 7 items for level 10
  const seqLength = Math.min(7, 3 + Math.floor(clampedLevel / 2.5));
  const numDigits = Math.floor(seqLength / 2);
  const numLetters = seqLength - numDigits;

  const [isReady, setIsReady] = useState(false);
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'result'>('memorize');
  const [presentedSequence, setPresentedSequence] = useState<string[]>([]);
  const [expectedSequence, setExpectedSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [availablePool, setAvailablePool] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    // Generate distinct digits
    const digits: number[] = [];
    while (digits.length < numDigits) {
      const d = Math.floor(Math.random() * 9) + 1;
      if (!digits.includes(d)) digits.push(d);
    }
    const digitStrs = digits.map(String);

    // Generate distinct letters
    const alphabet = language === 'he' ? HEBREW_LETTERS : ENGLISH_LETTERS;
    const letterIndices: number[] = [];
    while (letterIndices.length < numLetters) {
      const idx = Math.floor(Math.random() * alphabet.length);
      if (!letterIndices.includes(idx)) letterIndices.push(idx);
    }
    const letterStrs = letterIndices.map(i => alphabet[i]);

    // Expected order: numbers ascending, then letters alphabetically
    const sortedDigits = [...digitStrs].sort((a, b) => Number(a) - Number(b));
    const sortedLetters = [...letterStrs].sort((a, b) => alphabet.indexOf(a) - alphabet.indexOf(b));
    const expected = [...sortedDigits, ...sortedLetters];

    // Presented sequence: scrambled mixed together
    const mixed = [...digitStrs, ...letterStrs].sort(() => 0.5 - Math.random());

    setPresentedSequence(mixed);
    setExpectedSequence(expected);
    setAvailablePool([...mixed].sort(() => 0.5 - Math.random()));
    setUserSequence([]);
    setIsCorrect(null);
    setPhase('memorize');

    const viewTime = Math.max(3000, 4500 - clampedLevel * 100);
    setTimeout(() => {
      setPhase('recall');
      setStartTime(Date.now());
    }, viewTime);
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel, language]);

  const handlePick = (item: string, poolIndex: number) => {
    if (phase !== 'recall') return;
    if (soundEnabled) audioManager.play('click');

    const nextUser = [...userSequence, item];
    const nextPool = availablePool.filter((_, i) => i !== poolIndex);
    setUserSequence(nextUser);
    setAvailablePool(nextPool);

    if (nextUser.length === expectedSequence.length) {
      const rt = Date.now() - startTime;
      const match = nextUser.every((val, i) => val === expectedSequence[i]);
      setIsCorrect(match);
      setPhase('result');
      if (soundEnabled) {
        audioManager.play(match ? 'success' : 'soft_error');
      }
      onFeedbackGiven(match, rt);
    }
  };

  const handleResetCurrent = () => {
    setUserSequence([]);
    setAvailablePool([...presentedSequence].sort(() => 0.5 - Math.random()));
  };

if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'סידור אותיות ומספרים' : 'Letter-Number Sequencing'}
        scientificProtocol="WAIS-IV Working Memory Index"
        instructions={
          language === 'he'
            ? `הביטו ברצף המעורב של ספרות ואותיות. לאחר שייעלם, סדרו אותם בזיכרון: קודם כל הספרות בסדר עולה (1, 2, 3...), ואחריהן האותיות לפי סדר האלפבית (א, ב, ג...).`
            : `Observe the mixed sequence of letters and numbers. Reorder them from memory: first numbers in ascending order (1, 2, 3...), followed by letters in alphabetical order (A, B, C...).`
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
          <Binary className="text-cyan-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'סידור אותיות ומספרים' : 'Letter-Number Sequencing'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel} | ${seqLength} איברים` : `Level ${clampedLevel} | ${seqLength} items`}
        </span>
      </div>

      {phase === 'memorize' && (
        <div className="text-center py-4">
          <div className="py-2 px-4 mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold rounded-lg animate-pulse">
            {language === 'he' ? '👀 שננו את האיברים המוצגים...' : '👀 Memorize the presented items...'}
          </div>
          <div className="flex justify-center gap-3">
            {presentedSequence.map((item, idx) => (
              <span
                key={idx}
                className="w-14 h-16 rounded-xl bg-cyan-600 text-white text-3xl font-black flex items-center justify-center shadow-lg"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {phase === 'recall' && (
        <div className="space-y-6">
          <div className="text-center py-2 px-4 bg-cyan-500/10 border border-cyan-500/30 text-cyan-800 dark:text-cyan-200 font-bold rounded-lg text-sm">
            {language === 'he'
              ? 'לחצו על האיברים בסדר הנכון: קודם מספרים עולים, אח"כ אותיות'
              : 'Select items in correct order: Numbers ascending first, then Letters'}
          </div>

          {/* User Answer Slots */}
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2 text-center">
              {language === 'he' ? 'הרצף שלכם:' : 'Your Sequence:'}
            </span>
            <div className="flex justify-center gap-2 min-h-[64px]">
              {Array.from({ length: expectedSequence.length }).map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold ${
                    userSequence[i]
                      ? 'bg-cyan-600 text-white border-cyan-700 shadow'
                      : 'border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-400'
                  }`}
                >
                  {userSequence[i] || ''}
                </div>
              ))}
            </div>
          </div>

          {/* Available Bank */}
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2 text-center">
              {language === 'he' ? 'מאגר האיברים (בחרו בזה אחר זה):' : 'Available Pool (tap one by one):'}
            </span>
            <div className="flex justify-center gap-3 flex-wrap">
              {availablePool.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePick(item, idx)}
                  className="w-14 h-14 rounded-xl bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-500 hover:border-cyan-500 hover:scale-105 active:scale-95 text-2xl font-bold shadow-md transition-all flex items-center justify-center min-h-[56px]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {userSequence.length > 0 && (
            <div className="text-center">
              <button
                onClick={handleResetCurrent}
                className="text-xs text-slate-500 hover:text-cyan-600 underline font-semibold"
              >
                {language === 'he' ? 'איפוס בחירה' : 'Reset Selection'}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'result' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl flex items-center justify-between ${
            isCorrect ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-600 dark:text-emerald-300' :
            'bg-amber-500/15 border border-amber-500 text-amber-600 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-2 font-bold text-lg">
              {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              <span>
                {isCorrect
                  ? (language === 'he' ? 'מעולה! סידור מושלם בזיכרון!' : 'Excellent! Perfect sequence sorting!')
                  : (language === 'he' ? 'סדר האיברים לא תאם במדויק' : 'Sequence order was mismatched')}
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

          <div className="text-center">
            <span className="text-xs font-bold text-slate-500 block mb-1">
              {language === 'he' ? 'הרצף הנכון לפי החוק:' : 'Correct Sorted Sequence:'}
            </span>
            <div className="flex justify-center gap-2">
              {expectedSequence.map((item, idx) => (
                <span
                  key={idx}
                  className="w-10 h-12 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shadow"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
