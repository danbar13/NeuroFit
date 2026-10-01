import type { Language } from '../i18n/translations';

export type FontSizeOption = 1.0 | 1.25 | 1.5 | 1.75;
export type DisplayTheme = 'light' | 'dark' | 'high-contrast';

export interface AccessibilityState {
  fontSizeMultiplier: FontSizeOption;
  theme: DisplayTheme;
  highContrast: boolean; // Convenience boolean (theme === 'high-contrast')
  reduceAnimations: boolean;
  soundEnabled: boolean;
  language: Language;
  setFontSizeMultiplier: (size: FontSizeOption) => void;
  setTheme: (theme: DisplayTheme) => void;
  toggleTheme: () => void;
  setHighContrast: (enabled: boolean) => void;
  setReduceAnimations: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  resetToDefaults: () => void;
}
