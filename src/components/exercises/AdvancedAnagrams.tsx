import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, SpellCheck, Lightbulb } from 'lucide-react';

interface AdvancedAnagramsProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface AnagramWord {
  word: { he: string; en: string };
  hint: { he: string; en: string };
}

const ANAGRAMS: AnagramWord[] = [
  { word: { he: 'סבלנות', en: 'PATIENCE' }, hint: { he: 'יכולת איפוק והמתנה רגועה', en: 'Ability to endure waiting calmly' } },
  { word: { he: 'סקרנות', en: 'CURIOSITY' }, hint: { he: 'רצון עז לחקור ולדעת דברים חדשים', en: 'Desire to learn and investigate' } },
  { word: { he: 'נוסטלגיה', en: 'NOSTALGIA' }, hint: { he: 'געגוע מתוק אל העבר', en: 'Sentimental longing for the past' } },
  { word: { he: 'יצירתיות', en: 'CREATIVITY' }, hint: { he: 'כושר המצאה וחשיבה מקורית', en: 'Ability to generate novel ideas' } },
  { word: { he: 'מנהיגות', en: 'LEADERSHIP' }, hint: { he: 'הובלת קבוצה להשגת מטרה משותפת', en: 'Guidance and steering of a group' } },
  { word: { he: 'תקווה', en: 'HOPE' }, hint: { he: 'ציפייה ואמונה בעתיד חיובי', en: 'Optimistic expectation of the future' } },
];

export const AdvancedAnagrams: React.FC<AdvancedAnagramsProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const [isReady, setIsReady] = useState(false);
  const [targetWord, setTargetWord] = useState<string>('');
  const [hintText, setHintText] = useState<string>('');
  const [availableTiles, setAvailableTiles] = useState<{ id: number; letter: string }[]>([]);
  const [userLetters, setUserLetters] = useState<{ id: number; letter: string }[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    const item = ANAGRAMS[Math.floor(Math.random() * ANAGRAMS.length)];
    const word = item.word[language].toUpperCase();
    const letters = word.split('').map((l, i) => ({ id: i, letter: l }));

    // Shuffle letters ensuring not exact same
    let scrambled = [...letters].sort(() => 0.5 - Math.random());
    while (scrambled.map(s => s.letter).join('') === word && word.length > 2) {
      scrambled = [...letters].sort(() => 0.5 - Math.random());
    }

    setTargetWord(word);
    setHintText(item.hint[language]);
    setAvailableTiles(scrambled);
    setUserLetters([]);
    setIsFinished(false);
    setIsCorrect(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel, language]);

  const handleTilePick = (tile: { id: number; letter: string }) => {
    if (isFinished) return;
    if (soundEnabled) audioManager.play('click');

    const nextUser = [...userLetters, tile];
    const nextAvail = availableTiles.filter(t => t.id !== tile.id);
    setUserLetters(nextUser);
    setAvailableTiles(nextAvail);

    // If word is fully filled
    if (nextUser.length === targetWord.length) {
      const rt = Date.now() - startTime;
      const assembled = nextUser.map(t => t.letter).join('');
      const correct = assembled === targetWord;

      setIsCorrect(correct);
      setIsFinished(true);

      if (soundEnabled) {
        audioManager.play(correct ? 'success' : 'soft_error');
      }
      onFeedbackGiven(correct, rt);
    }
  };

  const handleResetLetters = () => {
    if (isFinished) return;
    setAvailableTiles([...userLetters, ...availableTiles].sort(() => 0.5 - Math.random()));
    setUserLetters([]);
  };

if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'פענוח אנגרמות מתקדם' : 'Advanced Lexical Anagrams'}
        scientificProtocol="Lexical Access & Orthographic Working Memory"
        instructions={
          language === 'he'
            ? `סדרו את האותיות המבולבלות כדי להרכיב את המילה הנכונה. תוכלו להיעזר ברמז המושגי המופיע בראש המסך.`
            : `Unscramble the letters to form the target vocabulary word. Use the conceptual hint at the top for guidance.`
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
          <SpellCheck className="text-pink-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'פענוח אנגרמות' : 'Advanced Anagrams'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
        </span>
      </div>

      {/* Conceptual Hint Banner */}
      <div className="flex items-center gap-2 py-3 px-4 mb-4 bg-pink-50 dark:bg-pink-950/40 border border-pink-300 rounded-xl text-pink-800 dark:text-pink-200">
        <Lightbulb className="w-5 h-5 flex-shrink-0 text-amber-500" />
        <span className="text-sm font-semibold">
          {language === 'he' ? `רמז: ${hintText}` : `Hint: ${hintText}`}
        </span>
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
                ? (language === 'he' ? 'פענוח לשוני מבריק!' : 'Brilliant lexical solution!')
                : (language === 'he' ? `המילה הייתה: "${targetWord}"` : `The word was: "${targetWord}"`)}
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
      )}

      {/* Word Slots */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-slate-400 block mb-2 text-center">
            {language === 'he' ? 'המילה המורכבת:' : 'Constructed Word:'}
          </span>
          <div className="flex justify-center gap-2 min-h-[64px]">
            {Array.from({ length: targetWord.length }).map((_, i) => (
              <div
                key={i}
                className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black ${
                  userLetters[i]
                    ? 'bg-pink-600 text-white border-pink-700 shadow-md'
                    : 'border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-300'
                }`}
              >
                {userLetters[i]?.letter || ''}
              </div>
            ))}
          </div>
        </div>

        {/* Available Scrambled Tiles */}
        <div>
          <span className="text-xs font-bold text-slate-400 block mb-2 text-center">
            {language === 'he' ? 'מאגר האותיות (לחצו לפי הסדר):' : 'Available Letters (tap in order):'}
          </span>
          <div className="flex justify-center gap-2 flex-wrap">
            {availableTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => handleTilePick(tile)}
                className="w-14 h-14 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-pink-500 hover:scale-105 active:scale-95 text-2xl font-black rounded-xl shadow-md transition-all flex items-center justify-center min-h-[56px]"
              >
                {tile.letter}
              </button>
            ))}
          </div>
        </div>

        {userLetters.length > 0 && !isFinished && (
          <div className="text-center">
            <button
              onClick={handleResetLetters}
              className="text-xs text-slate-500 hover:text-pink-600 font-semibold underline"
            >
              {language === 'he' ? 'איפוס אותיות' : 'Reset Letters'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
