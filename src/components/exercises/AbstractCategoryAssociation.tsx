import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, FolderTree } from 'lucide-react';

interface AbstractCategoryAssociationProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface TaxonomyItem {
  concept: { he: string; en: string };
  category: { he: string; en: string };
  distractors: { he: string[]; en: string[] };
}

const TAXONOMY: TaxonomyItem[] = [
  {
    concept: { he: 'אמפתיה', en: 'Empathy' },
    category: { he: 'פסיכולוגיה ואינטליגנציה רגשית', en: 'Emotional Intelligence & Psychology' },
    distractors: {
      he: ['כלכלה מוניטרית', 'גיאולוגיה מבנית', 'אסטרונומיה'],
      en: ['Monetary Economics', 'Structural Geology', 'Astronomy'],
    },
  },
  {
    concept: { he: 'אינפלציה', en: 'Inflation' },
    category: { he: 'מקרו-כלכלה ושוקי הון', en: 'Macroeconomics & Capital Markets' },
    distractors: {
      he: ['אקולוגיה ימית', 'בלשנות שמית', 'אדריכלות'],
      en: ['Marine Ecology', 'Semitic Linguistics', 'Architecture'],
    },
  },
  {
    concept: { he: 'פוטוסינתזה', en: 'Photosynthesis' },
    category: { he: 'ביולוגיה ובוטניקה', en: 'Biology & Botany' },
    distractors: {
      he: ['מדעי המדינה', 'משפט חוקתי', 'מוזיקולוגיה'],
      en: ['Political Science', 'Constitutional Law', 'Musicology'],
    },
  },
  {
    concept: { he: 'סונטה', en: 'Sonata' },
    category: { he: 'צורות מוזיקליות קלאסיות', en: 'Classical Musical Structures' },
    distractors: {
      he: ['כימיה אורגנית', 'מדעי הקרקע', 'הנדסת חומרים'],
      en: ['Organic Chemistry', 'Soil Sciences', 'Materials Engineering'],
    },
  },
  {
    concept: { he: 'סרקופג', en: 'Sarcophagus' },
    category: { he: 'ארכיאולוגיה ותרבויות עתיקות', en: 'Archaeology & Ancient Civilizations' },
    distractors: {
      he: ['ביולוגיה מולקולרית', 'מדעי המחשב', 'תורת המשחקים'],
      en: ['Molecular Biology', 'Computer Science', 'Game Theory'],
    },
  },
];

export const AbstractCategoryAssociation: React.FC<AbstractCategoryAssociationProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const [isReady, setIsReady] = useState(false);
  const [currentItem, setCurrentItem] = useState<TaxonomyItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    const picked = TAXONOMY[Math.floor(Math.random() * TAXONOMY.length)];
    const correctCat = picked.category[language];
    const dists = picked.distractors[language];
    const opts = [correctCat, ...dists].sort(() => 0.5 - Math.random());

    setCurrentItem(picked);
    setOptions(opts);
    setSelectedCategory(null);
    setIsFinished(false);
    setIsCorrect(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel, language]);

  const handleSelect = (cat: string) => {
    if (isFinished || !currentItem) return;
    const rt = Date.now() - startTime;
    setSelectedCategory(cat);
    const correct = cat === currentItem.category[language];
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
        title={language === 'he' ? 'שיוך קטגוריאלי מופשט' : 'Abstract Category Association'}
        scientificProtocol="Semantic Network Spreading Activation"
        instructions={
          language === 'he'
            ? `הביטו במושג המרכזי המוצג לפניכם ושייכו אותו לקטגוריית-העל המדעית, הפילוסופית או התרבותית המתאימה לו ביותר מבין האפשרויות.`
            : `Observe the key concept and map it to its overarching intellectual or scientific domain among the choices.`
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
          <FolderTree className="text-teal-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'שיוך קטגוריאלי' : 'Category Association'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
        </span>
      </div>

      {currentItem && (
        <div className="space-y-6">
          {/* Concept Header */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-center shadow-inner">
            <span className="text-xs font-bold text-slate-400 block mb-2">
              {language === 'he' ? 'מושג היעד:' : 'Target Concept:'}
            </span>
            <div className="text-3xl font-black text-teal-600 dark:text-teal-400">
              {currentItem.concept[language]}
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
                    ? (language === 'he' ? 'שיוך קטגוריאלי מושלם!' : 'Superb categorization!')
                    : (language === 'he' ? `שייך אל: "${currentItem.category[language]}"` : `Belongs to: "${currentItem.category[language]}"`)}
                </span>
              </div>
              <button
                onClick={initRound}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'he' ? 'הבא' : 'Next'}
              </button>
            </div>
          )}

          {/* Options */}
          <div className="space-y-2.5">
            {options.map((cat, idx) => {
              const isSelected = selectedCategory === cat;
              const isSolution = cat === currentItem.category[language];

              let border = 'border-slate-300 dark:border-slate-600 hover:border-teal-400';
              if (isFinished) {
                if (isSolution) border = 'border-emerald-500 ring-2 ring-emerald-400 bg-emerald-50/40 text-emerald-800';
                else if (isSelected) border = 'border-red-500 ring-2 ring-red-400 bg-red-50/40 text-red-800';
              }

return (
                <button
                  key={idx}
                  onClick={() => handleSelect(cat)}
                  className={`w-full py-4 px-4 bg-white dark:bg-slate-800 rounded-xl border-2 text-lg font-bold shadow-sm transition-all text-start hover:scale-[1.01] active:scale-95 min-h-[56px] ${border}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
