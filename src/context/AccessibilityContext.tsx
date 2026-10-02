import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AccessibilityState, FontSizeOption, DisplayTheme } from '../types/accessibility';
import { translations, type Language } from '../i18n/translations';
import { settingsService } from '../lib/settingsService';

const STORAGE_KEY = 'neurofit_accessibility_settings_v2';

const DEFAULT_STATE = {
  fontSizeMultiplier: 1.25 as FontSizeOption,
  theme: 'dark' as DisplayTheme,
  reduceAnimations: false,
  soundEnabled: true,
  language: 'he' as Language,
};

interface AccessibilityContextExtended extends AccessibilityState {
  t: typeof translations['he'];
}

const AccessibilityContext = createContext<AccessibilityContextExtended | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSizeMultiplier, setFontSizeMultiplierState] = useState<FontSizeOption>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fontSizeMultiplier) return parsed.fontSizeMultiplier;
      }
    } catch {
      // fallback
    }
    return DEFAULT_STATE.fontSizeMultiplier;
  });

  const [theme, setThemeState] = useState<DisplayTheme>(() => {
    // Requirements: "בכניסה לאפליקציה - תמיד במצב כהה."
    // Every entry/launch into the app starts in dark mode.
    // Within the same active tab session, remember the user's manual switch.
    try {
      const activeSessionTheme = sessionStorage.getItem('neurofit_active_theme');
      if (activeSessionTheme === 'light' || activeSessionTheme === 'dark' || activeSessionTheme === 'high-contrast') {
        return activeSessionTheme as DisplayTheme;
      }
    } catch {
      // fallback
    }
    return 'dark';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language === 'en' || parsed.language === 'he') return parsed.language;
      }
    } catch {
      // fallback
    }
    return DEFAULT_STATE.language;
  });

  const [reduceAnimations, setReduceAnimationsState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.reduceAnimations === 'boolean') return parsed.reduceAnimations;
      }
    } catch {
      // fallback
    }
    return DEFAULT_STATE.reduceAnimations;
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.soundEnabled === 'boolean') return parsed.soundEnabled;
      }
    } catch {
      // fallback
    }
    return DEFAULT_STATE.soundEnabled;
  });

  const highContrast = theme === 'high-contrast';

  // Apply to DOM in real-time
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-scale', fontSizeMultiplier.toString());

    // Update RTL / LTR direction and lang
    root.setAttribute('dir', language === 'he' ? 'rtl' : 'ltr');
    root.setAttribute('lang', language);

    // Clean up theme classes
    root.classList.remove('light', 'dark', 'high-contrast');
    root.classList.add(theme);

    if (reduceAnimations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Persist to local storage and sync to Accessibility_Settings in database
    try {
      sessionStorage.setItem('neurofit_active_theme', theme);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          fontSizeMultiplier,
          theme,
          reduceAnimations,
          soundEnabled,
          language,
        })
      );
      // Auto-save to database in background
      settingsService.saveAccessibilitySettings('user_sarah', {
        font_size_multiplier: fontSizeMultiplier,
        high_contrast: theme === 'high-contrast',
        reduce_animations: reduceAnimations,
        sound_enabled: soundEnabled,
      });
    } catch {
      // ignore
    }
  }, [fontSizeMultiplier, theme, reduceAnimations, soundEnabled, language]);

  const setFontSizeMultiplier = (size: FontSizeOption) => {
    setFontSizeMultiplierState(size);
  };

  const setTheme = (newTheme: DisplayTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'high-contrast';
      return 'light';
    });
  };

  const setHighContrast = (enabled: boolean) => {
    setThemeState(enabled ? 'high-contrast' : 'light');
  };

  const setReduceAnimations = (enabled: boolean) => {
    setReduceAnimationsState(enabled);
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'he' ? 'en' : 'he'));
  };

  const resetToDefaults = () => {
    setFontSizeMultiplierState(DEFAULT_STATE.fontSizeMultiplier);
    setThemeState(DEFAULT_STATE.theme);
    setReduceAnimationsState(DEFAULT_STATE.reduceAnimations);
    setSoundEnabledState(DEFAULT_STATE.soundEnabled);
    setLanguageState(DEFAULT_STATE.language);
  };

  const t = translations[language];

  return (
    <AccessibilityContext.Provider
      value={{
        fontSizeMultiplier,
        theme,
        highContrast,
        reduceAnimations,
        soundEnabled,
        language,
        t,
        setFontSizeMultiplier,
        setTheme,
        toggleTheme,
        setHighContrast,
        setReduceAnimations,
        setSoundEnabled,
        setLanguage,
        toggleLanguage,
        resetToDefaults,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextExtended => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
