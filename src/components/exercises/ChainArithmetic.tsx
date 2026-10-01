import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, RotateCcw, AlertCircle, Calculator } from 'lucide-react';

interface ChainArithmeticProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

interface StepItem {
  text: string;
  op: '+' | '-' | '*';
  val: number;
}

export const ChainArithmetic: React.FC<ChainArithmeticProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const numOps = Math.min(6, 2 + Math.floor(clampedLevel / 2)); // 2 to 6 operations
  const [isReady, setIsReady] = useState(false);
  const [phase, setPhase] = useState<'streaming' | 'answer' | 'result'>('streaming');
  const [currentStepText, setCurrentStepText] = useState<string>('');
  const [expectedTotal, setExpectedTotal] = useState<number>(0);
  const [options, setOptions] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const initRound = () => {
    // Generate initial starting number
    let running = Math.floor(Math.random() * 15) + 5;
    const steps: StepItem[] = [{ text: `${running}`, op: '+', val: 0 }];

    for (let i = 0; i < numOps; i++) {
      const isAdd = running < 10 || Math.random() < 0.6;
      if (isAdd) {
        const addVal = Math.floor(Math.random() * 8) + 2;
        running += addVal;
        steps.push({ text: `+ ${addVal}`, op: '+', val: addVal });
      } else {
        const subVal = Math.floor(Math.random() * Math.min(6, running - 2)) + 1;
        running -= subVal;
        steps.push({ text: `- ${subVal}`, op: '-', val: subVal });
      }
    }

    setExpectedTotal(running);
    setIsCorrect(null);
    setPhase('streaming');

    // Create 4 choices around running
    const choices = new Set<number>([running]);
    while (choices.size < 4) {
      const offset = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
      const fake = running + offset;
      if (fake > 0) choices.add(fake);
    }
    setOptions(Array.from(choices).sort(() => 0.5 - Math.random()));

    // Stream steps
    let stepIdx = 0;
    const stepDuration = Math.max(1500, 2400 - clampedLevel * 80);

    const runStream = () => {
      if (stepIdx < steps.length) {
        setCurrentStepText(steps[stepIdx].text);
        if (soundEnabled) audioManager.play('click');
        stepIdx++;
        setTimeout(runStream, stepDuration);
      } else {
        setCurrentStepText('?');
        setPhase('answer');
        setStartTime(Date.now());
      }
    };

    setTimeout(runStream, 600);
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel]);

  const handleSelectChoice = (val: number) => {
    if (phase !== 'answer') return;
    const rt = Date.now() - startTime;
    const correct = val === expectedTotal;
    setIsCorrect(correct);
    setPhase('result');

    if (soundEnabled) {
      audioManager.play(correct ? 'success' : 'soft_error');
    }
    onFeedbackGiven(correct, rt);
  };

if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'חישוב שרשרת מתגלגל' : 'Mental Chain Arithmetic'}
        scientificProtocol="Serial Sevens & Continuous Working Math"
        instructions={
          language === 'he'
            ? `על המסך יופיע מספר התחלתי ולאחריו פעולות חשבון בזו אחר זו (+ ו- -). בצעו את החישובים בעל פה ברצף ושמרו את התוצאה המתעדכנת בזיכרון, עד לשאלת התוצאה הסופית.`
            : `A starting number appears followed by continuous mathematical operations (+ and -). Perform calculations continuously in your head, keeping the running total in memory.`
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

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Calculator className="text-amber-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'חישוב שרשרת מתגלגל' : 'Mental Chain Arithmetic'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full">
          {language === 'he' ? `רמה ${clampedLevel} | ${numOps} פעולות` : `Level ${clampedLevel} | ${numOps} ops`}
        </span>
      </div>

      {phase === 'streaming' && (
        <div className="text-center py-10">
          <span className="text-xs font-semibold text-slate-400 block mb-4 uppercase tracking-wider">
            {language === 'he' ? 'חשבו ושמרו בזיכרון' : 'Calculate & hold running sum'}
          </span>
          <div className="w-36 h-36 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-4 border-amber-400 flex items-center justify-center text-5xl font-black text-amber-600 dark:text-amber-300 shadow-xl animate-scaleIn">
            {currentStepText}
          </div>
        </div>
      )}

      {phase === 'answer' && (
        <div className="space-y-6 py-4">
          <div className="text-center">
            <span className="text-sm font-bold text-slate-400 block mb-2">
              {language === 'he' ? 'מהי התוצאה הסופית שהתקבלה?' : 'What is the final total in your memory?'}
            </span>
            <div className="text-5xl font-black text-amber-500 mb-6">?</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((val) => (
              <button
                key={val}
                onClick={() => handleSelectChoice(val)}
                className="py-4 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-500 hover:border-amber-500 hover:scale-105 active:scale-95 text-3xl font-black rounded-2xl shadow-md transition-all min-h-[64px]"
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl flex items-center justify-between ${
            isCorrect ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-600 dark:text-emerald-300' :
            'bg-amber-500/15 border border-amber-500 text-amber-600 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-2 font-bold text-lg">
              {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              <span>
                {isCorrect
                  ? (language === 'he' ? 'מבריק! חישוב זיכרון מדויק!' : 'Brilliant! Flawless working memory calc!')
                  : (language === 'he' ? `התוצאה הנכונה הייתה ${expectedTotal}` : `The correct total was ${expectedTotal}`)}
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
        </div>
      )}
    </div>
  );
};
