import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, Bookmark } from 'lucide-react';

interface DefinitionsEtymologyProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface DefinitionItem {
  definition: { he: string; en: string };
  correctTerm: { he: string; en: string };
  distractors: { he: string[]; en: string[] };
}

const DEFINITION_ITEMS: DefinitionItem[] = [
  {
    definition: {
      he: 'תפיסה מוסרית הדוגלת בהעדפת טובת הזולת והקרבה עצמית למען הכלל.',
      en: 'The moral belief in selflessly helping others and prioritizing the common good.',
    },
    correctTerm: { he: 'אַלְטְרוּאִיזְם', en: 'Altruism' },
    distractors: {
      he: ['הֶדוֹנִיזְם', 'סוֹלִיפְּסִיזְם', 'אֵגוֹאִיזְם'],
      en: ['Hedonism', 'Solipsism', 'Egoism'],
    },
  },
  {
    definition: {
      he: 'מצב של שוויון כוחות או איזון מושלם בין גורמים מנוגדים.',
      en: 'A state of balance between opposing forces or actions.',
    },
    correctTerm: { he: 'אֶקְוִוילִיבְּרִיּוּם (איזון)', en: 'Equilibrium' },
    distractors: {
      he: ['כָּאוֹס (תוהו)', 'פָּרָדוֹכְּס', 'קִיפּוּחַ'],
      en: ['Chaos', 'Paradox', 'Deficit'],
    },
  },
  {
    definition: {
      he: 'השקפה פילוסופית לפיה קיימת אמת מוחלטת אחת המבוססת על השכל וההיגיון בלבד.',
      en: 'The philosophical doctrine that reason alone is the primary source of knowledge.',
    },
    correctTerm: { he: 'רַצְיוֹנָלִיזְם', en: 'Rationalism' },
    distractors: {
      he: ['אֶמְפִּירִיצִיזְם', 'מִיסְטִיקָה', 'נִיהִילִיזְם'],
      en: ['Empiricism', 'Mysticism', 'Nihilism'],
    },
  },
  {
    definition: {
      he: 'הטיה קוגניטיבית שבה אדם נוטה לחפש רק מידע המאשש את עמדותיו הקיימות.',
      en: 'The cognitive tendency to search for information confirming preexisting beliefs.',
    },
    correctTerm: { he: 'הַטָּיַת אִשּׁוּשׁ', en: 'Confirmation Bias' },
    distractors: {
      he: ['הַטָּיַת זְמִינוּת', 'אֵפֶקְט הַהִלָּה', 'דִּיסוֹנַנְס'],
      en: ['Availability Heuristic', 'Halo Effect', 'Dissonance'],
    },
  },
  {
    definition: {
      he: 'שילוב הרמוני של אלמנטים שונים היוצרים שלם הגדול מסכום חלקיו.',
      en: 'Interaction of elements that when combined produce a total effect greater than sum of parts.',
    },
    correctTerm: { he: 'סִינֶרְגְּיָה', en: 'Synergy' },
    distractors: {
      he: ['אַנְתָּגוֹנִיזְם', 'סְטַגְנַצְיָה', 'דִּיפֶרֶנְצְיָאל'],
      en: ['Antagonism', 'Stagnation', 'Differential'],
    },
  },
];

export const DefinitionsEtymology: React.FC<DefinitionsEtymologyProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const [isReady, setIsReady] = useState(false);
  const [currentItem, setCurrentItem] = useState<DefinitionItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    const picked = DEFINITION_ITEMS[Math.floor(Math.random() * DEFINITION_ITEMS.length)];
    const correctT = picked.correctTerm[language];
    const dists = picked.distractors[language];
    const opts = [correctT, ...dists].sort(() => 0.5 - Math.random());

    setCurrentItem(picked);
    setOptions(opts);
    setSelectedTerm(null);
    setIsFinished(false);
    setIsCorrect(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel, language]);

  const handleSelect = (term: string) => {
    if (isFinished || !currentItem) return;
    const rt = Date.now() - startTime;
    setSelectedTerm(term);
    const correct = term === currentItem.correctTerm[language];
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
        title={language === 'he' ? 'הגדרות ומושגי מפתח' : 'Definitions & Lexicon'}
        scientificProtocol="Peabody Picture / Verbal Definition Test"
        instructions={
          language === 'he'
            ? `קראו את ההגדרה המילונית המדויקת והתאימו לה את המושג הפילוסופי, המדעי או התרבותי הנכון מבין האפשרויות.`
            : `Read the precise lexical definition and identify the correct philosophical or scientific term among the choices.`
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
          <Bookmark className="text-indigo-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'הגדרות ומושגי מפתח' : 'Definitions & Lexicon'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
        </span>
      </div>

      {currentItem && (
        <div className="space-y-6">
          {/* Definition Card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-center shadow-inner">
            <span className="text-xs font-bold text-slate-400 block mb-2">
              {language === 'he' ? 'הגדרה מילונית:' : 'Lexical Definition:'}
            </span>
            <p className="text-xl leading-relaxed font-bold text-slate-800 dark:text-slate-100 py-2">
              "{currentItem.definition[language]}"
            </p>
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
                    ? (language === 'he' ? 'הגדרה מדויקת להפליא!' : 'Exact definition match!')
                    : (language === 'he' ? `המושג הנכון הוא: "${currentItem.correctTerm[language]}"` : `The correct term is: "${currentItem.correctTerm[language]}"`)}
                </span>
              </div>
              <button
                onClick={initRound}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'he' ? 'הבא' : 'Next'}
              </button>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((term, idx) => {
              const isSelected = selectedTerm === term;
              const isSolution = term === currentItem.correctTerm[language];

              let border = 'border-slate-300 dark:border-slate-600 hover:border-indigo-400';
              if (isFinished) {
                if (isSolution) border = 'border-emerald-500 ring-2 ring-emerald-400 bg-emerald-50/40 text-emerald-700';
                else if (isSelected) border = 'border-red-500 ring-2 ring-red-400 bg-red-50/40 text-red-700';
              }

return (
                <button
                  key={idx}
                  onClick={() => handleSelect(term)}
                  className={`py-4 px-3 bg-white dark:bg-slate-800 rounded-xl border-2 text-lg font-bold shadow-sm transition-all hover:scale-105 active:scale-95 min-h-[56px] ${border}`}
                >
                  {term}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
