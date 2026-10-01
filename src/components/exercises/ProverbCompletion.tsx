import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, Quote } from 'lucide-react';

interface ProverbCompletionProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface ProverbItem {
  prompt: { he: string; en: string };
  missingAnswer: { he: string; en: string };
  distractors: { he: string[]; en: string[] };
  metaphorMeaning: { he: string; en: string };
}

const PROVERBS: ProverbItem[] = [
  {
    prompt: { he: 'סוף מעשה ב...', en: 'Actions speak louder than...' },
    missingAnswer: { he: 'מחשבה תחילה', en: 'words' },
    distractors: { he: ['מעשה רב', 'שמחה גדולה', 'הצלחה רבה'], en: ['promises', 'intentions', 'thoughts'] },
    metaphorMeaning: { he: 'יש לתכנן ולחשוב היטב לפני שנכנסים לפעולה', en: 'Actual behavior conveys more truth than spoken words' },
  },
  {
    prompt: { he: 'איזהו עשיר? ה...', en: 'A bird in the hand is worth...' },
    missingAnswer: { he: 'שמח בחלקו', en: 'two in the bush' },
    distractors: { he: ['צובר נכסים', 'נותן צדקה', 'ממעט במלאכה'], en: ['three on a branch', 'a golden egg', 'a flying hawk'] },
    metaphorMeaning: { he: 'עושר אמיתי הוא שביעות רצון פנימית והודיה', en: 'Better to hold a secure advantage than risk it for more' },
  },
  {
    prompt: { he: 'הבור ששתית ממנו מים, אל...', en: 'Don\'t count your chickens before...' },
    missingAnswer: { he: 'תזרוק בו אבן', en: 'they hatch' },
    distractors: { he: ['תעזוב אותו', 'תשכח מקורו', 'תסגור פי הבאר'], en: ['they grow feathers', 'the sun sets', 'they lay eggs'] },
    metaphorMeaning: { he: 'הכרת תודה: אין לגמול רעה למקום או לאדם שהיטיב עמך', en: 'Do not anticipate results before they actually materialize' },
  },
  {
    prompt: { he: 'טובים השניים מן ה...', en: 'Two heads are better than...' },
    missingAnswer: { he: 'אחד', en: 'one' },
    distractors: { he: ['רבים', 'כולם', 'השלושה'], en: ['none', 'crowds', 'many'] },
    metaphorMeaning: { he: 'שיתוף פעולה ועזרה הדדית מניבים תוצאה טובה יותר', en: 'Collaborative thinking produces superior outcomes' },
  },
  {
    prompt: { he: 'מים שקטים חודרים...', en: 'Still waters run...' },
    missingAnswer: { he: 'עמוק', en: 'deep' },
    distractors: { he: ['מהר', 'רחוק', 'בסתר'], en: ['slow', 'calm', 'dark'] },
    metaphorMeaning: { he: 'התמדה שקטה וסבלנית משפיעה בעוצמה רבה יותר מרעש', en: 'A calm exterior often conceals deep emotion or intellect' },
  },
];

export const ProverbCompletion: React.FC<ProverbCompletionProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const [isReady, setIsReady] = useState(false);
  const [currentProverb, setCurrentProverb] = useState<ProverbItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    const picked = PROVERBS[Math.floor(Math.random() * PROVERBS.length)];
    const correctAns = picked.missingAnswer[language];
    const dists = picked.distractors[language];
    const opts = [correctAns, ...dists].sort(() => 0.5 - Math.random());

    setCurrentProverb(picked);
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
    if (isFinished || !currentProverb) return;
    const rt = Date.now() - startTime;
    setSelectedWord(word);
    const correct = word === currentProverb.missingAnswer[language];
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
        title={language === 'he' ? 'השלמת פתגמים וניבים' : 'Proverb & Idiom Mastery'}
        scientificProtocol="Gorham Proverbs Test of Abstract Thinking"
        instructions={
          language === 'he'
            ? `קראו את הפתגם או הניב הקלאסי ובחרו את הביטוי המדויק להשלמתו. בסיום יוצג הפירוש המטאפורי העמוק שלו.`
            : `Read the classic proverb and select the accurate completion phrase. Its figurative meaning will be reviewed.`
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
          <Quote className="text-amber-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'השלמת פתגמים' : 'Proverb Completion'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
        </span>
      </div>

      {currentProverb && (
        <div className="space-y-6">
          {/* Proverb Sentence Card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-center shadow-inner">
            <span className="text-xs font-bold text-slate-400 block mb-2">
              {language === 'he' ? 'השלימו את הפתגם:' : 'Complete the proverb:'}
            </span>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100 py-3">
              "{currentProverb.prompt[language]}"
            </div>
          </div>

          {isFinished && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl flex items-center justify-between ${
                isCorrect ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-600 dark:text-emerald-300' :
                'bg-amber-500/15 border border-amber-500 text-amber-600 dark:text-amber-300'
              }`}>
                <div className="flex items-center gap-2 font-bold text-lg">
                  {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  <span>
                    {isCorrect
                      ? (language === 'he' ? 'מדויק לחלוטין!' : 'Exactly right!')
                      : (language === 'he' ? `ההשלמה הנכונה: "${currentProverb.missingAnswer[language]}"` : `The completion is: "${currentProverb.missingAnswer[language]}"`)}
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

              {/* Metaphor explanation */}
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-900 dark:text-indigo-200">
                <span className="font-bold block mb-1">
                  {language === 'he' ? '💡 המשמעות המטאפורית:' : '💡 Metaphorical meaning:'}
                </span>
                {currentProverb.metaphorMeaning[language]}
              </div>
            </div>
          )}

          {/* 4 Choices */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((w, idx) => {
              const isSelected = selectedWord === w;
              const isSolution = w === currentProverb.missingAnswer[language];

              let border = 'border-slate-300 dark:border-slate-600 hover:border-amber-400';
              if (isFinished) {
                if (isSolution) border = 'border-emerald-500 ring-2 ring-emerald-400 bg-emerald-50/40 text-emerald-700';
                else if (isSelected) border = 'border-red-500 ring-2 ring-red-400 bg-red-50/40 text-red-700';
              }

return (
                <button
                  key={idx}
                  onClick={() => handleSelect(w)}
                  className={`py-4 px-3 bg-white dark:bg-slate-800 rounded-xl border-2 text-lg font-bold shadow-sm transition-all hover:scale-105 active:scale-95 min-h-[56px] ${border}`}
                >
                  {w}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
