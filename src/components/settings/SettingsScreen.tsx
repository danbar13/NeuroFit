import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { settingsService } from '../../lib/settingsService';
import type { UserProfile, FamilyGroup } from '../../types/database';
import type { FontSizeOption, DisplayTheme } from '../../types/accessibility';
import { audioManager } from '../../lib/soundEffects';
import { FlagIcon } from '../common/FlagIcon';
import {
  ArrowRight,
  ArrowLeft,
  User,
  Users,
  Eye,
  Type,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sun,
  Moon,
  Check,
  ShieldCheck,
  Home,
} from 'lucide-react';

interface SettingsScreenProps {
  currentUser?: UserProfile | null;
  onReturnToHome: () => void;
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentUser,
  onReturnToHome,
  onLogout,
}) => {
  const {
    fontSizeMultiplier,
    theme,
    highContrast,
    reduceAnimations,
    soundEnabled,
    language,
    setFontSizeMultiplier,
    setTheme,
    setReduceAnimations,
    setSoundEnabled,
    setLanguage,
  } = useAccessibility();

  const isRtl = language === 'he';

  // 1. User Profile State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [birthYear, setBirthYear] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');

  // 2. Family Group State
  const [currentFamily, setCurrentFamily] = useState<FamilyGroup | null>(null);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [isJoiningFamily, setIsJoiningFamily] = useState<boolean>(false);
  const [familySuccessMsg, setFamilySuccessMsg] = useState<string>('');
  const [familyErrorMsg, setFamilyErrorMsg] = useState<string>('');

  // 3. Logout Confirmation State
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false);

  // Load profile and family data on mount
  useEffect(() => {
    const loadData = async () => {
      const activeUserId = currentUser?.user_id || 'user_sarah';
      const p = await settingsService.getUserProfile(activeUserId);
      setProfile(p);
      setDisplayName(currentUser?.display_name || p.display_name || '');
      setBirthYear(currentUser?.birth_year ? currentUser.birth_year.toString() : p.birth_year ? p.birth_year.toString() : '');

      if (p.family_group_id) {
        const f = await settingsService.getFamilyGroupById(p.family_group_id);
        setCurrentFamily(f);
      }
    };
    loadData();
  }, [currentUser]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    audioManager.playTap(soundEnabled);
    setIsSavingProfile(true);
    setProfileSuccessMsg('');

    try {
      const yearNum = birthYear.trim() ? parseInt(birthYear.trim(), 10) : null;
      const updated = await settingsService.updateUserProfile(profile.user_id, {
        display_name: displayName.trim() || profile.display_name,
        birth_year: isNaN(yearNum as number) ? profile.birth_year : yearNum,
      });
      setProfile(updated);
      audioManager.playSuccess(soundEnabled);
      setProfileSuccessMsg(
        language === 'he' ? 'הפרטים האישיים נשמרו בהצלחה!' : 'Profile details saved successfully!'
      );
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Joining Family Group with 5-character invite code
  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    audioManager.playTap(soundEnabled);
    setIsJoiningFamily(true);
    setFamilySuccessMsg('');
    setFamilyErrorMsg('');

    try {
      const result = await settingsService.joinFamilyByInviteCode(profile.user_id, inviteCode);
      if (result.success && result.group) {
        setCurrentFamily(result.group);
        setInviteCode('');
        audioManager.playSuccess(soundEnabled);
        setFamilySuccessMsg(
          language === 'he'
            ? `הצטרפת בהצלחה ל${result.group.group_name}! 🎉`
            : `You have joined the ${result.group.group_name}! 🎉`
        );
        setTimeout(() => setFamilySuccessMsg(''), 5000);
      } else {
        audioManager.playGentleGuidance(soundEnabled);
        setFamilyErrorMsg(
          result.error ||
            (language === 'he' ? 'קוד הצטרפות שגוי. נסו שוב.' : 'Invalid invite code. Try again.')
        );
      }
    } finally {
      setIsJoiningFamily(false);
    }
  };

  // Handle Logout Execution
  const handleConfirmLogout = async () => {
    audioManager.playTap(soundEnabled);
    await settingsService.logoutUser();
    setIsLoggedOut(true);
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-150 pb-16 ${
        highContrast
          ? 'bg-black text-yellow-300'
          : theme === 'dark'
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. Header with Big Return Button */}
      <header
        className={`sticky top-0 z-40 w-full px-4 sm:px-8 py-4 border-b-2 shadow-sm transition-colors ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : theme === 'dark'
            ? 'bg-slate-900 text-slate-100 border-slate-800'
            : 'bg-white text-gray-900 border-gray-200'
        }`}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'he' ? 'הגדרות וניהול פרופיל' : 'Settings & Profile'}
            </h1>
          </div>

          <button
            onClick={() => {
              audioManager.playTap(soundEnabled);
              onReturnToHome();
            }}
            aria-label={language === 'he' ? 'דף הבית' : 'Home'}
            className={`min-h-[56px] sm:min-h-[64px] px-5 rounded-2xl flex items-center justify-center font-bold text-base gap-2.5 border-2 transition-transform active:scale-95 shadow-sm cursor-pointer ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : theme === 'dark'
                ? 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700'
                : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Home className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-extrabold">{language === 'he' ? 'חזרה לדף הבית' : 'Back to Home'}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content - STRICTLY SINGLE COLUMN */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-2xl w-full mx-auto space-y-8 animate-fadeIn">
        {/* LOGGED OUT BANNER IF APPLICABLE */}
        {isLoggedOut && (
          <div className="w-full p-6 rounded-3xl bg-amber-500/20 border-2 border-amber-400 text-center text-amber-200">
            <h3 className="text-xl font-bold mb-2">
              {language === 'he' ? 'התנתקת בהצלחה מהמערכת' : 'You have logged out successfully'}
            </h3>
            <p className="text-sm opacity-90 mb-4">
              {language === 'he'
                ? 'כל הנתונים וההתקדמות שלך שמורים בבטחה. נתראה באימון הבא!'
                : 'All your progress and streaks are securely saved. See you next time!'}
            </p>
            <button
              onClick={onReturnToHome}
              className="px-6 py-3 bg-amber-400 text-black font-bold rounded-2xl"
            >
              {language === 'he' ? 'חזרה למסך הראשי' : 'Return to Home'}
            </button>
          </div>
        )}

        {/* SECTION 1: PERSONAL PROFILE (Single-Column Card) */}
        <section
          className={`w-full p-6 sm:p-8 rounded-3xl border-2 shadow-sm transition-all ${
            highContrast
              ? 'bg-black border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-current/15">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                highContrast
                  ? 'bg-yellow-400 text-black'
                  : theme === 'dark'
                  ? 'bg-indigo-950 text-indigo-400'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'he' ? 'פרטים אישיים' : 'Personal Details'}
              </h2>
              <p className="text-sm opacity-75">
                {language === 'he'
                  ? 'השם שיוצג בברכת הבוקר ובמועדון המשפחתי'
                  : 'The name displayed in greetings and family clubs'}
              </p>
            </div>
          </div>

          {profileSuccessMsg && (
            <div className="p-4 mb-5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center gap-2.5 text-base font-semibold">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Display Name Input */}
            <div>
              <label className="block text-base sm:text-lg font-bold mb-2">
                {language === 'he' ? 'שם להצגה באפליקציה:' : 'Display Name:'}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={language === 'he' ? 'למשל: סבתא שרה' : 'e.g. Grandma Sarah'}
                className={`w-full min-h-[64px] px-5 rounded-2xl text-xl font-bold border-2 transition-all focus:outline-none ${
                  highContrast
                    ? 'bg-black text-yellow-300 border-yellow-400 focus:ring-4 focus:ring-yellow-400/40'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-white border-slate-700 focus:border-indigo-500'
                    : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-indigo-600'
                }`}
                required
              />
            </div>

            {/* Birth Year Input */}
            <div>
              <label className="block text-base sm:text-lg font-bold mb-2">
                {language === 'he' ? 'שנת לידה (עבור התאמת גיל):' : 'Birth Year (for calibration):'}
              </label>
              <input
                type="number"
                min="1910"
                max="2020"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="1948"
                className={`w-full min-h-[64px] px-5 rounded-2xl text-xl font-bold border-2 transition-all focus:outline-none ${
                  highContrast
                    ? 'bg-black text-yellow-300 border-yellow-400 focus:ring-4 focus:ring-yellow-400/40'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-white border-slate-700 focus:border-indigo-500'
                    : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-indigo-600'
                }`}
              />
            </div>

            {/* Save Profile Button */}
            <button
              type="submit"
              disabled={isSavingProfile}
              className={`w-full min-h-[64px] py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98] cursor-pointer shadow-md border-2 ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                  : theme === 'dark'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700'
              }`}
            >
              <Check className="w-6 h-6 shrink-0" />
              <span>
                {isSavingProfile
                  ? language === 'he'
                    ? 'שומר פרטים...'
                    : 'Saving...'
                  : language === 'he'
                  ? 'שמור שינויים בפרופיל'
                  : 'Save Profile Details'}
              </span>
            </button>
          </form>
        </section>

        {/* SECTION 2: FAMILY GROUP & INVITE CODE (Single-Column Card) */}
        <section
          className={`w-full p-6 sm:p-8 rounded-3xl border-2 shadow-sm transition-all ${
            highContrast
              ? 'bg-black border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-current/15">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                highContrast
                  ? 'bg-yellow-400 text-black'
                  : theme === 'dark'
                  ? 'bg-purple-950 text-purple-400'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'he' ? 'מועדון המוח המשפחתי' : 'Family Brain Club'}
              </h2>
              <p className="text-sm opacity-75">
                {language === 'he'
                  ? 'התאמנו יחד עם המשפחה לעידוד הדדי וצברו נקודות ליעד שבועי'
                  : 'Train together with your family and pool weekly points'}
              </p>
            </div>
          </div>

          {/* Current Family Badge */}
          <div
            className={`p-5 rounded-2xl mb-6 border-2 flex items-center justify-between gap-3 ${
              highContrast
                ? 'bg-yellow-400/10 border-yellow-400 text-yellow-300'
                : theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-purple-50 border-purple-200 text-purple-900'
            }`}
          >
            <div>
              <span className="text-xs uppercase font-bold tracking-wider opacity-75 block mb-1">
                {language === 'he' ? 'קבוצה משפחתית פעילה כעת:' : 'Active Family Club:'}
              </span>
              <span className="text-xl font-black">
                {currentFamily ? currentFamily.group_name : 'משפחת ברקאי'}
              </span>
            </div>
            {currentFamily?.invite_code && (
              <div className="text-center font-mono font-bold text-sm bg-black/20 px-3 py-1.5 rounded-xl border border-current/20">
                <span className="text-xs opacity-75 block">קוד קבוצה</span>
                <span className="text-base tracking-widest">{currentFamily.invite_code}</span>
              </div>
            )}
          </div>

          {/* Messages */}
          {familySuccessMsg && (
            <div className="p-4 mb-5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center gap-2.5 text-base font-semibold">
              <Sparkles className="w-6 h-6 shrink-0 text-emerald-400" />
              <span>{familySuccessMsg}</span>
            </div>
          )}

          {familyErrorMsg && (
            <div className="p-4 mb-5 rounded-2xl bg-rose-500/20 border-2 border-rose-400 text-rose-300 flex items-center gap-2.5 text-base font-semibold">
              <AlertCircle className="w-6 h-6 shrink-0 text-rose-400" />
              <span>{familyErrorMsg}</span>
            </div>
          )}

          {/* Join Family Form */}
          <form onSubmit={handleJoinFamily} className="space-y-4">
            <div>
              <label className="block text-base sm:text-lg font-bold mb-2">
                {language === 'he'
                  ? 'הצטרפות לקבוצה אחרת (הזינו קוד בן 5 תווים):'
                  : 'Join Another Group (Enter 5-character invite code):'}
              </label>
              <input
                type="text"
                maxLength={5}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="COHN7"
                className={`w-full min-h-[64px] px-5 rounded-2xl text-2xl font-mono font-bold tracking-widest text-center uppercase border-2 transition-all focus:outline-none ${
                  highContrast
                    ? 'bg-black text-yellow-300 border-yellow-400 focus:ring-4 focus:ring-yellow-400/40'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-white border-slate-700 focus:border-purple-500'
                    : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-purple-600'
                }`}
                required
              />
              <p className="text-xs opacity-70 mt-2 text-center">
                {language === 'he'
                  ? 'קודי דוגמה לבדיקה: COHN7 (משפחת כהן) או BARK1 (משפחת ברקאי)'
                  : 'Demo invite codes to try: COHN7 (Cohen Family) or BARK1 (Barkai Family)'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isJoiningFamily}
              className={`w-full min-h-[64px] py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98] cursor-pointer shadow-md border-2 ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                  : theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
                  : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-700'
              }`}
            >
              <Users className="w-6 h-6 shrink-0" />
              <span>
                {isJoiningFamily
                  ? language === 'he'
                    ? 'מצטרף לקבוצה...'
                    : 'Joining...'
                  : language === 'he'
                  ? 'הצטרף לקבוצה משפחתית'
                  : 'Join Family Group'}
              </span>
            </button>
          </form>
        </section>

        {/* SECTION 3: ACCESSIBILITY PREFERENCES (PERSISTENT & AUTO-SAVED) */}
        <section
          className={`w-full p-6 sm:p-8 rounded-3xl border-2 shadow-sm transition-all ${
            highContrast
              ? 'bg-black border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-current/15">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  highContrast
                    ? 'bg-yellow-400 text-black'
                    : theme === 'dark'
                    ? 'bg-amber-950 text-amber-400'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {language === 'he' ? 'העדפות נגישות ותצוגה' : 'Accessibility Preferences'}
                </h2>
                <p className="text-sm opacity-75">
                  {language === 'he'
                    ? 'שינויים חלים מיד ונשמרים אוטומטית במסד הנתונים'
                    : 'Changes apply live and auto-save persistently to the database'}
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <ShieldCheck className="w-4 h-4" />
              <span>Auto-Save Live</span>
            </span>
          </div>

          <div className="space-y-6">
            {/* 3.1 Font Size Toggles (Standard / Large / Huge / Max) */}
            <div>
              <label className="block text-lg font-bold mb-3 flex items-center gap-2">
                <Type className="w-5 h-5" />
                <span>{language === 'he' ? 'גודל כתב (טקסט):' : 'Text Size:'}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: language === 'he' ? 'רגיל (1.0x)' : 'Standard (1.0x)', val: 1.0 as FontSizeOption },
                  { label: language === 'he' ? 'גדול (1.25x)' : 'Large (1.25x)', val: 1.25 as FontSizeOption },
                  { label: language === 'he' ? 'גדול מאוד (1.5x)' : 'Huge (1.5x)', val: 1.5 as FontSizeOption },
                  { label: language === 'he' ? 'מקסימלי (1.75x)' : 'Max (1.75x)', val: 1.75 as FontSizeOption },
                ].map((opt) => {
                  const isSelected = fontSizeMultiplier === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        audioManager.playTap(soundEnabled);
                        setFontSizeMultiplier(opt.val);
                      }}
                      className={`min-h-[64px] rounded-2xl border-3 flex flex-col items-center justify-center font-bold text-base transition-all transform active:scale-95 cursor-pointer ${
                        isSelected
                          ? highContrast
                            ? 'bg-yellow-400 text-black border-yellow-300 ring-4 ring-yellow-400/40'
                            : theme === 'dark'
                            ? 'bg-indigo-600 text-white border-indigo-400 ring-4 ring-indigo-500/30'
                            : 'bg-indigo-600 text-white border-indigo-700 ring-4 ring-indigo-300'
                          : highContrast
                          ? 'bg-black text-yellow-300 border-yellow-400/60 hover:bg-yellow-400/10'
                          : theme === 'dark'
                          ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <span className="text-lg font-black">Aa</span>
                      <span className="text-xs opacity-90">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3.2 Display Theme Selector */}
            <div>
              <label className="block text-lg font-bold mb-3 flex items-center gap-2">
                <Sun className="w-5 h-5" />
                <span>{language === 'he' ? 'ערכת נושא ומצב תצוגה:' : 'Display Theme:'}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'light' as DisplayTheme,
                    label: language === 'he' ? 'מצב בהיר ☀️' : 'Light Theme ☀️',
                    icon: Sun,
                  },
                  {
                    id: 'dark' as DisplayTheme,
                    label: language === 'he' ? 'מצב כהה 🌙' : 'Dark Theme 🌙',
                    icon: Moon,
                  },
                  {
                    id: 'high-contrast' as DisplayTheme,
                    label: language === 'he' ? 'ניגודיות צהוב-שחור ⚡' : 'High Contrast ⚡',
                    icon: Zap,
                  },
                ].map((th) => {
                  const isSelected = theme === th.id;
                  const Icon = th.icon;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => {
                        audioManager.playTap(soundEnabled);
                        setTheme(th.id);
                      }}
                      className={`min-h-[64px] rounded-2xl border-3 flex items-center justify-center gap-2.5 font-bold text-base px-4 transition-all transform active:scale-95 cursor-pointer ${
                        isSelected
                          ? highContrast
                            ? 'bg-yellow-400 text-black border-yellow-300 ring-4 ring-yellow-400/40'
                            : theme === 'dark'
                            ? 'bg-indigo-600 text-white border-indigo-400 ring-4 ring-indigo-500/30'
                            : 'bg-indigo-600 text-white border-indigo-700 ring-4 ring-indigo-300'
                          : highContrast
                          ? 'bg-black text-yellow-300 border-yellow-400/60'
                          : theme === 'dark'
                          ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{th.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3.3 Large Toggle: Gentle Sound Effects */}
            <div
              className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all ${
                highContrast
                  ? 'bg-black border-yellow-400'
                  : theme === 'dark'
                  ? 'bg-slate-800/60 border-slate-700'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-7 h-7 text-emerald-500 shrink-0" />
                ) : (
                  <VolumeX className="w-7 h-7 text-slate-400 shrink-0" />
                )}
                <div>
                  <span className="text-lg font-bold block">
                    {language === 'he' ? 'צלילי משוב עדינים' : 'Gentle Audio Feedback'}
                  </span>
                  <span className="text-xs opacity-75">
                    {language === 'he'
                      ? 'פעמונים נעימים בעת בחירת תשובה (ללא צפצופים צורמים)'
                      : 'Gentle positive chimes upon answering (no harsh buzzers)'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextVal = !soundEnabled;
                  setSoundEnabled(nextVal);
                  audioManager.playTap(nextVal);
                }}
                className={`min-w-[80px] min-h-[56px] px-4 rounded-2xl font-black text-base border-2 transition-transform active:scale-95 cursor-pointer ${
                  soundEnabled
                    ? highContrast
                      ? 'bg-yellow-400 text-black border-yellow-300'
                      : 'bg-emerald-600 text-white border-emerald-500'
                    : highContrast
                    ? 'bg-black text-gray-400 border-gray-600'
                    : 'bg-slate-700 text-slate-300 border-slate-600'
                }`}
              >
                {soundEnabled ? (language === 'he' ? 'מופעל' : 'ON') : language === 'he' ? 'כבוי' : 'OFF'}
              </button>
            </div>

            {/* 3.4 Large Toggle: Reduce Animations */}
            <div
              className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all ${
                highContrast
                  ? 'bg-black border-yellow-400'
                  : theme === 'dark'
                  ? 'bg-slate-800/60 border-slate-700'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-lg font-bold block">
                    {language === 'he' ? 'הפחתת תנועות ואנימציות' : 'Reduce Screen Motions'}
                  </span>
                  <span className="text-xs opacity-75">
                    {language === 'he'
                      ? 'ממתן תנועות על המסך לנוחות מירבית ומניעת עומס'
                      : 'Softens transitions for steady visual comfort'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  audioManager.playTap(soundEnabled);
                  setReduceAnimations(!reduceAnimations);
                }}
                className={`min-w-[80px] min-h-[56px] px-4 rounded-2xl font-black text-base border-2 transition-transform active:scale-95 cursor-pointer ${
                  reduceAnimations
                    ? highContrast
                      ? 'bg-yellow-400 text-black border-yellow-300'
                      : 'bg-indigo-600 text-white border-indigo-500'
                    : highContrast
                    ? 'bg-black text-gray-400 border-gray-600'
                    : 'bg-slate-700 text-slate-300 border-slate-600'
                }`}
              >
                {reduceAnimations ? (language === 'he' ? 'מופעל' : 'ON') : language === 'he' ? 'כבוי' : 'OFF'}
              </button>
            </div>

            {/* 3.5 Language Switcher */}
            <div>
              <label className="block text-lg font-bold mb-3 flex items-center gap-2">
                <FlagIcon country={language} className="w-6 h-5" />
                <span>{language === 'he' ? 'שפת האפליקציה:' : 'App Language:'}</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playTap(soundEnabled);
                    setLanguage('he');
                  }}
                  className={`min-h-[64px] rounded-2xl border-3 flex items-center justify-center gap-2.5 font-bold text-lg transition-transform active:scale-95 cursor-pointer ${
                    language === 'he'
                      ? highContrast
                        ? 'bg-yellow-400 text-black border-yellow-300 ring-4 ring-yellow-400/40'
                        : theme === 'dark'
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-indigo-600 text-white border-indigo-700'
                      : highContrast
                      ? 'bg-black text-yellow-300 border-yellow-400/60'
                      : theme === 'dark'
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  <FlagIcon country="he" className="w-7 h-5" />
                  <span>עברית (IL)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audioManager.playTap(soundEnabled);
                    setLanguage('en');
                  }}
                  className={`min-h-[64px] rounded-2xl border-3 flex items-center justify-center gap-2.5 font-bold text-lg transition-transform active:scale-95 cursor-pointer ${
                    language === 'en'
                      ? highContrast
                        ? 'bg-yellow-400 text-black border-yellow-300 ring-4 ring-yellow-400/40'
                        : theme === 'dark'
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-indigo-600 text-white border-indigo-700'
                      : highContrast
                      ? 'bg-black text-yellow-300 border-yellow-400/60'
                      : theme === 'dark'
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  <FlagIcon country="en" className="w-7 h-5" />
                  <span>English (UK)</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: LOGOUT BUTTON (GENTLE WARNING COLOR, SENIOR-FRIENDLY) */}
        <section className="w-full pt-4">
          <button
            type="button"
            onClick={() => {
              audioManager.playTap(soundEnabled);
              setShowLogoutModal(true);
            }}
            className={`w-full min-h-[64px] py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 border-2 transition-all transform active:scale-[0.98] cursor-pointer shadow-sm ${
              highContrast
                ? 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-400/15'
                : theme === 'dark'
                ? 'bg-amber-950/40 border-amber-600/70 text-amber-300 hover:bg-amber-900/40'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <LogOut className="w-6 h-6 shrink-0" />
            <span>{language === 'he' ? 'התנתקות מהחשבון' : 'Log Out of Account'}</span>
          </button>
        </section>

        {/* BOTTOM RETURN TO DASHBOARD BUTTON */}
        <div className="w-full pt-2">
          <button
            onClick={() => {
              audioManager.playTap(soundEnabled);
              onReturnToHome();
            }}
            className={`w-full min-h-[64px] py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 border-2 transition-all transform active:scale-[0.98] cursor-pointer shadow-md ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 hover:bg-yellow-300'
                : theme === 'dark'
                ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
                : 'bg-slate-200 text-slate-900 border-slate-300 hover:bg-slate-300'
            }`}
          >
            {isRtl ? <ArrowRight className="w-6 h-6 shrink-0" /> : <ArrowLeft className="w-6 h-6 shrink-0" />}
            <span>{language === 'he' ? 'חזרה לדף הבית הראשי' : 'Back to Main Dashboard'}</span>
          </button>
        </div>
      </main>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div
            className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 border-4 shadow-2xl text-center space-y-6 ${
              highContrast
                ? 'bg-black text-yellow-300 border-yellow-400'
                : theme === 'dark'
                ? 'bg-slate-900 text-slate-100 border-slate-700'
                : 'bg-white text-slate-900 border-slate-300'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <LogOut className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-2">
                {language === 'he' ? 'האם להתנתק מהחשבון?' : 'Are you sure you want to log out?'}
              </h3>
              <p className="text-base opacity-80">
                {language === 'he'
                  ? 'כל ההתקדמות, המטבעות ורצף האימונים שלך יישמרו בבטחה לקראת הפעם הבאה שתתאמנו.'
                  : 'All your progress, coins, and streaks are securely preserved for next time.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className={`w-full sm:flex-1 min-h-[56px] py-3 rounded-2xl font-bold text-lg border-2 transition-all cursor-pointer ${
                  highContrast
                    ? 'bg-black text-yellow-300 border-yellow-400 hover:bg-yellow-400/20'
                    : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
                }`}
              >
                {language === 'he' ? 'ביטול וחזרה' : 'Cancel & Stay'}
              </button>

              <button
                onClick={handleConfirmLogout}
                className={`w-full sm:flex-1 min-h-[56px] py-3 rounded-2xl font-bold text-lg border-2 transition-all cursor-pointer ${
                  highContrast
                    ? 'bg-yellow-400 text-black border-yellow-300'
                    : 'bg-amber-600 text-white border-amber-500 hover:bg-amber-500'
                }`}
              >
                {language === 'he' ? 'כן, התנתק כעת' : 'Yes, Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
