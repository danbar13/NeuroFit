import React, { useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import type { SessionRewardResult } from '../../lib/gamificationEngine';
import { Coins, Flame, Sparkles, Check, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CoinRewardModalProps {
  reward: SessionRewardResult | null;
  onClose: () => void;
}

export const CoinRewardModal: React.FC<CoinRewardModalProps> = ({ reward, onClose }) => {
  const { theme, highContrast, reduceAnimations, soundEnabled, language } = useAccessibility();

  useEffect(() => {
    if (!reward) return;
    audioManager.playSuccess(soundEnabled);
    if (!reduceAnimations) {
      try {
        confetti({
          particleCount: reward.streakBonus > 0 ? 60 : 35,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [reward, reduceAnimations, soundEnabled]);

  if (!reward) return null;

  const isHe = language === 'he';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="coin-reward-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-4 text-center transition-all animate-fade-in ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 text-slate-100 border-amber-500/50'
            : 'bg-white text-gray-900 border-amber-300'
        }`}
      >
        {/* Animated Coin Badge (Calm, no visual clutter) */}
        <div
          className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-5 shadow-lg ${
            highContrast
              ? 'bg-yellow-400 text-black'
              : 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-white'
          }`}
        >
          <Coins className="w-14 h-14 animate-pulse" />
        </div>

        <h2 id="coin-reward-title" className="text-3xl sm:text-4xl font-black mb-2">
          {isHe ? 'כל הכבוד על האימון!' : 'Great Job on Completing!'}
        </h2>
        <p className="text-lg sm:text-xl opacity-80 mb-6">
          {isHe ? 'התמדת היום והמוח שלך מודה לך.' : 'You stayed consistent today and your brain thanks you.'}
        </p>

        {/* Reward Breakdown Cards */}
        <div className="space-y-3 mb-6 text-start">
          {/* Base Coins (+50) */}
          <div
            className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
              highContrast
                ? 'bg-gray-900 border-yellow-400 text-yellow-300'
                : theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-amber-300'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-amber-500 shrink-0" />
              <div>
                <span className="font-bold text-lg block">
                  {isHe ? 'סיום אימון יומי' : 'Daily Workout Completed'}
                </span>
                <span className="text-sm opacity-80">
                  {isHe ? 'בונוס אימון בסיסי' : 'Base workout reward'}
                </span>
              </div>
            </div>
            <span className="text-2xl font-black">+{reward.baseCoins} 🪙</span>
          </div>

          {/* 7-Day Streak Bonus (+200) */}
          {reward.streakBonus > 0 && (
            <div
              className={`p-4 rounded-2xl border-2 flex items-center justify-between animate-bounce-short ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 font-extrabold'
                  : theme === 'dark'
                  ? 'bg-rose-950/80 border-rose-600 text-rose-200'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <Gift className="w-7 h-7 text-rose-500 shrink-0" />
                <div>
                  <span className="font-bold text-lg block">
                    {isHe ? 'בונוס ענק: 7 ימי רצף! 🔥' : 'Huge Bonus: 7-Day Streak! 🔥'}
                  </span>
                  <span className="text-sm opacity-80">
                    {isHe ? 'שבוע מלא של התמדה' : 'Full week of consistency'}
                  </span>
                </div>
              </div>
              <span className="text-2xl font-black">+{reward.streakBonus} 🪙</span>
            </div>
          )}

          {/* New Totals */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-around text-center ${
              highContrast
                ? 'border-gray-700 bg-gray-950 text-white'
                : theme === 'dark'
                ? 'border-slate-800 bg-slate-950 text-slate-200'
                : 'border-slate-200 bg-slate-50 text-slate-800'
            }`}
          >
            <div>
              <span className="text-xs uppercase block opacity-70">
                {isHe ? 'סך מטבעות' : 'Total Coins'}
              </span>
              <span className="text-xl font-black flex items-center justify-center gap-1">
                <span>{reward.newTotalCoins}</span>
                <Coins className="w-5 h-5 text-amber-500 inline" />
              </span>
            </div>
            <div className="h-8 w-px bg-current/20" />
            <div>
              <span className="text-xs uppercase block opacity-70">
                {isHe ? 'רצף ימים' : 'Day Streak'}
              </span>
              <span className="text-xl font-black flex items-center justify-center gap-1 text-orange-500">
                <span>{reward.newStreak}</span>
                <Flame className="w-5 h-5 fill-orange-500 inline" />
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            audioManager.playTap(soundEnabled);
            onClose();
          }}
          className={`w-full min-h-[64px] px-8 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${
            highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300 ring-2 ring-yellow-400'
              : 'bg-emerald-700 text-white hover:bg-emerald-800 ring-4 ring-emerald-600/30'
          }`}
        >
          <Check className="w-7 h-7" />
          <span>{isHe ? 'איזה יופי, תודה!' : 'Awesome, Thank You!'}</span>
        </button>
      </div>
    </div>
  );
};
