import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, CheckSquare } from 'lucide-react';

interface NuancedSynonymsProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface SynonymItem {
  promptWord: { he: string; en: string };
  nuanceContext: { he: string; en: string };
  correctSynonym: { he: string; en: string };
  distractors: { he: string[]; en: string[] };
}

const SYNONYM_ITEMS: SynonymItem[] = [
  {
    promptWord: { he: 'עֲנָוָה', en: 'Humility' },
    nuanceContext: { he: 'היעדר יוהרה והכרה בערך העצמי ללא התנשאות', en: 'Absence of arrogance and realistic self-worth' },
    correctSynonym: { he: 'צְנִיעוּת', en: 'Modesty' },
    distractors: { he: ['הִתְרַפְּסוּת', 'בַּיְשָׁנוּת', 'חוּלְשָׁה'], en: ['Subservience', 'Shyness', 'Weakness'] },
  },
  {
    promptWord: { he: 'נְחִישׁוּת', en: 'Determination' },
    nuanceContext: { he: 'עמידה איתנה על השגת יעד למרות מכשולים', en: 'Steadfast commitment to goals despite obstacles' },
    correctSynonym: { he: 'הַתְמָדָה', en: 'Perseverance' },
    distractors: { he: ['עַקְשָׁנוּת עִוֶּרֶת', 'אִטִּיּוּת', 'תּוֹקְפָנוּת'], en: ['Obstinacy', 'Sluggishness', 'Aggression'] },
  },
  {
    promptWord: { he: 'שְׁלוּלִי', en: 'Puddle' },
    nuanceContext: { he: 'היקוות קטנה של מים על הקרקע', en: 'Small pool of liquid on the ground' },
    correctSynonym: { he: 'הִקָּווּת מַיִם', en: 'Pool' },
    distractors: { he: ['נַחַל', 'בְּרֵכָה גְּדוֹלָה', 'מַבּוּל'], en: ['River', 'Reservoir', 'Deluge'] },
  },
  {
    promptWord: { he: 'נָדִיב', en: 'Generous' },
    nuanceContext: { he: 'בעל רוחב לב המוכן להעניק לאחרים ברצון', en: 'Willing to give freely to others with noble spirit' },
    correctSynonym: { he: 'רְחַב לֵב', en: 'Magnanimous' },
    distractors: { he: ['בַּזְבְּזָן', 'עָשִׁיר', 'פְּזִיז'], en: ['Wasteful', 'Wealthy', 'Reckless'] },
  },
  {
    promptWord: { he: 'מְפֻכָּח', en: 'Sober-minded' },
    nuanceContext: { he: 'בעל שיקול דעת ריאליסטי ללא אשליות', en: 'Clear-headed and free from self-delusion' },
    correctSynonym: { he: 'רֵיאָלִיסְטִי', en: 'Pragmatic' },
    distractors: { he: ['פֶּסִימִי', 'קָר', 'אָדִישׁ'], en: ['Pessimistic', 'Callous', 'Apathetic'] },
  },
];

export const NuancedSynonyms: React.FC<NuancedSynonymsProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const [isReady, setIsReady] = useState(false);
  const [currentItem, setCurrentItem] = useState<SynonymItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    const picked = SYNONYM_ITEMS[Math.floor(Math.random() * SYNONYM_ITEMS.length)];
    const correctW = picked.correctSynonym[language];
    const dists = picked.distractors[language];
    const opts = [correctW, ...dists].sort(() => 0.5 - Math.random());

    setCurrentItem(picked);
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
    if (isFinished || !currentItem) return;
    const rt = Date.now() - startTime;
    setSelectedWord(word);
    const correct = word === currentItem.correctSynonym[language];
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
        title={language === 'he' ? 'דקויות של מילים נרדפות' : 'Nuanced Synonym Discrimination'}
        scientificProtocol="Semantic Precision & Vocabulary Depth"
        instructions={
          language === 'he'
            ? `הבחינו בדקויות המשמעות: קראו את מילת המטרה וההקשר המדויק שלה, ובחרו את המילה הנרדפת הקרובה והמדויקת ביותר (היזהרו ממילים בעלות גוון שלילי או מופרז)!`
            : `Distinguish nuanced connotations: read the target word and contextual meaning, and select the closest true synonym.`
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
          <CheckSquare className="text-purple-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'דקויות של מילים נרדפות' : 'Nuanced Synonyms'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
        </span>
      </div>

      {currentItem && (
        <div className="space-y-6">
          {/* Target Card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-center shadow-inner">
            <span className="text-xs font-bold text-slate-400 block mb-2">
              {language === 'he' ? 'מילת המטרה:' : 'Target Word:'}
            </span>
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">
              {currentItem.promptWord[language]}
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 italic">
              ({currentItem.nuanceContext[language]})
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
                    ? (language === 'he' ? 'דיוק לשוני מעולה!' : 'Superb semantic precision!')
                    : (language === 'he' ? `המילה הנרדפת המדויקת היא: "${currentItem.correctSynonym[language]}"` : `The accurate synonym is: "${currentItem.correctSynonym[language]}"`)}
                </span>
              </div>
              <button
                onClick={initRound}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'he' ? 'הבא' : 'Next'}
              </button>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((w, idx) => {
              const isSelected = selectedWord === w;
              const isSolution = w === currentItem.correctSynonym[language];

              let border = 'border-slate-300 dark:border-slate-600 hover:border-purple-400';
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
