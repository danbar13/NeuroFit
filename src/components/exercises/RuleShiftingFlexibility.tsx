import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { ExerciseBriefModal } from './ExerciseBriefModal';
import { CheckCircle2, Shuffle } from 'lucide-react';

interface RuleShiftingFlexibilityProps {
  levelNumber?: number;
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
}

type RuleType = 'color' | 'shape' | 'count';

interface CardItem {
  color: 'red' | 'blue' | 'green' | 'yellow';
  shape: 'circle' | 'square' | 'triangle' | 'star';
  count: 1 | 2 | 3 | 4;
}

const KEY_CARDS: CardItem[] = [
  { color: 'red', shape: 'circle', count: 1 },
  { color: 'blue', shape: 'square', count: 2 },
  { color: 'green', shape: 'triangle', count: 3 },
  { color: 'yellow', shape: 'star', count: 4 },
];

export const RuleShiftingFlexibility: React.FC<RuleShiftingFlexibilityProps> = ({
  levelNumber = 1,
  onFeedbackGiven,
}) => {
  const { theme, highContrast, soundEnabled, language } = useAccessibility();
  const clampedLevel = Math.min(10, Math.max(1, levelNumber));

  const totalTrials = 12 + clampedLevel;
  const shiftInterval = clampedLevel <= 4 ? 4 : 3; // Rule shifts every 3-4 correct answers

  const [isReady, setIsReady] = useState(false);
  const [currentRule, setCurrentRule] = useState<RuleType>('color');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [trialIndex, setTrialIndex] = useState<number>(0);
  const [stimulusCard, setStimulusCard] = useState<CardItem | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [totalSuccess, setTotalSuccess] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const colors = ['red', 'blue', 'green', 'yellow'] as const;
  const shapes = ['circle', 'square', 'triangle', 'star'] as const;
  const counts = [1, 2, 3, 4] as const;

  const generateStimulus = () => {
    return {
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      count: counts[Math.floor(Math.random() * counts.length)],
    };
  };

  const nextTrial = () => {
    setStimulusCard(generateStimulus());
    setStartTime(Date.now());
  };

  const initRound = () => {
    setCurrentRule('color');
    setConsecutiveCorrect(0);
    setTrialIndex(0);
    setTotalSuccess(0);
    setIsFinished(false);
    setLastFeedback(null);
    nextTrial();
  };

  useEffect(() => {
    if (isReady) {
      initRound();
    }
  }, [isReady, clampedLevel]);

  const handleCardPick = (targetCard: CardItem) => {
    if (!stimulusCard || isFinished) return;
    const rt = Date.now() - startTime;

    // Check if matches according to the secret currentRule
    let matched = false;
    if (currentRule === 'color') matched = targetCard.color === stimulusCard.color;
    else if (currentRule === 'shape') matched = targetCard.shape === stimulusCard.shape;
    else if (currentRule === 'count') matched = targetCard.count === stimulusCard.count;

    if (soundEnabled) audioManager.play(matched ? 'click' : 'soft_error');

    if (matched) {
      const nextConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(nextConsecutive);
      setTotalSuccess(s => s + 1);

      // Check if rule shifts!
      if (nextConsecutive >= shiftInterval) {
        const rules: RuleType[] = ['color', 'shape', 'count'];
        const remaining = rules.filter(r => r !== currentRule);
        const newRule = remaining[Math.floor(Math.random() * remaining.length)];
        setCurrentRule(newRule);
        setConsecutiveCorrect(0);
        setLastFeedback({
          isCorrect: true,
          text: language === 'he' ? 'חוק המיון השתנה! גלו את הכלל החדש...' : 'Sorting rule has shifted! Deduce the new criterion...',
        });
      } else {
        setLastFeedback({
          isCorrect: true,
          text: language === 'he' ? 'נכון! המשיכו לפי אותו חוק' : 'Correct! Follow current rule',
        });
      }
    } else {
      setConsecutiveCorrect(0);
      setLastFeedback({
        isCorrect: false,
        text: language === 'he' ? 'לא תואם את החוק. נסו קריטריון אחר!' : 'Does not match the rule. Try a different criterion!',
      });
    }

    const nextIdx = trialIndex + 1;
    setTrialIndex(nextIdx);

    if (nextIdx >= totalTrials) {
      setIsFinished(true);
      const pass = totalSuccess >= Math.floor(totalTrials * 0.65);
      onFeedbackGiven(pass, rt);
      if (soundEnabled) audioManager.play(pass ? 'success' : 'soft_error');
    } else {
      nextTrial();
    }
  };

  const renderCardVisual = (card: CardItem) => {
    const colorMap: Record<string, string> = {
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#10b981',
      yellow: '#f59e0b',
    };
    const fill = colorMap[card.color];

    return (
      <div className="flex items-center justify-center gap-1.5 p-2">
        {Array.from({ length: card.count }).map((_, i) => (
          <div key={i}>
            {card.shape === 'circle' && <div className="w-6 h-6 rounded-full" style={{ backgroundColor: fill }} />}
            {card.shape === 'square' && <div className="w-6 h-6 rounded-md" style={{ backgroundColor: fill }} />}
            {card.shape === 'triangle' && (
              <div
                className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-b-[20px]"
                style={{ borderBottomColor: fill }}
              />
            )}
            {card.shape === 'star' && <span className="text-xl" style={{ color: fill }}>★</span>}
          </div>
        ))}
      </div>
    );
  };

if (!isReady) {
    return (
      <ExerciseBriefModal
        onStart={() => setIsReady(true)}
        title={language === 'he' ? 'החלפת חוקים דינמית' : 'Rule Shifting Flexibility'}
        scientificProtocol="Wisconsin Card Sorting Test (WCST Paradigm)"
        instructions={
          language === 'he'
            ? `התאימו את הקלף התחתון לאחד מארבעת קלפי המפתח. אינכם יודעים מראש האם החוק הוא לפי צבע, צורה או כמות. למדו מהמשוב, ושימו לב: החוק ישתנה באופן פתאומי לאורך המשחק!`
            : `Match the bottom card to one of the four key cards. You are not told the active rule (Color, Shape, or Count). Learn from feedback, and be alert: the rule shifts dynamically!`
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
          <Shuffle className="text-violet-500 w-6 h-6" />
          <h2 className="text-xl font-bold">
            {language === 'he' ? 'החלפת חוקים דינמית' : 'Rule Shifting (WCST)'}
          </h2>
        </div>
        <span className="text-sm font-semibold px-3 py-1 bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 rounded-full">
          {language === 'he' ? `קלף ${trialIndex + 1}/${totalTrials}` : `Card ${trialIndex + 1}/${totalTrials}`}
        </span>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Key Cards Row */}
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2 text-center">
              {language === 'he' ? '4 קלפי מפתח לבחירה:' : '4 Key Cards:'}
            </span>
            <div className="grid grid-cols-4 gap-2">
              {KEY_CARDS.map((kc, i) => (
                <button
                  key={i}
                  onClick={() => handleCardPick(kc)}
                  className="h-24 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-violet-500 hover:scale-105 active:scale-95 rounded-2xl flex items-center justify-center shadow-md transition-all min-h-[56px]"
                >
                  {renderCardVisual(kc)}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Bar */}
          {lastFeedback && (
            <div className={`p-2.5 text-center text-sm font-bold rounded-xl transition-all ${
              lastFeedback.isCorrect ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-400' :
              'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-400'
            }`}>
              {lastFeedback.text}
            </div>
          )}

          {/* Stimulus Card */}
          {stimulusCard && (
            <div className="text-center">
              <span className="text-xs font-bold text-slate-400 block mb-2">
                {language === 'he' ? 'הקלף למיון (לחצו על קלף המפתח המתאים לו):' : 'Card to sort (tap corresponding key card):'}
              </span>
              <div className="w-40 h-28 mx-auto bg-slate-50 dark:bg-slate-900 border-3 border-violet-500 rounded-2xl flex items-center justify-center shadow-lg animate-scaleIn">
                {renderCardVisual(stimulusCard)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center space-y-4 py-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-bold">
            {language === 'he' ? 'מבחן הגמישות הקוגניטיבית הושלם!' : 'Cognitive Flexibility Task Complete!'}
          </h3>
          <p className="text-slate-500 font-medium">
            {language === 'he'
              ? `הצלחתם ב-${totalSuccess} מתוך ${totalTrials} מינויים תוך הסתגלות לחילופי החוקים.`
              : `Successfully matched ${totalSuccess} of ${totalTrials} cards across dynamic rule shifts.`}
          </p>
          <button
            onClick={initRound}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow"
          >
            {language === 'he' ? 'בצעו שוב' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
};
