import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, TreePine } from 'lucide-react';

interface WordRootsFamiliesProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface RootProblem {
  words: { he: string[]; en: string[] };
  rootAnswer: { he: string; en: string };
  distractors: { he: string[]; en: string[] };
}

const ROOT_PROBLEMS: RootProblem[] = [
  {
    words: { he: ['מַשְׁבֵּר', 'שָׁבִיר', 'לְהִשָּׁבֵר'], en: ['Chronic', 'Chronometer', 'Synchronize'] },
    rootAnswer: { he: 'ש-ב-ר', en: 'Chron (Time)' },
    distractors: { he: ['ש-ב-ת', 'ב-ש-ר', 'ש-ב-ע'], en: ['Geo (Earth)', 'Bio (Life)', 'Tele (Distant)'] },
  },
  {
    words: { he: ['תִּקְשֹׁרֶת', 'הִתְקַשְּׁרוּת', 'קָשׁוּר'], en: ['Telemetry', 'Telephone', 'Telescope'] },
    rootAnswer: { he: 'ק-ש-ר', en: 'Tele (Far/Distant)' },
    distractors: { he: ['ק-ט-ר', 'ש-ק-ר', 'ק-ר-ש'], en: ['Micro (Small)', 'Graph (Write)', 'Scope (See)'] },
  },
  {
    words: { he: ['תַּכְתִּיב', 'מִכְתָּב', 'כְּתֹבֶת'], en: ['Autograph', 'Biography', 'Geography'] },
    rootAnswer: { he: 'כ-ת-ב', en: 'Graph (Write/Draw)' },
    distractors: { he: ['כ-ת-ר', 'כ-ב-ש', 'ת-כ-ן'], en: ['Phon (Sound)', 'Logos (Word)', 'Port (Carry)'] },
  },
  {
    words: { he: ['הַרְגָּשָׁה', 'מוּחָשׁ', 'רְגִישׁוּת'], en: ['Sympathy', 'Empathy', 'Apathy'] },
    rootAnswer: { he: 'ר-ג-ש', en: 'Pathos (Feeling)' },
    distractors: { he: ['ג-ש-ר', 'ר-ע-ש', 'ש-ג-ר'], en: ['Ethos (Custom)', 'Logos (Logic)', 'Gen (Birth)'] },
  },
  {
    words: { he: ['מַנְהִיג', 'לִנְהֹג', 'הַנְהָגָה'], en: ['Transport', 'Portable', 'Export'] },
    rootAnswer: { he: 'נ-ה-ג', en: 'Port (Carry)' },
    distractors: { he: ['ה-ג-ה', 'נ-ו-ע', 'ד-ה-ר'], en: ['Dict (Speak)', 'Mit (Send)', 'Tract (Pull)'] },
  },
];

export const WordRootsFamilies: React.FC<WordRootsFamiliesProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const [isReady, setIsReady] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<RootProblem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    const picked = ROOT_PROBLEMS[Math.floor(Math.random() * ROOT_PROBLEMS.length)];
    const sol = picked.rootAnswer[language];
    const dists = picked.distractors[language];
    const opts = [sol, ...dists].sort(() => 0.5 - Math.random());

    setCurrentProblem(picked);
    setOptions(opts);
    setSelectedRoot(null);
    setIsFinished(false);
    setIsCorrect(null);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel, language]);

  const handleSelect = (root: string) => {
    if (isFinished || !currentProblem) return;
    const rt = Date.now() - startTime;
    setSelectedRoot(root);
    const correct = root === currentProblem.rootAnswer[language];
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
        title={language === 'he' ? 'שורשים ומשפחות מילים' : 'Etymological Root Families'}
        scientificProtocol="Morphological Awareness Battery"
        instructions={
          language === 'he'
            ? `התבוננו בשלוש המילים המוצגות. זהו את השורש הלשוני התלת-אותי המשותף המחבר ביניהן ובחרו אותו מבין האפשרויות.`
            : `Examine the three words displayed. Identify the common root morpheme uniting them among the choices.`
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
          <TreePine className="text-emerald-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'שורשים ומשפחות מילים' : 'Root Families'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel}` : `Level ${clampedLevel}`}
        </span>
      </div>

      {currentProblem && (
        <div className="space-y-6">
          {/* Word Family Card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-center shadow-inner">
            <span className="text-xs font-bold text-slate-400 block mb-4 uppercase tracking-wider">
              {language === 'he' ? 'משפחת המילים:' : 'Word Family:'}
            </span>
            <div className="flex justify-center gap-3 flex-wrap">
              {currentProblem.words[language].map((w, i) => (
                <span
                  key={i}
                  className="px-4 py-3 bg-white dark:bg-slate-800 border-2 border-emerald-400 rounded-xl text-xl font-black text-emerald-700 dark:text-emerald-300 shadow-md"
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
                    ? (language === 'he' ? 'זיהוי מורפולוגי מדויק!' : 'Accurate morphological identification!')
                    : (language === 'he' ? `השורש המשותף הוא: "${currentProblem.rootAnswer[language]}"` : `The root is: "${currentProblem.rootAnswer[language]}"`)}
                </span>
              </div>
              <button
                onClick={initRound}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 text-sm font-bold shadow"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'he' ? 'הבא' : 'Next'}
              </button>
            </div>
          )}

          {/* Options */}
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2 text-center">
              {language === 'he' ? 'מהו השורש המשותף?' : 'What is the uniting root?'}
            </span>
            <div className="grid grid-cols-2 gap-3">
              {options.map((r, idx) => {
                const isSelected = selectedRoot === r;
                const isSolution = r === currentProblem.rootAnswer[language];

                let border = 'border-slate-300 dark:border-slate-600 hover:border-emerald-400';
                if (isFinished) {
                  if (isSolution) border = 'border-emerald-500 ring-2 ring-emerald-400 bg-emerald-50/40 text-emerald-700';
                  else if (isSelected) border = 'border-red-500 ring-2 ring-red-400 bg-red-50/40 text-red-700';
                }

return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(r)}
                    className={`py-4 px-3 bg-white dark:bg-slate-800 rounded-xl border-2 text-xl font-black shadow-sm transition-all hover:scale-105 active:scale-95 min-h-[56px] ${border}`}
                  >
                    {r}
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
