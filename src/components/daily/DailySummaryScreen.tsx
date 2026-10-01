import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useGamification } from '../../context/GamificationContext';
import type { WorkoutCompletionResult } from '../../lib/workoutService';
import type { ExerciseCategory } from '../../types/exercise';
import {
  Trophy,
  Flame,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Brain,
  Eye,
  Zap,
  BookOpen,
  ArrowUpRight,
  Minus,
  CheckCircle,
} from 'lucide-react';

interface DailySummaryScreenProps {
  workoutResult: WorkoutCompletionResult;
  onReturnHome: () => void;
  onOpenFamilyClub: () => void;
}

export const DailySummaryScreen: React.FC<DailySummaryScreenProps> = ({
  workoutResult,
  onReturnHome,
  onOpenFamilyClub,
}) => {
  const { theme, highContrast, language } = useAccessibility();
  const { totalCoins, currentStreak } = useGamification();
  const isRtl = language === 'he';

  const categoryMeta: Record<
    ExerciseCategory,
    { title: { he: string; en: string }; icon: React.FC<{ className?: string }> }
  > = {
    memory: { title: { he: 'זיכרון עבודה', en: 'Working Memory' }, icon: Brain },
    attention: { title: { he: 'קשב חזותי', en: 'Visual Attention' }, icon: Eye },
    speed: { title: { he: 'מהירות עיבוד', en: 'Processing Speed' }, icon: Zap },
    language: { title: { he: 'שליפה מילולית', en: 'Language & Retrieval' }, icon: BookOpen },
  };

  const categories: ExerciseCategory[] = ['memory', 'attention', 'speed', 'language'];

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 flex flex-col items-center animate-fadeIn">
      {/* 1. Celebratory Header & Trophy */}
      <div className="relative mb-6">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl animate-bounce transition-transform ${
            highContrast
              ? 'bg-yellow-400 text-black border-4 border-yellow-300'
              : theme === 'dark'
              ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 text-white'
              : 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950'
          }`}
        >
          <Trophy className="w-12 h-12" />
        </div>
        <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full p-1.5 shadow-md">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-center tracking-tight mb-2">
        {language === 'he' ? 'האימון היומי הושלם בהצלחה!' : 'Workout Complete!'}
      </h1>

      <p
        className={`text-lg sm:text-xl text-center max-w-lg mb-8 font-medium ${
          highContrast ? 'text-yellow-200' : theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
        }`}
      >
        {language === 'he'
          ? 'כל הכבוד על ההתמדה! המוח שלך בונה קשרים עצביים חדשים ובריאים בכל יום מחדש.'
          : 'Outstanding consistency! Your brain is actively building healthy neural pathways every single day.'}
      </p>

      {/* 2. Key Rewards Stats (Sparks & Streak) */}
      <div className="grid grid-cols-2 gap-4 w-full mb-8">
        {/* Sparks / Coins Earned */}
        <div
          className={`p-5 rounded-2xl border text-center transition-all shadow-sm ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-amber-300'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-2xl">🪙</span>
            <span className="text-3xl sm:text-4xl font-black">
              +{workoutResult.session.coins_earned}
            </span>
          </div>
          <span className="text-sm font-bold opacity-80 uppercase tracking-wider block">
            {language === 'he' ? 'נקודות Sparks שנצברו' : 'Sparks Earned'}
          </span>
          <span className="text-xs font-semibold opacity-70 mt-1 block">
            {language === 'he' ? `סך הכל: ${totalCoins} 🪙` : `Total: ${totalCoins} 🪙`}
          </span>
        </div>

        {/* Consecutive Days Streak */}
        <div
          className={`p-5 rounded-2xl border text-center transition-all shadow-sm ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-orange-400'
              : 'bg-orange-50 border-orange-200 text-orange-900'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Flame className="w-8 h-8 text-orange-500 fill-orange-500 animate-pulse" />
            <span className="text-3xl sm:text-4xl font-black">{currentStreak}</span>
          </div>
          <span className="text-sm font-bold opacity-80 uppercase tracking-wider block">
            {language === 'he' ? 'ימי אימון ברצף' : 'Day Streak'}
          </span>
          <span className="text-xs font-semibold opacity-70 mt-1 block">
            {language === 'he' ? 'התמדה מעוררת השראה!' : 'Inspiring consistency!'}
          </span>
        </div>
      </div>

      {/* 3. DDA Category Progression Breakdown */}
      <div className="w-full mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-500" />
          <span>
            {language === 'he' ? 'התאמת רמות קוגניטיביות (DDA)' : 'Cognitive Levels Tuning (DDA)'}
          </span>
        </h2>

        <div className="space-y-3">
          {categories.map((cat) => {
            const meta = categoryMeta[cat];
            const Icon = meta.icon;
            const dda = workoutResult.ddaResults[cat];
            const prevLvl = dda?.previousLevel ?? 1;
            const newLvl = dda?.newLevel ?? prevLvl;
            const action = dda?.action ?? 'maintain';

            return (
              <div
                key={cat}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  highContrast
                    ? 'bg-black text-yellow-300 border-yellow-400'
                    : theme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 shadow-sm text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      highContrast
                        ? 'bg-yellow-400 text-black'
                        : theme === 'dark'
                        ? 'bg-slate-800 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-base block">{meta.title[language]}</span>
                    <span className="text-xs opacity-75 font-medium">
                      {dda?.reason[language] || (language === 'he' ? 'נשמרה רמה' : 'Maintained level')}
                    </span>
                  </div>
                </div>

                {/* Level Tag & Action indicator */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <div className="flex items-center gap-1.5 font-mono text-sm font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <span className="opacity-70">L{prevLvl}</span>
                    <span className="text-slate-400">➔</span>
                    <span className="text-blue-600 dark:text-blue-400 font-extrabold">L{newLvl}</span>
                  </div>

                  {action === 'promote' && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {language === 'he' ? 'עלייה' : 'Level Up'}
                    </span>
                  )}
                  {action === 'maintain' && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      <Minus className="w-3.5 h-3.5" />
                      {language === 'he' ? 'Flow' : 'Flow'}
                    </span>
                  )}
                  {action === 'demote' && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {language === 'he' ? 'הקלה' : 'Gentle'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Action Buttons (Return to Home & Family Club) */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {/* Primary Return to Home */}
        <button
          onClick={onReturnHome}
          className={`flex-1 min-h-[64px] px-8 py-4 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all transform active:scale-95 cursor-pointer ${
            highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300 font-black border-2 border-yellow-300'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
          }`}
        >
          <span>{language === 'he' ? 'חזרה לדף הבית' : 'Return to Home'}</span>
          {isRtl ? <ArrowLeft className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
        </button>

        {/* Secondary Family Club Button */}
        <button
          onClick={onOpenFamilyClub}
          className={`sm:w-auto min-h-[64px] px-6 py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 border-2 transition-all active:scale-95 cursor-pointer ${
            highContrast
              ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400/20'
              : theme === 'dark'
              ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
              : 'border-slate-300 hover:bg-slate-100 text-slate-700 shadow-sm'
          }`}
        >
          <span>{language === 'he' ? 'מועדון המשפחה 👥' : 'Family Club 👥'}</span>
        </button>
      </div>
    </div>
  );
};
