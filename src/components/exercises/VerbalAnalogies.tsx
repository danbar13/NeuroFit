import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, ArrowRight } from 'lucide-react';

interface VerbalAnalogiesProps {
  levelNumber?: number; // 1 - 10
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface AnalogyItem {
  a: { he: string; en: string };
  b: { he: string; en: string };
  c: { he: string; en: string };
  correct: { he: string; en: string };
  distractors: { he: string; en: string }[];
  relationExplanation: { he: string; en: string };
}

// 10 Progressive Analogy levels
const ANALOGIES_POOL: AnalogyItem[] = [
  // Level 1: Functional everyday object
  {
    a: { he: 'עיפרון', en: 'Pencil' },
    b: { he: 'לכתוב', en: 'Write' },
    c: { he: 'מספריים', en: 'Scissors' },
    correct: { he: 'לגזור', en: 'Cut' },
    distractors: [
      { he: 'לצבוע', en: 'Color' },
      { he: 'נייר', en: 'Paper' },
      { he: 'סרגל', en: 'Ruler' },
    ],
    relationExplanation: {
      he: 'עיפרון משמש לכתיבה, ומספריים משמשים לגזירה (כלי והפעולה שלו).',
      en: 'A pencil is used to write, scissors are used to cut.',
    },
  },
  // Level 2: Part to whole
  {
    a: { he: 'עלה', en: 'Leaf' },
    b: { he: 'עץ', en: 'Tree' },
    c: { he: 'גלגל', en: 'Wheel' },
    correct: { he: 'מכונית', en: 'Car' },
    distractors: [
      { he: 'כביש', en: 'Road' },
      { he: 'גומי', en: 'Rubber' },
      { he: 'מנוע', en: 'Engine' },
    ],
    relationExplanation: {
      he: 'עלה הוא חלק מן העץ, כשם שגלגל הוא חלק מן המכונית (חלק אל השלם).',
      en: 'A leaf is part of a tree, as a wheel is part of a car.',
    },
  },
  // Level 3: Producer to product
  {
    a: { he: 'דבורה', en: 'Bee' },
    b: { he: 'דבש', en: 'Honey' },
    c: { he: 'פרה', en: 'Cow' },
    correct: { he: 'חלב', en: 'Milk' },
    distractors: [
      { he: 'עשב', en: 'Grass' },
      { he: 'רפת', en: 'Barn' },
      { he: 'בשר', en: 'Meat' },
    ],
    relationExplanation: {
      he: 'דבורה מייצרת דבש, ופרה מניבה חלב (יצרן והתוצר הטבעי שלו).',
      en: 'A bee produces honey, as a cow produces milk.',
    },
  },
  // Level 4: Environment & Medium
  {
    a: { he: 'דג', en: 'Fish' },
    b: { he: 'מים', en: 'Water' },
    c: { he: 'ציפור', en: 'Bird' },
    correct: { he: 'אוויר', en: 'Air' },
    distractors: [
      { he: 'קן', en: 'Nest' },
      { he: 'שמיים', en: 'Sky' },
      { he: 'עץ', en: 'Tree' },
    ],
    relationExplanation: {
      he: 'דג נע בתוך המים, וציפור מעופפת בתוך האוויר (בעל חיים ותווך התנועה).',
      en: 'A fish moves through water, as a bird moves through air.',
    },
  },
  // Level 5: Cause and effect
  {
    a: { he: 'חום', en: 'Heat' },
    b: { he: 'התפשטות', en: 'Expansion' },
    c: { he: 'קור', en: 'Cold' },
    correct: { he: 'התכווצות', en: 'Contraction' },
    distractors: [
      { he: 'שלג', en: 'Snow' },
      { he: 'רוח', en: 'Wind' },
      { he: 'קיפאון', en: 'Freezing' },
    ],
    relationExplanation: {
      he: 'חום גורם להתפשטות חומר, בעוד שקור גורם להתכווצות (חוק פיזיקלי של סיבה ותוצאה).',
      en: 'Heat causes expansion, cold causes contraction.',
    },
  },
  // Level 6: Specialist & Study Subject
  {
    a: { he: 'בוטנאי', en: 'Botanist' },
    b: { he: 'צמחים', en: 'Plants' },
    c: { he: 'אורניתולוג', en: 'Ornithologist' },
    correct: { he: 'ציפורים', en: 'Birds' },
    distractors: [
      { he: 'מאובנים', en: 'Fossils' },
      { he: 'חרקים', en: 'Insects' },
      { he: 'כוכבים', en: 'Stars' },
    ],
    relationExplanation: {
      he: 'בוטנאי חוקר צמחים, ואורניתולוג חוקר עופות וציפורים (מדען ומושא מחקרו).',
      en: 'A botanist studies plants, an ornithologist studies birds.',
    },
  },
  // Level 7: Symbolism & Metaphor
  {
    a: { he: 'יונה', en: 'Dove' },
    b: { he: 'שלום', en: 'Peace' },
    c: { he: 'מאזניים', en: 'Scales' },
    correct: { he: 'צדק', en: 'Justice' },
    distractors: [
      { he: 'משקל', en: 'Weight' },
      { he: 'חוק', en: 'Law' },
      { he: 'שוויון', en: 'Equality' },
    ],
    relationExplanation: {
      he: 'יונה מסמלת שלום, ומאזניים מסמלים צדק ומשפט (סמל מושגי והערך המופשט שלו).',
      en: 'A dove symbolizes peace, scales symbolize justice.',
    },
  },
  // Level 8: Literature & Genre Art
  {
    a: { he: 'רומן', en: 'Novel' },
    b: { he: 'פרק', en: 'Chapter' },
    c: { he: 'סימפוניה', en: 'Symphony' },
    correct: { he: 'פרק (Movement)', en: 'Movement' },
    distractors: [
      { he: 'תו', en: 'Note' },
      { he: 'צליל', en: 'Tone' },
      { he: 'תזמורת', en: 'Orchestra' },
    ],
    relationExplanation: {
      he: 'רומן מורכב מפרקים ספרותיים, וסימפוניה מורכבת מפרקים מוזיקליים (Movement).',
      en: 'A novel is structured into chapters, a symphony into movements.',
    },
  },
  // Level 9: Epistemology & Science
  {
    a: { he: 'השערה', en: 'Hypothesis' },
    b: { he: 'ניסוי', en: 'Experiment' },
    c: { he: 'אבחנה', en: 'Diagnosis' },
    correct: { he: 'בדיקה', en: 'Examination' },
    distractors: [
      { he: 'תרופה', en: 'Medication' },
      { he: 'חולה', en: 'Patient' },
      { he: 'רופא', en: 'Doctor' },
    ],
    relationExplanation: {
      he: 'השערה מאומתת באמצעות ניסוי, כשם שאבחנה רפואית מתבררת באמצעות בדיקה.',
      en: 'A hypothesis is verified by experiment, a diagnosis by examination.',
    },
  },
  // Level 10: Deep Philosophical Abstraction
  {
    a: { he: 'אקסיומה', en: 'Axiom' },
    b: { he: 'משפט', en: 'Theorem' },
    c: { he: 'הנחת יסוד', en: 'Premise' },
    correct: { he: 'מסקנה', en: 'Conclusion' },
    distractors: [
      { he: 'ספק', en: 'Doubt' },
      { he: 'עובדה', en: 'Fact' },
      { he: 'הגדרה', en: 'Definition' },
    ],
    relationExplanation: {
      he: 'אקסיומה מובילה להוכחת משפט לוגי, כשם שהנחת יסוד מוליכה אל המסקנה.',
      en: 'An axiom leads to a theorem, as a premise leads to a conclusion.',
    },
  },
];

export const VerbalAnalogies: React.FC<VerbalAnalogiesProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const [isReady, setIsReady] = useState<boolean>(false);
  const [currentAnalogy, setCurrentAnalogy] = useState<AnalogyItem>(ANALOGIES_POOL[clampedLevel - 1]);
  const [shuffledOptions, setShuffledOptions] = useState<{ he: string; en: string }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const startTimeRef = useRef<number>(0);

  const setupAnalogy = () => {
    const item = ANALOGIES_POOL[clampedLevel - 1] || ANALOGIES_POOL[0];
    setCurrentAnalogy(item);

    const options = [item.correct, ...item.distractors].sort(() => 0.5 - Math.random());
    setShuffledOptions(options);

    setSelectedAnswer(null);
    setFeedback(null);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    setIsReady(false);
  }, [levelNumber]);

  const handleStart = () => {
    setIsReady(true);
    setupAnalogy();
  };

  const handleSelectOption = (opt: { he: string; en: string }) => {
    if (selectedAnswer !== null) return;

    const chosenText = opt[language];
    const responseTime = Date.now() - startTimeRef.current;
    setSelectedAnswer(chosenText);

    const isCorrect = opt.he === currentAnalogy.correct.he;

    if (isCorrect) {
      audioManager.playSuccess(soundEnabled);
      setFeedback({
        isCorrect: true,
        message:
          language === 'he'
            ? `מבריק! תשובה נכונה. ${currentAnalogy.relationExplanation.he}`
            : `Brilliant! Correct analogy. ${currentAnalogy.relationExplanation.en}`,
      });
    } else {
      audioManager.playGentleChime(soundEnabled);
      setFeedback({
        isCorrect: false,
        message:
          language === 'he'
            ? `התשובה הנכונה: "${currentAnalogy.correct[language]}". הסבר: ${currentAnalogy.relationExplanation.he}`
            : `Correct answer was "${currentAnalogy.correct[language]}". Explanation: ${currentAnalogy.relationExplanation.en}`,
      });
    }

    onFeedbackGiven(isCorrect, responseTime);
  };

  if (!isReady) {
    return (
      <ExerciseBriefModal
        title={language === 'he' ? 'אנלוגיות מילוליות (Verbal Analogies)' : 'Verbal Analogies'}
        categoryName={language === 'he' ? 'שפה ושליפה מילולית' : 'Language & Relations'}
        levelNumber={clampedLevel}
        instructions={
          language === 'he'
            ? 'הביטו ביחס בין צמד המילים הראשון (א : ב). עליכם להשלים את המילה הרביעית כך שהיחס יישמר בדיוק (ג : ?).'
            : 'Observe the relationship between the first pair (A : B). Complete the fourth term so the exact same relation holds (C : ?).'
        }
        scientificTip={
          language === 'he'
            ? 'הסקת אנלוגיות דורשת שליפת יחסים מופשטים מקליפת המוח הרקתית והקדם-מצחית, והיא המדד המרכזי לאינטליגנציה שפתית גבישית.'
            : 'Analogical reasoning evaluates fluid and crystallized verbal intelligence by mapping relational structures across domains.'
        }
        onStart={handleStart}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-2">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black mb-2 flex items-center justify-center gap-2">
          <span>{language === 'he' ? 'אנלוגיות מילוליות' : 'Verbal Analogies'}</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
            }`}
          >
            {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
          </span>
        </h2>
        <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300">
          {language === 'he'
            ? 'איזו מילה משלימה את היחס באופן המדויק ביותר?'
            : 'Which word accurately completes the analogy?'}
        </p>
      </div>

      {/* Analogy Presentation Equation Box */}
      <div
        className={`w-full max-w-xl p-6 sm:p-8 rounded-3xl border-4 mb-8 shadow-xl flex flex-col items-center justify-center gap-4 transition-all ${
          highContrast
            ? 'bg-black border-yellow-400 text-white'
            : theme === 'dark'
            ? 'bg-slate-900 border-slate-700 text-white'
            : 'bg-white border-primary-200 text-slate-900 shadow-md'
        }`}
      >
        {/* Row 1: Pair 1 */}
        <div className="flex items-center gap-3 text-2xl sm:text-3xl font-black">
          <span className="px-4 py-2 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-900 dark:text-primary-200 border border-primary-300">
            {currentAnalogy.a[language]}
          </span>
          <span className="opacity-50">:</span>
          <span className="px-4 py-2 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-900 dark:text-primary-200 border border-primary-300">
            {currentAnalogy.b[language]}
          </span>
        </div>

        {/* Separator */}
        <div className="text-base font-bold text-slate-400">
          {language === 'he' ? '— בדיוק כמו —' : '— IS TO —'}
        </div>

        {/* Row 2: Pair 2 */}
        <div className="flex items-center gap-3 text-2xl sm:text-3xl font-black">
          <span className="px-4 py-2 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300">
            {currentAnalogy.c[language]}
          </span>
          <span className="opacity-50">:</span>
          <span
            className={`px-6 py-2 rounded-2xl border-2 border-dashed ${
              selectedAnswer !== null
                ? 'bg-emerald-600 text-white border-emerald-400'
                : highContrast
                ? 'border-yellow-400 text-yellow-300'
                : 'border-primary-400 text-primary-600 dark:text-primary-400'
            }`}
          >
            {selectedAnswer ?? '?'}
          </span>
        </div>
      </div>

      {/* 4 Choices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {shuffledOptions.map((opt, idx) => {
          const optText = opt[language];
          const isChosen = selectedAnswer === optText;
          const isCorrect = opt.he === currentAnalogy.correct.he;

          let btnClass = '';
          if (selectedAnswer !== null) {
            if (isCorrect) {
              btnClass = highContrast
                ? 'bg-yellow-400 text-black border-4 border-white font-black'
                : 'bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
            } else if (isChosen && !isCorrect) {
              btnClass = 'bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-300 text-rose-800 opacity-60';
            } else {
              btnClass = 'opacity-40';
            }
          } else {
            btnClass = highContrast
              ? 'bg-zinc-900 border-2 border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black'
              : theme === 'dark'
              ? 'bg-slate-800 border-2 border-slate-700 text-white hover:border-primary-500 hover:bg-slate-750'
              : 'bg-white border-2 border-slate-200 text-slate-900 hover:border-primary-500 hover:bg-primary-50/50 shadow-sm';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt)}
              disabled={selectedAnswer !== null}
              className={`p-5 rounded-2xl text-xl sm:text-2xl font-bold flex items-center justify-between transition-all transform active:scale-98 ${btnClass}`}
            >
              <span>{optText}</span>
              <ArrowRight className="w-5 h-5 opacity-40 rtl:rotate-180" />
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
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
              <p className="text-lg leading-relaxed">{feedback.message}</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={setupAnalogy}
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
