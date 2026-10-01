import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { baselineContentMatrix } from '../../data/baselineContentMatrix';
import { CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

import { exerciseDictionaryService } from '../../lib/exerciseDictionaryService';
import type { LanguagePayload } from '../../types/database';
import type { SemanticWordPair } from '../../data/baselineContentMatrix';

interface Test4Props {
  onFeedbackGiven: (correct: boolean, responseTimeMs: number) => void;
  level?: 'level_1' | 'level_2' | 'level_3';
}

export const Test4SemanticRetrieval: React.FC<Test4Props> = ({ onFeedbackGiven, level = 'level_1' }) => {
  const { language, theme, highContrast, soundEnabled, t } = useAccessibility();

  const exerciseData = baselineContentMatrix[language].exercises.ex_semantic_retrieval;
  const wordPairs = exerciseData.difficulty_levels[level].word_pairs;

  const [activePair, setActivePair] = useState<SemanticWordPair>(() => {
    return (
      wordPairs[0] || {
        target: language === 'he' ? 'קר' : 'Cold',
        correct: language === 'he' ? 'חם' : 'Hot',
        options: language === 'he' ? ['רטוב', 'רחוק', 'גדול', 'חם'] : ['Wet', 'Far', 'Large', 'Hot'],
      }
    );
  });

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchPair = async () => {
      try {
        const lvlNum = level === 'level_1' ? 1 : level === 'level_2' ? 2 : 3;
        const cmsItems = await exerciseDictionaryService.getByLevel('language', lvlNum, language);
        if (cmsItems.length > 0) {
          const item = cmsItems[0];
          const payload = item.content_payload as LanguagePayload;
          const allOptions = [...payload.distractors, payload.correct_answer].sort(() => Math.random() - 0.5);
          setActivePair({
            target: payload.target_word,
            correct: payload.correct_answer,
            options: allOptions,
          });
          return;
        }
      } catch {
        // fallback
      }
      setActivePair(
        wordPairs[0] || {
          target: language === 'he' ? 'קר' : 'Cold',
          correct: language === 'he' ? 'חם' : 'Hot',
          options: language === 'he' ? ['רטוב', 'רחוק', 'גדול', 'חם'] : ['Wet', 'Far', 'Large', 'Hot'],
        }
      );
    };

    fetchPair();
    setIsAnswered(false);
    setSelectedWord(null);
    setFeedback(null);
    setStartTime(Date.now());
  }, [language, level]);

  const handleOptionClick = (word: string) => {
    if (isAnswered) return;

    const responseTime = Date.now() - startTime;
    setSelectedWord(word);
    setIsAnswered(true);

    const isCorrect = word === activePair.correct;

    if (isCorrect) {
      audioManager.playSuccess(soundEnabled);
      setFeedback({
        isCorrect: true,
        message: t.test4Success,
      });
    } else {
      audioManager.playGentleGuidance(soundEnabled);
      setFeedback({
        isCorrect: false,
        message: t.test4Guidance.replace('{correct}', activePair.correct),
      });
    }

    onFeedbackGiven(isCorrect, responseTime);
  };

  return (
    <div className="w-full flex flex-col items-center justify-between min-h-[440px] max-w-3xl mx-auto py-2 px-3">
      {/* Exercise Instruction from Matrix: "בחרו את המילה ההפוכה במשמעותה למילה המוצגת." */}
      <div className="text-center mb-4">
        <p className="text-xl sm:text-2xl font-bold tracking-tight">
          {exerciseData.instruction}
        </p>
      </div>

      {/* Target Word Card */}
      <div
        className={`px-10 py-6 rounded-3xl border-4 shadow-sm text-center mb-6 max-w-sm w-full transition-all ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-800 text-blue-300 border-slate-700'
            : 'bg-blue-50 text-blue-900 border-blue-200'
        }`}
      >
        <span className="text-sm font-semibold uppercase tracking-wider block opacity-75 mb-1">
          {language === 'he' ? 'המילה המוצגת:' : 'Shown Word:'}
        </span>
        <span className="text-4xl sm:text-5xl font-black">{activePair.target}</span>
      </div>

      {/* 4 Multiple Choice Options from Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-2">
        {activePair.options.map((word, index) => {
          const isSelected = selectedWord === word;
          const isCorrect = word === activePair.correct;

          let btnClasses = '';
          if (highContrast) {
            btnClasses = 'bg-gray-900 border-yellow-400 text-white';
            if (isAnswered && isCorrect) {
              btnClasses = 'bg-yellow-400/30 border-yellow-300 ring-4 ring-yellow-400 text-yellow-300 font-extrabold';
            } else if (isAnswered && isSelected && !isCorrect) {
              btnClasses = 'bg-gray-900 border-gray-600 opacity-50';
            }
          } else if (theme === 'dark') {
            btnClasses = 'bg-slate-800 border-slate-700 text-slate-100 hover:border-blue-400';
            if (isAnswered && isCorrect) {
              btnClasses = 'bg-emerald-950/70 border-emerald-500 ring-4 ring-emerald-500/40 text-emerald-200';
            } else if (isAnswered && isSelected && !isCorrect) {
              btnClasses = 'bg-slate-800 border-slate-700 opacity-50';
            }
          } else {
            btnClasses = 'bg-white border-slate-200 text-slate-900 shadow-sm hover:border-blue-400';
            if (isAnswered && isCorrect) {
              btnClasses = 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-400/40 text-emerald-900 font-bold';
            } else if (isAnswered && isSelected && !isCorrect) {
              btnClasses = 'bg-slate-50 border-slate-200 opacity-50';
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(word)}
              disabled={isAnswered}
              className={`min-h-[72px] sm:min-h-[80px] rounded-2xl border-3 flex items-center justify-center px-6 text-center text-2xl font-bold transition-all ${btnClasses} ${
                !isAnswered
                  ? 'hover:scale-105 active:scale-95 cursor-pointer'
                  : 'cursor-default'
              }`}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* Gentle Learning Feedback Banner */}
      <div className="w-full min-h-[90px] flex items-center justify-center mt-6">
        {feedback && (
          <div
            className={`w-full max-w-xl p-4 sm:p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${
              feedback.isCorrect
                ? highContrast
                  ? 'bg-black text-yellow-300 border-yellow-400'
                  : theme === 'dark'
                  ? 'bg-emerald-950/80 text-emerald-200 border-emerald-600'
                  : 'bg-emerald-50 text-emerald-950 border-emerald-300'
                : highContrast
                ? 'bg-black text-yellow-300 border-yellow-400'
                : theme === 'dark'
                ? 'bg-amber-950/80 text-amber-200 border-amber-600'
                : 'bg-amber-50 text-amber-950 border-amber-300'
            }`}
          >
            {feedback.isCorrect ? (
              <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
                <Sparkles className="w-8 h-8" />
              </div>
            )}
            <div>
              <p className="text-lg sm:text-xl font-bold">{feedback.message}</p>
              <p className="text-sm sm:text-base opacity-80 mt-0.5">
                {t.waitingAnswer}
              </p>
            </div>
          </div>
        )}

        {!feedback && !isAnswered && (
          <div className="flex items-center gap-2 text-base sm:text-lg opacity-70">
            <HelpCircle className="w-6 h-6 shrink-0" />
            <span>{t.noRush}</span>
          </div>
        )}
      </div>
    </div>
  );
};
