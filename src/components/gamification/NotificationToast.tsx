import React, { useEffect } from 'react';
import type { FamilyNotification } from '../../types/database';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { Heart, X } from 'lucide-react';

interface NotificationToastProps {
  notification: FamilyNotification | null;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  const { highContrast, soundEnabled, language } = useAccessibility();

  useEffect(() => {
    if (notification) {
      audioManager.playSuccess(soundEnabled);
      const timer = setTimeout(() => {
        onDismiss();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification, soundEnabled, onDismiss]);

  if (!notification) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-20 inset-x-4 max-w-lg mx-auto z-50 animate-bounce-short"
    >
      <div
        className={`p-4 sm:p-5 rounded-2xl border-3 shadow-2xl flex items-center justify-between gap-4 transition-all ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-indigo-900 text-white border-indigo-400'
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-3 bg-yellow-400 text-black rounded-2xl shrink-0 shadow-md">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <div className="min-w-0">
            <span className="text-xs uppercase tracking-wider font-extrabold opacity-80 block">
              {language === 'he' ? 'חיזוק משפחתי חדש!' : 'Family Cheer Received!'}
            </span>
            <p className="text-base sm:text-lg font-bold break-words">{notification.message}</p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          aria-label={language === 'he' ? 'סגור הודעה' : 'Close notification'}
          className="min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
