import React from 'react';
import { Play, LogOut, Coffee } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onExit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ isOpen, onResume, onExit }) => {
  const { theme, highContrast, soundEnabled, t } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-4 text-center transition-all ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 text-slate-100 border-slate-700'
            : 'bg-white text-gray-900 border-blue-200'
        }`}
      >
        <div
          className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${
            highContrast
              ? 'bg-yellow-400 text-black'
              : theme === 'dark'
              ? 'bg-blue-900/60 text-blue-300'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          <Coffee className="w-10 h-10" />
        </div>

        <h2 id="pause-modal-title" className="text-3xl font-extrabold mb-3">
          {t.pausedTitle}
        </h2>
        <p className="text-xl text-current/80 mb-8 max-w-sm mx-auto">
          {t.pausedDesc}
        </p>

        <div className="space-y-4">
          <button
            onClick={() => {
              audioManager.playSuccess(soundEnabled);
              onResume();
            }}
            className={`w-full min-h-[68px] px-6 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg transition-transform active:scale-95 ${
              highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : theme === 'dark'
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-blue-800 text-white hover:bg-blue-900'
            }`}
          >
            <Play className="w-7 h-7 fill-current rtl:rotate-180" />
            <span>{t.resume}</span>
          </button>

          <button
            onClick={() => {
              audioManager.playTap(soundEnabled);
              onExit();
            }}
            className={`w-full min-h-[64px] px-6 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 border-2 transition-transform active:scale-95 ${
              highContrast
                ? 'bg-gray-900 text-white border-gray-700 hover:border-yellow-400'
                : theme === 'dark'
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
          >
            <LogOut className="w-6 h-6" />
            <span>{t.exitSession}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
