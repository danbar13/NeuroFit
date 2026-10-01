import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import {
  SEMANTIC_LEVELS,
  type SemanticLevelConfig,
  type SemanticIntruderItem,
} from '../../data/cognitiveLevelsMatrix';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

interface SemanticIntruderProps {
  levelNumber?: number; // 1 - 10
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

export const SemanticIntruder: React.FC<SemanticIntruderProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();

  // Find level configuration
  const config: SemanticLevelConfig =
    SEMANTIC_LEVELS.find((l) => l.level === Math.min(10, Math.max(1, levelNumber))) ||
    SEMANTIC_LEVELS[0];

  const [isReady, setIsReady] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<SemanticIntruderItem>(config.items[0]);
  const [shuffledWords, setShuffledWords] = useState<
    { word: string; isIntruder: boolean; explanation: string }[]
  >([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; themeTitle: string } | null>(null);

  const startTimeRef = useRef<number>(0);

  const setupItem = () => {
    // Pick an item from configuration
    const item = config.items[Math.floor(Math.random() * config.items.length)] || config.items[0];
    setActiveItem(item);

    const wordsList = item.words[language];
    // Shuffle words order
    const shuffled = [...wordsList].sort(() => 0.5 - Math.random());
    setShuffledWords(shuffled);

    setSelectedWord(null);
    setIsRevealed(false);
    setFeedback(null);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    setIsReady(false);
  }, [levelNumber]);

  const handleStartExercise = () => {
    setIsReady(true);
    setupItem();
  };

  const handleWordSelect = (chosenWord: string) => {
    if (isRevealed) return;

    const responseTime = Date.now() - startTimeRef.current;
    setSelectedWord(chosenWord);
    setIsRevealed(true);

    const chosenObj = shuffledWords.find((w) => w.word === chosenWord);
    const intruderObj = shuffledWords.find((w) => w.isIntruder);
    const isCorrect = chosenObj?.isIntruder ?? false;

    if (isCorrect) {
      audioManager.playSuccess(soundEnabled);
      setFeedback({
        isCorrect: true,
        message:
          language === 'he'
            ? `מדויק להפליא! "${chosenWord}" הוא אכן יוצא הדופן. ${chosenObj?.explanation}`
            : `Brilliant! "${chosenWord}" is indeed the intruder. ${chosenObj?.explanation}`,
        themeTitle: activeItem.categoryTheme[language],
      });
    } else {
      audioManager.playGentleChime(soundEnabled);
      setFeedback({
        isCorrect: false,
        message:
          language === 'he'
            ? `יוצא הדופן הנכון היה "${intruderObj?.word}". הסבר: ${intruderObj?.explanation}`
            : `The correct intruder was "${intruderObj?.word}". Explanation: ${intruderObj?.explanation}`,
        themeTitle: activeItem.categoryTheme[language],
      });
    }
    onFeedbackGiven(isCorrect, responseTime);
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        title={language === 'he' ? 'יוצא הדופן המושגי (שפה ושליפה)' : 'Semantic Intruder - Concept Exclusion'}
        categoryName={language === 'he' ? 'שפה ושליפה מילולית' : 'Language & Semantics'}
        levelNumber={config.level}
        instructions={
          language === 'he'
            ? 'לפניכם יוצגו 5 מושגים. ארבעה מהם חולקים מכנה משותף עמוק ומוגדר היטב. מושג אחד בלבד אינו שייך. זהו את יוצא הדופן!'
            : 'Five concepts will appear. Four share a nuanced defining domain. Exactly one does not belong. Identify the intruder!'
        }
        scientificTip={
          language === 'he'
            ? 'תרגיל יוצא הדופן מאמן חשיבה קטגוריאלית מופשטת, שליפה סמנטית עמוקה ועיכוב תגובה אימפולסיבית.'
            : 'Concept exclusion stimulates abstract categorical reasoning and deep semantic retrieval.'
        }
        onStart={handleStartExercise}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-2">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-2 flex items-center justify-center gap-2">
          <span>{language === 'he' ? 'יוצא הדופן המושגי (סמנטיקה)' : 'Semantic Intruder - Concept Exclusion'}</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
            }`}
          >
            {language === 'he' ? `רמה ${config.level}` : `Level ${config.level}`}
          </span>
        </h2>
        <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          {language === 'he'
            ? 'ארבעה מושגים חולקים מכנה משותף עמוק ומוגדר היטב. מושג אחד בלבד אינו שייך לקבוצה זו. זהו אותו!'
            : 'Four concepts share a well-defined conceptual domain. Exactly one concept does NOT belong. Identify it!'}
        </p>
      </div>

      {/* Words List Options */}
      <div className="w-full max-w-xl space-y-3">
        {shuffledWords.map((item, idx) => {
          const isSelected = selectedWord === item.word;
          const isIntruder = item.isIntruder;

          let btnStyle = '';
          if (isRevealed) {
            if (isIntruder) {
              btnStyle = highContrast
                ? 'bg-yellow-400 text-black border-4 border-white font-black'
                : 'bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
            } else if (isSelected && !isIntruder) {
              btnStyle = highContrast
                ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                : 'bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 text-rose-800 dark:text-rose-300';
            } else {
              btnStyle = 'opacity-40';
            }
          } else {
            btnStyle = highContrast
              ? 'bg-black border-2 border-yellow-400 text-white hover:bg-yellow-400 hover:text-black'
              : theme === 'dark'
              ? 'bg-slate-800 border-2 border-slate-700 text-white hover:border-primary-500 hover:bg-slate-750'
              : 'bg-white border-2 border-slate-200 text-slate-900 hover:border-primary-500 hover:bg-primary-50/50 shadow-sm';
          }

          return (
            <button
              key={idx}
              onClick={() => handleWordSelect(item.word)}
              disabled={isRevealed}
              className={`w-full p-5 rounded-2xl text-xl sm:text-2xl font-bold flex items-center justify-between transition-all transform active:scale-98 ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border opacity-75">
                  {idx + 1}
                </span>
                <span>{item.word}</span>
              </div>

              {isRevealed && isIntruder && (
                <span className="text-sm font-black px-3 py-1 rounded-full bg-emerald-500 text-white">
                  {language === 'he' ? 'יוצא הדופן' : 'The Intruder'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Result Explanation Card */}
      {feedback && (
        <div
          className={`mt-6 w-full max-w-xl p-6 rounded-3xl border-2 transition-all ${
            feedback.isCorrect
              ? highContrast
                ? 'bg-yellow-950/60 border-yellow-400 text-yellow-300'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-950 dark:text-emerald-100'
              : highContrast
              ? 'bg-zinc-900 border-zinc-500 text-white'
              : 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 text-blue-950 dark:text-blue-100'
          }`}
        >
          <div className="flex items-start gap-4">
            {feedback.isCorrect ? (
              <CheckCircle2 className="w-8 h-8 shrink-0 text-emerald-500 mt-1" />
            ) : (
              <AlertCircle className="w-8 h-8 shrink-0 text-blue-400 mt-1" />
            )}
            <div className="flex-1 space-y-2">
              <div className="font-extrabold text-xl text-primary-700 dark:text-primary-300">
                {language === 'he' ? `המכנה המשותף: ${feedback.themeTitle}` : `Common Theme: ${feedback.themeTitle}`}
              </div>
              <p className="text-lg leading-relaxed">{feedback.message}</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={setupItem}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                highContrast ? 'bg-yellow-400 text-black' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'he' ? 'שאלה הבאה' : 'Next Question'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
