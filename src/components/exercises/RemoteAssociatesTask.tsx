import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';

interface RemoteAssociatesTaskProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface RatProblem {
  triad: { he: string[]; en: string[] };
  solution: { he: string; en: string };
  distractors: { he: string[]; en: string[] };
}

const RAT_PROBLEMS: RatProblem[] = [
  {
    triad: { he: ['קרח', 'שלג', 'גבוה'], en: ['Ice', 'Snow', 'High'] },
    solution: { he: 'הר', en: 'Mountain' },
    distractors: { he: ['מים', 'חורף', 'ענן'], en: ['Water', 'Winter', 'Cloud'] },
  },
  {
    triad: { he: ['שחור', 'חלב', 'בוקר'], en: ['Black', 'Milk', 'Morning'] },
    solution: { he: 'קפה', en: 'Coffee' },
    distractors: { he: ['לחם', 'תה', 'סוכר'], en: ['Bread', 'Tea', 'Sugar'] },
  },
  {
    triad: { he: ['דלת', 'מנעול', 'סודי'], en: ['Door', 'Lock', 'Secret'] },
    solution: { he: 'מפתח', en: 'Key' },
    distractors: { he: ['קוד', 'חלון', 'קיר'], en: ['Code', 'Window', 'Wall'] },
  },
  {
    triad: { he: ['כחול', 'עמוק', 'מלח'], en: ['Blue', 'Deep', 'Salt'] },
    solution: { he: 'ים', en: 'Sea' },
    distractors: { he: ['דג', 'סירה', 'חוף'], en: ['Fish', 'Boat', 'Beach'] },
  },
  {
    triad: { he: ['זהב', 'כתר', 'ארמון'], en: ['Gold', 'Crown', 'Palace'] },
    solution: { he: 'מלך', en: 'King' },
    distractors: { he: ['יהלום', 'מלכה', 'אוצר'], en: ['Diamond', 'Queen', 'Treasure'] },
  },
  {
    triad: { he: ['זמן', 'מחוג', 'מעורר'], en: ['Time', 'Hand', 'Alarm'] },
    solution: { he: 'שעון', en: 'Clock' },
    distractors: { he: ['יום', 'בוקר', 'צלצול'], en: ['Day', 'Morning', 'Bell'] },
  },
  {
    triad: { he: ['נייר', 'סיפור', 'עמוד'], en: ['Paper', 'Story', 'Page'] },
    solution: { he: 'ספר', en: 'Book' },
    distractors: { he: ['עט', 'מכתב', 'שיר'], en: ['Pen', 'Letter', 'Poem'] },
  },
];

export const RemoteAssociatesTask: React.FC<RemoteAssociatesTaskProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const [isReady, setIsReady] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<RatProblem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    const picked = RAT_PROBLEMS[Math.floor(Math.random() * RAT_PROBLEMS.length)];
    const sol = picked.solution[language];
    const dists = picked.distractors[language];
    const opts = [sol, ...dists].sort(() => 0.5 - Math.random());

    setCurrentProblem(picked);
    setOptions(opts);
    setSelectedWord(null);
    setIsFinished(false);
    setIsCorrect(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel, language]);

  const handleSelect = (word: string) => {
    if (isFinished || !currentProblem) return;
    const rt = Date.now() - startTime;
    setSelectedWord(word);
    const correct = word === currentProblem.solution[language];
    setIsCorrect(correct);
    setIsFinished(true);

    if (soundEnabled) {
      audioManager.play(correct ? 'success' : 'soft_error');
    }
    onFeedbackGiven(correct, rt);
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'מבחן אסוציאציות רחוקות (RAT)' : 'Remote Associates (RAT)'}
        scientificProtocol="Remote Associates Test (Mednick, 1962)"
        instructions={
          language === 'he'
            ? `הביטו בשלוש המילים המוצגות. מצאו את המילה האחת שמקשרת בין כולן ויוצרת עם כל אחת מהן צירוף לשוני או הקשר טבעי.`
            : `Examine the three words displayed. Find the single linking word that associates or forms a compound phrase with all three.`
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
          <Sparkles className="text-amber-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'אסוציאציות רחוקות' : 'Remote Associates'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
        </span>
      </div>

      {currentProblem && (
        <div className="space-y-6">
          {/* Triad Words Card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-center shadow-inner">
            <span className="text-xs font-bold text-slate-400 block mb-4 uppercase tracking-wider">
              {language === 'he' ? 'שלוש מילות הרמז:' : 'Three Clue Words:'}
            </span>
            <div className="flex justify-center gap-3 flex-wrap">
              {currentProblem.triad[language].map((w, i) => (
                <span
                  key={i}
                  className="px-5 py-3 bg-white dark:bg-slate-800 border-2 border-amber-400 rounded-xl text-2xl font-black text-amber-600 dark:text-amber-300 shadow-md"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>

          {isFinished && (
            <div className={`p-4 rounded-xl flex items-center justify-between ${
              isCorrect ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-600 dark:text-emerald-300' :
              'bg-amber-500/15 border border-amber-500 text-amber-600 dark:text-amber-300'
            }`}>
              <div className="flex items-center gap-2 font-bold text-lg">
                {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                <span>
                  {isCorrect
                    ? (language === 'he' ? 'קישור אסוציאטיבי מבריק!' : 'Brilliant associative connection!')
                    : (language === 'he' ? `המילה המקשרת היא: "${currentProblem.solution[language]}"` : `The linking word was: "${currentProblem.solution[language]}"`)}
                </span>
              </div>
              <button
                onClick={initRound}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'he' ? 'הבא' : 'Next'}
              </button>
            </div>
          )}

          {/* Options */}
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2 text-center">
              {language === 'he' ? 'איזו מילה מתחברת לכל השלוש?' : 'Which word connects all three?'}
            </span>
            <div className="grid grid-cols-2 gap-3">
              {options.map((w, idx) => {
                const isSelected = selectedWord === w;
                const isSolution = w === currentProblem.solution[language];

                let border = 'border-slate-300 dark:border-slate-600 hover:border-amber-400';
                if (isFinished) {
                  if (isSolution) border = 'border-emerald-500 ring-2 ring-emerald-400 bg-emerald-50/40 text-emerald-700';
                  else if (isSelected) border = 'border-red-500 ring-2 ring-red-400 bg-red-50/40 text-red-700';
                }

return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(w)}
                    className={`py-4 px-3 bg-white dark:bg-slate-800 rounded-xl border-2 text-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95 min-h-[56px] ${border}`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
