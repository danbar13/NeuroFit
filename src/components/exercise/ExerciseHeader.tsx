import React from 'react';
import { Pause, Eye, Sun, Moon, Zap, Settings as SettingsIcon, Home, Brain } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import { FlagIcon } from '../common/FlagIcon';

import { useGamification } from '../../context/GamificationContext';
import { Coins, Flame } from 'lucide-react';

interface ExerciseHeaderProps {
  currentStep?: number;
  totalSteps?: number;
  onPause?: () => void;
  onHome?: () => void;
  isHome?: boolean;
  onOpenAccessibility: () => void;
  onOpenGamification?: () => void;
  onOpenSettings?: () => void;
  title?: string;
  hideProgress?: boolean;
}

export const ExerciseHeader: React.FC<ExerciseHeaderProps> = ({
  currentStep = 1,
  totalSteps = 4,
  onPause,
  onHome,
  isHome = false,
  onOpenAccessibility,
  onOpenGamification,
  onOpenSettings,
  title,
  hideProgress = false,
}) => {
  const { theme, highContrast, soundEnabled, language, toggleLanguage, toggleTheme, t } = useAccessibility();
  const { totalCoins, currentStreak } = useGamification();

  return (
    <header
      className={`sticky top-0 z-50 w-full px-2.5 sm:px-6 py-2.5 sm:py-3 border-b-2 shadow-sm transition-colors ${
        highContrast
          ? 'bg-black text-white border-yellow-400'
          : theme === 'dark'
          ? 'bg-slate-900 text-slate-100 border-slate-800'
          : 'bg-white text-gray-900 border-gray-200'
      }`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left Navigation Area: Home Button / Pause Button / Brand Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* If Home screen: show prominent NeuroFit brand pill */}
          {isHome ? (
            <div
              className={`w-9 h-9 sm:w-auto sm:min-h-[64px] p-1.5 sm:px-4 rounded-xl sm:rounded-2xl flex items-center justify-center font-black gap-2 border-2 shrink-0 ${
                highContrast
                  ? 'bg-black text-yellow-300 border-yellow-400'
                  : theme === 'dark'
                  ? 'bg-slate-800 text-blue-400 border-slate-700'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              <Brain className="w-5 h-5 sm:w-7 sm:h-7 shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline text-base sm:text-lg font-black tracking-tight">NeuroFit</span>
            </div>
          ) : (
            <>
              {/* Return to Home Button */}
              {onHome && (
                <button
                  onClick={() => {
                    audioManager.playTap(soundEnabled);
                    onHome();
                  }}
                  aria-label={t.home || (language === 'he' ? 'דף הבית' : 'Home')}
                  title={t.home || (language === 'he' ? 'דף הבית' : 'Home')}
                  className={`w-9 h-9 sm:w-auto sm:min-w-[64px] sm:min-h-[64px] p-1.5 sm:px-4 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold gap-2 border-2 transition-transform active:scale-95 cursor-pointer shadow-sm shrink-0 ${
                    highContrast
                      ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                      : theme === 'dark'
                      ? 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700'
                      : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <Home className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="hidden sm:inline text-sm sm:text-base font-extrabold">{t.home || (language === 'he' ? 'דף הבית' : 'Home')}</span>
                </button>
              )}

              {/* Pause Button (for active training session) */}
              {onPause && (
                <button
                  onClick={() => {
                    audioManager.playTap(soundEnabled);
                    onPause();
                  }}
                  aria-label={t.pause}
                  title={t.pause}
                  className={`w-9 h-9 sm:w-auto sm:min-w-[64px] sm:min-h-[64px] p-1.5 sm:px-3 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold gap-2 border-2 transition-transform active:scale-95 cursor-pointer shadow-sm shrink-0 ${
                    highContrast
                      ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-400/20'
                      : theme === 'dark'
                      ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Pause className="w-5 h-5 sm:w-7 sm:h-7 shrink-0" />
                  <span className="hidden lg:inline text-base">{t.pause}</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Center: Non-continuous Progress Indicator or Title */}
        {!hideProgress ? (
          <div className="flex flex-col items-center justify-center min-w-0">
            <div
              className="flex items-center gap-1 sm:gap-2.5"
              role="progressbar"
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
              aria-label={t.stepOf.replace('{current}', currentStep.toString()).replace('{total}', totalSteps.toString())}
            >
              {Array.from({ length: totalSteps }, (_, i) => {
                const stepNumber = i + 1;
                const isFilled = stepNumber <= currentStep;
                const isCurrent = stepNumber === currentStep;

                return (
                  <div
                    key={stepNumber}
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-all ${
                      isFilled
                        ? highContrast
                          ? 'bg-yellow-400 text-black border-yellow-400'
                          : theme === 'dark'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-blue-800 text-white border-blue-900'
                        : highContrast
                        ? 'bg-black text-gray-400 border-gray-600'
                        : theme === 'dark'
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-gray-100 text-gray-500 border-gray-300'
                    } ${isCurrent ? 'ring-2 sm:ring-4 ring-amber-400/50 scale-105' : ''}`}
                  >
                    {stepNumber}
                  </div>
                );
              })}
            </div>
            <span className="text-[10px] sm:text-xs font-semibold tracking-wide mt-1 opacity-80 text-center truncate max-w-[130px] sm:max-w-none">
              {t.stepOf.replace('{current}', currentStep.toString()).replace('{total}', totalSteps.toString())} {title ? `• ${title}` : ''}
            </span>
          </div>
        ) : isHome ? null : (
          <div className="font-extrabold text-sm sm:text-xl tracking-tight text-center truncate max-w-[130px] sm:max-w-none">
            {title || 'NeuroFit'}
          </div>
        )}

        {/* Right Controls: Gamification Hub + Flag + Theme + Accessibility */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Gamification Hub (Coins & Streak) - Only rendered when onOpenGamification is provided */}
          {onOpenGamification && (
            <button
              onClick={() => {
                audioManager.playTap(soundEnabled);
                onOpenGamification();
              }}
              aria-label="מועדון המוח המשפחתי, מטבעות ורצף"
              title={language === 'he' ? 'מועדון המוח המשפחתי, מטבעות ורצף' : 'Family Brain Club, Coins & Streak'}
              className={`h-9 sm:h-auto sm:min-h-[64px] px-1.5 sm:px-3 rounded-xl sm:rounded-2xl flex items-center gap-1 sm:gap-2 border-2 font-black transition-transform active:scale-95 shrink-0 ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                  : theme === 'dark'
                  ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Coins className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-500 fill-amber-400 shrink-0" />
                <span className="text-xs sm:text-base font-extrabold">{totalCoins}</span>
              </div>
              <span className="hidden sm:inline opacity-30">|</span>
              <div className="hidden sm:flex items-center gap-1 text-rose-500">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500 shrink-0" />
                <span className="text-xs sm:text-base font-extrabold">{currentStreak}</span>
              </div>
            </button>
          )}

          {/* Flag Language Switcher */}
          <button
            onClick={() => {
              audioManager.playTap(soundEnabled);
              toggleLanguage();
            }}
            aria-label={`Switch language to ${language === 'he' ? 'English' : 'Hebrew'}`}
            title={`Switch language (${language === 'he' ? 'English' : 'עברית'})`}
            className={`w-9 h-9 sm:w-auto sm:min-w-[64px] sm:min-h-[64px] p-1 sm:px-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 border-2 transition-transform active:scale-95 shrink-0 ${
              highContrast
                ? 'bg-black border-yellow-400 text-yellow-300 hover:bg-yellow-400/20'
                : theme === 'dark'
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-100'
                : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <FlagIcon country={language} className="w-5 h-3.5 sm:w-8 sm:h-6 shrink-0" />
            <span className="hidden sm:inline text-sm font-bold">{language === 'he' ? 'עב' : 'EN'}</span>
          </button>

          {/* Quick Theme Switcher (Light / Dark / High Contrast) */}
          <button
            onClick={() => {
              audioManager.playTap(soundEnabled);
              toggleTheme();
            }}
            aria-label="Toggle display theme"
            title="Toggle theme (Light / Dark / High Contrast)"
            className={`w-9 h-9 sm:w-auto sm:min-w-[64px] sm:min-h-[64px] p-1.5 sm:px-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 transition-transform active:scale-95 shrink-0 ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : theme === 'dark'
                ? 'bg-slate-800 text-yellow-400 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {highContrast ? (
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 fill-current shrink-0" />
            ) : theme === 'dark' ? (
              <Moon className="w-4 h-4 sm:w-6 sm:h-6 fill-current shrink-0" />
            ) : (
              <Sun className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500 fill-amber-400 shrink-0" />
            )}
          </button>

          {/* Accessibility Modal Trigger */}
          <button
            onClick={() => {
              audioManager.playTap(soundEnabled);
              onOpenAccessibility();
            }}
            aria-label={t.display}
            title={t.display}
            className={`w-9 h-9 sm:w-auto sm:min-w-[64px] sm:min-h-[64px] p-1.5 sm:px-3 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold gap-1.5 border-2 transition-transform active:scale-95 shrink-0 ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : theme === 'dark'
                ? 'bg-blue-900/50 text-blue-300 border-blue-700 hover:bg-blue-900/80'
                : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Eye className="w-4 h-4 sm:w-7 sm:h-7 shrink-0" />
            <span className="hidden lg:inline text-base">{t.display}</span>
          </button>

          {/* Settings Screen Trigger - Only when onOpenSettings provided, hidden on mobile home if isHome */}
          {onOpenSettings && (
            <button
              onClick={() => {
                audioManager.playTap(soundEnabled);
                onOpenSettings();
              }}
              aria-label={language === 'he' ? 'הגדרות ופרופיל' : 'Settings & Profile'}
              title={language === 'he' ? 'הגדרות ופרופיל' : 'Settings & Profile'}
              className={`w-11 h-11 sm:w-auto sm:min-w-[64px] min-h-[44px] sm:min-h-[64px] p-2 sm:px-3 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold gap-1.5 border-2 transition-transform active:scale-95 shrink-0 ${
                isHome ? 'hidden sm:flex' : 'flex'
              } ${
                highContrast
                  ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-400/20'
                  : theme === 'dark'
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <SettingsIcon className="w-5 h-5 sm:w-7 sm:h-7 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
