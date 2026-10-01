import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { calculateFamilyCoopProgress, type FamilyMemberStats } from '../../lib/gamificationEngine';
import { Sparkles, Trophy, BatteryCharging, Zap } from 'lucide-react';

interface CoopWeeklyGoalProps {
  members: FamilyMemberStats[];
  targetWeeklyCoins?: number; // default 2000
}

export const CoopWeeklyGoal: React.FC<CoopWeeklyGoalProps> = ({
  members,
  targetWeeklyCoins = 2000,
}) => {
  const { theme, highContrast, language } = useAccessibility();

  const { totalWeeklyCoins, targetWeeklyCoins: target, progressPercent, isGoalReached } =
    calculateFamilyCoopProgress(members, targetWeeklyCoins);

  return (
    <div
      className={`w-full p-5 sm:p-7 rounded-3xl border-2 shadow-lg transition-all ${
        highContrast
          ? 'bg-black text-yellow-300 border-yellow-400'
          : theme === 'dark'
          ? 'bg-gradient-to-br from-indigo-950/70 to-slate-900 border-indigo-800 text-slate-100'
          : 'bg-gradient-to-br from-indigo-50 to-blue-50/80 border-indigo-200 text-slate-800'
      }`}
    >
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              highContrast
                ? 'bg-yellow-400 text-black'
                : isGoalReached
                ? 'bg-amber-400 text-amber-950'
                : 'bg-indigo-600 text-white'
            }`}
          >
            {isGoalReached ? <Trophy className="w-6 h-6" /> : <BatteryCharging className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider block opacity-75">
              {language === 'he' ? 'שבוע נוכחי • יום א׳ עד שבת' : 'Current Week • Sun - Sat'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'he'
                ? `היעד המשפחתי השבועי: ${totalWeeklyCoins} מתוך ${target} Sparks`
                : `Family Weekly Goal: ${totalWeeklyCoins} / ${target} Sparks`}
            </h2>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 ${
            highContrast
              ? 'bg-yellow-400 text-black'
              : isGoalReached
              ? 'bg-emerald-500 text-white animate-pulse'
              : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
          }`}
        >
          {isGoalReached ? <Sparkles className="w-4 h-4 fill-current" /> : <Zap className="w-4 h-4" />}
          <span>{progressPercent}%</span>
        </div>
      </div>

      {/* Explanatory subtitle */}
      <p
        className={`text-base sm:text-lg font-medium mb-6 ${
          highContrast ? 'text-yellow-200' : theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
        }`}
      >
        {language === 'he'
          ? 'אנחנו לא מתחרים – כל אימון של כל בן משפחה מוסיף נקודות ישירות למד האנרגיה המשותף!'
          : 'We collaborate, not compete – every workout adds Sparks directly to our shared energy meter!'}
      </p>

      {/* Visual Energy Battery / Jar Meter */}
      <div className="relative w-full">
        <div
          role="progressbar"
          aria-valuenow={totalWeeklyCoins}
          aria-valuemin={0}
          aria-valuemax={target}
          aria-label={
            language === 'he'
              ? `התקדמות יעד שבועי: ${totalWeeklyCoins} מתוך ${target} נקודות`
              : `Weekly goal progress: ${totalWeeklyCoins} out of ${target} sparks`
          }
          className={`w-full h-10 sm:h-12 rounded-2xl overflow-hidden p-1.5 border-2 transition-all flex items-center relative ${
            highContrast
              ? 'bg-black border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-indigo-700/60'
              : 'bg-white border-indigo-200 shadow-inner'
          }`}
        >
          {/* Animated Fill Bar */}
          <div
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
            className={`h-full rounded-xl transition-all duration-700 ease-out flex items-center justify-end px-3 relative overflow-hidden ${
              highContrast
                ? 'bg-yellow-400 text-black'
                : isGoalReached
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 text-white'
                : 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 text-white'
            }`}
          >
            {/* Shimmer light effect */}
            <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
            <span className="text-xs sm:text-sm font-black whitespace-nowrap z-10">
              {progressPercent}%
            </span>
          </div>

          {/* Target Milestone Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 dark:bg-yellow-300 pointer-events-none opacity-60"
            style={{ left: '100%' }}
          />
        </div>

        {/* Milestone Sparks Indicators */}
        <div className="flex justify-between items-center text-xs sm:text-sm font-bold opacity-75 mt-2 px-1">
          <span>0 Sparks</span>
          <span>{Math.round(target * 0.5)} Sparks (50%)</span>
          <span className="font-black text-amber-500">{target} Sparks (יעד ⭐)</span>
        </div>
      </div>

      {/* Goal Reached Celebratory Callout */}
      {isGoalReached && (
        <div
          className={`mt-5 p-4 rounded-2xl border-2 flex items-center gap-3 animate-fadeIn ${
            highContrast
              ? 'bg-black text-yellow-300 border-yellow-400'
              : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
          }`}
        >
          <Trophy className="w-8 h-8 text-amber-500 shrink-0 animate-bounce" />
          <div className="text-right">
            <span className="font-black text-base sm:text-lg block">
              {language === 'he'
                ? 'איזה הישג ענק! המשפחה השיגה את היעד השבועי!'
                : 'Incredible achievement! The family reached the weekly goal!'}
            </span>
            <span className="text-xs sm:text-sm font-medium opacity-90">
              {language === 'he'
                ? 'המשיכו להתאמן לצבירת Sparks נוספים ושימור הרצף המשפחתי.'
                : 'Keep training to earn extra Sparks and maintain our family streak.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
