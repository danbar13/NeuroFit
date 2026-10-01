import React, { useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import type { UserBadge } from '../../types/database';
import { Sun, Flame, Brain, Sparkles, Check, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BadgeUnlockedModalProps {
  badge: UserBadge | null;
  onClose: () => void;
}

export const BadgeUnlockedModal: React.FC<BadgeUnlockedModalProps> = ({ badge, onClose }) => {
  const { theme, highContrast, reduceAnimations, soundEnabled, language } = useAccessibility();

  useEffect(() => {
    if (!badge) return;
    audioManager.playSuccess(soundEnabled);
    if (!reduceAnimations) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }
    }
  }, [badge, reduceAnimations, soundEnabled]);

  if (!badge) return null;

  const isHe = language === 'he';

  const renderIcon = () => {
    switch (badge.icon_name) {
      case 'Sun':
        return <Sun className="w-16 h-16 text-amber-500 fill-amber-400 animate-spin-slow" />;
      case 'Flame':
        return <Flame className="w-16 h-16 text-rose-500 fill-rose-500 animate-bounce-short" />;
      case 'Brain':
        return <Brain className="w-16 h-16 text-indigo-500" />;
      default:
        return <Trophy className="w-16 h-16 text-yellow-500" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-unlocked-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 text-center transition-all animate-fade-in ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 text-slate-100 border-amber-500/50'
            : 'bg-white text-gray-900 border-amber-300'
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-amber-500 font-extrabold uppercase text-sm tracking-widest mb-3">
          <Sparkles className="w-5 h-5" />
          <span>{isHe ? 'תג הישג חדש נפתח!' : 'New Achievement Badge!'}</span>
          <Sparkles className="w-5 h-5" />
        </div>

        {/* Badge Icon */}
        <div
          className={`w-28 h-28 mx-auto rounded-3xl flex items-center justify-center mb-5 shadow-lg border-2 ${
            highContrast
              ? 'bg-gray-900 border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-800 border-slate-700'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          {renderIcon()}
        </div>

        <h2 id="badge-unlocked-title" className="text-3xl font-black mb-2">
          {badge.badge_name}
        </h2>
        <p className="text-lg opacity-85 mb-8">
          {badge.badge_description}
        </p>

        {/* Action Button */}
        <button
          onClick={() => {
            audioManager.playTap(soundEnabled);
            onClose();
          }}
          className={`w-full min-h-[64px] px-8 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${
            highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300 ring-2 ring-yellow-400'
              : 'bg-blue-800 text-white hover:bg-blue-900 ring-4 ring-blue-600/30'
          }`}
        >
          <Check className="w-7 h-7" />
          <span>{isHe ? 'קבל את התג בגאווה' : 'Collect Badge'}</span>
        </button>
      </div>
    </div>
  );
};
