import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import type { FontSizeOption, DisplayTheme } from '../../types/accessibility';
import { X, Volume2, VolumeX, Eye, Sparkles, ZoomIn, Check, Sun, Moon, Zap, Globe } from 'lucide-react';
import { audioManager } from '../../lib/soundEffects';
import { FlagIcon } from '../common/FlagIcon';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const {
    fontSizeMultiplier,
    theme,
    highContrast,
    reduceAnimations,
    soundEnabled,
    language,
    t,
    setFontSizeMultiplier,
    setTheme,
    setReduceAnimations,
    setSoundEnabled,
    setLanguage,
    resetToDefaults,
  } = useAccessibility();

  if (!isOpen) return null;

  const fontOptions: { label: string; value: FontSizeOption; sample: string }[] = [
    { label: t.sizeNormal, value: 1.0, sample: 'Aa' },
    { label: t.sizeLarge, value: 1.25, sample: 'Aa+' },
    { label: t.sizeExtraLarge, value: 1.5, sample: 'AA' },
    { label: t.sizeMax, value: 1.75, sample: 'AA+' },
  ];

  const themeOptions: { label: string; value: DisplayTheme; icon: React.ReactNode }[] = [
    { label: t.themeLight, value: 'light', icon: <Sun className="w-6 h-6 text-amber-500 fill-amber-400" /> },
    { label: t.themeDark, value: 'dark', icon: <Moon className="w-6 h-6 text-indigo-400 fill-current" /> },
    { label: t.themeHighContrast, value: 'high-contrast', icon: <Zap className="w-6 h-6 text-yellow-400 fill-current" /> },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
    >
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl p-5 sm:p-8 shadow-2xl transition-all border-4 ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 text-slate-100 border-slate-700'
            : 'bg-white text-gray-900 border-blue-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-current/20 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                highContrast
                  ? 'bg-yellow-400 text-black'
                  : theme === 'dark'
                  ? 'bg-blue-900/60 text-blue-300'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <h2
                id="accessibility-modal-title"
                className="text-2xl sm:text-3xl font-bold tracking-tight"
              >
                {t.accessibilityTitle}
              </h2>
              <p className="text-base text-current/80">{t.instantChanges}</p>
            </div>
          </div>

          <button
            onClick={() => {
              audioManager.playTap(soundEnabled);
              onClose();
            }}
            aria-label={t.close}
            className={`min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] rounded-2xl flex items-center justify-center font-bold text-lg border-2 transition-transform active:scale-95 ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : theme === 'dark'
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
            }`}
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Scrollable Content Options */}
        <div className="py-4 space-y-6 overflow-y-auto flex-1 pr-1">
          {/* 1. Language Selection (Flags) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-current/80" />
              <label className="text-xl font-bold">{t.languageSelect}</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  audioManager.playTap(soundEnabled);
                  setLanguage('he');
                }}
                className={`min-h-[64px] px-4 py-3 rounded-2xl flex items-center justify-center gap-3 border-3 text-lg font-bold transition-all ${
                  language === 'he'
                    ? highContrast
                      ? 'bg-yellow-400 text-black border-yellow-300 ring-4 ring-yellow-400/50'
                      : theme === 'dark'
                      ? 'bg-blue-600 text-white border-blue-500 ring-4 ring-blue-500/30'
                      : 'bg-blue-800 text-white border-blue-900 ring-4 ring-blue-600/30'
                    : highContrast
                    ? 'bg-gray-900 text-white border-gray-700 hover:border-yellow-400'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-slate-200 border-slate-700'
                    : 'bg-gray-50 text-gray-800 border-gray-300 hover:border-blue-400'
                }`}
              >
                <FlagIcon country="he" className="w-8 h-6" />
                <span>{t.langHebrew}</span>
                {language === 'he' && <Check className="w-6 h-6 shrink-0" />}
              </button>

              <button
                onClick={() => {
                  audioManager.playTap(soundEnabled);
                  setLanguage('en');
                }}
                className={`min-h-[64px] px-4 py-3 rounded-2xl flex items-center justify-center gap-3 border-3 text-lg font-bold transition-all ${
                  language === 'en'
                    ? highContrast
                      ? 'bg-yellow-400 text-black border-yellow-300 ring-4 ring-yellow-400/50'
                      : theme === 'dark'
                      ? 'bg-blue-600 text-white border-blue-500 ring-4 ring-blue-500/30'
                      : 'bg-blue-800 text-white border-blue-900 ring-4 ring-blue-600/30'
                    : highContrast
                    ? 'bg-gray-900 text-white border-gray-700 hover:border-yellow-400'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-slate-200 border-slate-700'
                    : 'bg-gray-50 text-gray-800 border-gray-300 hover:border-blue-400'
                }`}
              >
                <FlagIcon country="en" className="w-8 h-6" />
                <span>{t.langEnglish}</span>
                {language === 'en' && <Check className="w-6 h-6 shrink-0" />}
              </button>
            </div>
          </div>

          {/* 2. Display Theme (Light / Dark / High Contrast) */}
          <div className="pt-3 border-t-2 border-current/15 space-y-3">
            <label className="text-xl font-bold block">{t.displayTheme}</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themeOptions.map((opt) => {
                const isSelected = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      audioManager.playTap(soundEnabled);
                      setTheme(opt.value);
                    }}
                    className={`min-h-[64px] px-4 py-2 rounded-2xl flex items-center justify-between border-3 font-bold transition-all ${
                      isSelected
                        ? highContrast
                          ? 'bg-yellow-400 text-black border-yellow-300 ring-4 ring-yellow-400/50'
                          : theme === 'dark'
                          ? 'bg-blue-600 text-white border-blue-500 ring-4 ring-blue-500/30'
                          : 'bg-blue-800 text-white border-blue-900 ring-4 ring-blue-600/30'
                        : highContrast
                        ? 'bg-gray-900 text-white border-gray-700 hover:border-yellow-400'
                        : theme === 'dark'
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-gray-50 text-gray-800 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <span className="text-base">{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-5 h-5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Font Size Multiplier */}
          <div className="pt-3 border-t-2 border-current/15 space-y-3">
            <div className="flex items-center gap-2">
              <ZoomIn className="w-6 h-6 text-current/80" />
              <label className="text-xl font-bold">{t.textSize}</label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fontOptions.map((opt) => {
                const isSelected = fontSizeMultiplier === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      audioManager.playTap(soundEnabled);
                      setFontSizeMultiplier(opt.value);
                    }}
                    className={`min-h-[64px] px-4 py-3 rounded-2xl flex items-center justify-between border-3 text-start transition-all ${
                      isSelected
                        ? highContrast
                          ? 'bg-yellow-400 text-black font-extrabold border-yellow-300 ring-4 ring-yellow-400/50'
                          : theme === 'dark'
                          ? 'bg-blue-600 text-white border-blue-500 ring-4 ring-blue-500/30'
                          : 'bg-blue-800 text-white font-bold border-blue-900 ring-4 ring-blue-600/30'
                        : highContrast
                        ? 'bg-gray-900 text-white border-gray-700 hover:border-yellow-400'
                        : theme === 'dark'
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-gray-50 text-gray-800 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    <div>
                      <div className="text-base sm:text-lg font-semibold">{opt.label}</div>
                      <span className="text-xs sm:text-sm opacity-75 font-mono">{opt.sample} {t.previewText}</span>
                    </div>
                    {isSelected && <Check className="w-6 h-6 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Reduced Motion */}
          <div className="pt-3 border-t-2 border-current/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 mt-1 text-current/80" />
                <div>
                  <span className="text-xl font-bold block">{t.reduceAnimationsTitle}</span>
                  <span className="text-base text-current/75">
                    {t.reduceAnimationsDesc}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  audioManager.playTap(soundEnabled);
                  setReduceAnimations(!reduceAnimations);
                }}
                role="switch"
                aria-checked={reduceAnimations}
                className={`min-h-[58px] min-w-[130px] px-6 rounded-2xl font-bold text-lg border-2 flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                  reduceAnimations
                    ? highContrast
                      ? 'bg-yellow-400 text-black border-yellow-300'
                      : theme === 'dark'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-blue-800 text-white border-blue-900'
                    : highContrast
                    ? 'bg-gray-900 text-white border-gray-700'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-gray-200 text-gray-800 border-gray-400'
                }`}
              >
                {reduceAnimations ? t.on : t.off}
              </button>
            </div>
          </div>

          {/* 5. Sound & Audio Guidance */}
          <div className="pt-3 border-t-2 border-current/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-6 h-6 mt-1 text-current/80" />
                ) : (
                  <VolumeX className="w-6 h-6 mt-1 text-current/80" />
                )}
                <div>
                  <span className="text-xl font-bold block">{t.soundCuesTitle}</span>
                  <span className="text-base text-current/75">
                    {t.soundCuesDesc}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  if (next) audioManager.playSuccess(true);
                }}
                role="switch"
                aria-checked={soundEnabled}
                className={`min-h-[58px] min-w-[130px] px-6 rounded-2xl font-bold text-lg border-2 flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                  soundEnabled
                    ? highContrast
                      ? 'bg-yellow-400 text-black border-yellow-300'
                      : theme === 'dark'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-blue-800 text-white border-blue-900'
                    : highContrast
                    ? 'bg-gray-900 text-white border-gray-700'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-gray-200 text-gray-800 border-gray-400'
                }`}
              >
                {soundEnabled ? t.on : t.off}
              </button>
            </div>
          </div>
        </div>

        {/* Pinned Footer with Reset & Done */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-current/20 shrink-0">
          <button
            onClick={() => {
              audioManager.playTap(soundEnabled);
              resetToDefaults();
            }}
            className="min-h-[56px] px-4 py-2 rounded-2xl font-semibold text-lg underline hover:opacity-80"
          >
            {t.resetDefaults}
          </button>

          <button
            onClick={() => {
              audioManager.playSuccess(soundEnabled);
              onClose();
            }}
            className={`w-full sm:w-auto min-h-[64px] min-w-[180px] px-8 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${
              highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300 ring-2 ring-yellow-400'
                : theme === 'dark'
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-blue-800 text-white hover:bg-blue-900'
            }`}
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};
