import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, FileText } from 'lucide-react';

interface ClozeSentenceContextProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface ClozeItem {
  sentence: { he: string; en: string }; // contains [ ___ ]
  correctWord: { he: string; en: string };
  distractors: { he: string[]; en: string[] };
}

const CLOZE_ITEMS: ClozeItem[] = [
  {
    sentence: {
      he: 'למרות הביקורת הנוקבת, החוקר שמר על גישה [ ___ ] והמשיך בניסוי כמתוכנן.',
      en: 'Despite severe criticism, the scientist maintained an [ ___ ] attitude and continued.',
    },
    correctWord: { he: 'מאוזנת', en: 'objective' },
    distractors: { he: ['תוקפנית', 'מבולבלת', 'אקראית'], en: ['erratic', 'hostile', 'arbitrary'] },
  },
  {
    sentence: {
      he: 'הפיתוח הטכנולוגי החדש היווה פריצת דרך [ ___ ] בתחום האנרגיה הירוקה.',
      en: 'The breakthrough was considered [ ___ ] in the green energy sector.',
    },
    correctWord: { he: 'חסרת תקדים', en: 'unprecedented' },
    distractors: { he: ['שולית', 'חולפת', 'מיושנת'], en: ['marginal', 'fleeting', 'obsolete'] },
  },
  {
    sentence: {
      he: 'ההיסטוריון הצליח לגלות מסמכים נדירים ששפכו אור [ ___ ] על הפרשה.',
      en: 'The historian unearthed rare documents shedding [ ___ ] light on the event.',
    },
    correctWord: { he: 'חדש', en: 'fresh' },
    distractors: { he: ['מעורפל', 'חשוך', 'מלאכותי'], en: ['dim', 'vague', 'artificial'] },
  },
  {
    sentence: {
      he: 'המוזיקה הקלאסית השפיעה באופן [ ___ ] על שלוות רוחם של המאזינים.',
      en: 'The classical symphonies had a [ ___ ] impact on listeners\' peace of mind.',
    },
    correctWord: { he: 'מרגיע', en: 'soothing' },
    distractors: { he: ['רועש', 'מקרי', 'סוער'], en: ['jarring', 'turbulent', 'sporadic'] },
  },
  {
    sentence: {
      he: 'כושר ההמצאה שלו בא לידי ביטוי בפתרון [ ___ ] לבעיה הפיננסית.',
      en: 'His ingenuity was demonstrated through an [ ___ ] financial solution.',
    },
    correctWord: { he: 'יצירתי', en: 'ingenious' },
    distractors: { he: ['שגרתי', 'נוקשה', 'שטחי'], en: ['mundane', 'rigid', 'shallow'] },
  },
];

export const ClozeSentenceContext: React.FC<ClozeSentenceContextProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const [isReady, setIsReady] = useState(false);
  const [currentItem, setCurrentItem] = useState<ClozeItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    const picked = CLOZE_ITEMS[Math.floor(Math.random() * CLOZE_ITEMS.length)];
    const correctW = picked.correctWord[language];
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
    const correct = word === currentItem.correctWord[language];
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
        title={language === 'he' ? 'השלמת משפט מתוך הקשר' : 'Cloze Sentence Context'}
        scientificProtocol="Taylor Cloze Procedure (1953)"
        instructions={
          language === 'he'
            ? `קראו בעיון את המשפט ובחרו את המילה המדויקת ביותר בהקשר הלשוני, התחבירי והמושגי להשלמת החסר [ ___ ].`
            : `Carefully read the sentence and select the most precise vocabulary word fitting context and syntax to complete [ ___ ].`
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
          <FileText className="text-blue-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'השלמת משפט מהקשר' : 'Sentence Context'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
        </span>
      </div>

      {currentItem && (
        <div className="space-y-6">
          {/* Sentence Container */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-center shadow-inner">
            <p className="text-xl leading-relaxed font-bold text-slate-800 dark:text-slate-100">
              {currentItem.sentence[language]}
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
                    ? (language === 'he' ? 'התאמה מושלמת למשפט!' : 'Perfect contextual fit!')
                    : (language === 'he' ? `המילה המתאימה היא: "${currentItem.correctWord[language]}"` : `The right fit was: "${currentItem.correctWord[language]}"`)}
                </span>
              </div>
              <button
                onClick={initRound}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
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
              const isSolution = w === currentItem.correctWord[language];

              let border = 'border-slate-300 dark:border-slate-600 hover:border-blue-400';
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
      )}
    </div>
  );
};
