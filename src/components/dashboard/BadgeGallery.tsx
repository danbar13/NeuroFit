import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { buildBadgeGalleryList, type BadgeGalleryItem } from '../../lib/badgeEvaluation';
import type { UserBadge } from '../../types/database';
import {
  Sun,
  Flame,
  Brain,
  Sparkles,
  Trophy,
  Lock,
  CheckCircle2,
  X,
  Info,
  Calendar,
} from 'lucide-react';

interface BadgeGalleryProps {
  userBadges: UserBadge[];
}

export const BadgeGallery: React.FC<BadgeGalleryProps> = ({ userBadges }) => {
  const { theme, highContrast, language } = useAccessibility();
  const [selectedBadge, setSelectedBadge] = useState<BadgeGalleryItem | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedBadge(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const galleryItems = buildBadgeGalleryList(userBadges);
  const unlockedCount = galleryItems.filter((b) => b.unlocked).length;

  const renderBadgeIcon = (iconName: BadgeGalleryItem['icon_name'], className = 'w-8 h-8') => {
    switch (iconName) {
      case 'Sun':
        return <Sun className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Brain':
        return <Brain className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Trophy':
      default:
        return <Trophy className={className} />;
    }
  };

  return (
    <div className="w-full">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>{language === 'he' ? 'ארון התגים וההישגים' : 'Badges & Trophy Collection'}</span>
          </h3>
          <p className="text-sm opacity-80 font-medium">
            {language === 'he'
              ? 'לחצו על כל תג כדי לקרוא על המשמעות הקוגניטיבית והבריאותית שלו'
              : 'Tap any badge to learn about its cognitive benefit and requirements'}
          </p>
        </div>

        {/* Counter Badge */}
        <div
          className={`px-4 py-1.5 rounded-xl text-sm font-black flex items-center gap-1.5 ${
            highContrast
              ? 'bg-yellow-400 text-black'
              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300'
          }`}
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>
            {unlockedCount} / {galleryItems.length}{' '}
            {language === 'he' ? 'הושגו' : 'Unlocked'}
          </span>
        </div>
      </div>

      {/* Grid: Flexible wrapping CSS Grid without horizontal scroll */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleryItems.map((badge) => {
          const isUnlocked = badge.unlocked;

          return (
            <button
              key={badge.badge_id}
              type="button"
              onClick={() => setSelectedBadge(badge)}
              aria-label={
                language === 'he'
                  ? `תג ${badge.badge_name_he}, ${isUnlocked ? 'הושג' : 'נעול'}`
                  : `Badge ${badge.badge_name_en}, ${isUnlocked ? 'Unlocked' : 'Locked'}`
              }
              className={`p-4 sm:p-5 rounded-2xl border-2 text-start transition-all transform active:scale-95 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden min-h-[140px] shadow-sm ${
                isUnlocked
                  ? highContrast
                    ? 'bg-black text-yellow-300 border-yellow-400 hover:bg-yellow-400/10'
                    : theme === 'dark'
                    ? 'bg-gradient-to-br from-slate-900 to-indigo-950/40 border-amber-500/50 hover:border-amber-400 text-slate-100'
                    : 'bg-gradient-to-br from-amber-50/70 to-orange-50/40 border-amber-300 hover:border-amber-400 text-slate-800'
                  : highContrast
                  ? 'bg-black border-dashed border-gray-600 opacity-60 text-gray-400'
                  : theme === 'dark'
                  ? 'bg-slate-950/60 border-dashed border-slate-800 opacity-60 text-slate-400 hover:opacity-80'
                  : 'bg-slate-100/70 border-dashed border-slate-300 opacity-70 text-slate-500 hover:opacity-90'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Icon Container */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    isUnlocked
                      ? highContrast
                        ? 'bg-yellow-400 text-black'
                        : `bg-gradient-to-tr ${badge.accent_color} text-white shadow-md`
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isUnlocked ? renderBadgeIcon(badge.icon_name, 'w-7 h-7') : <Lock className="w-6 h-6" />}
                </div>

                {/* Badge Titles */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-black text-base sm:text-lg leading-snug">
                      {language === 'he' ? badge.badge_name_he : badge.badge_name_en}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm font-medium opacity-80 mt-1 line-clamp-2">
                    {language === 'he' ? badge.description_he : badge.description_en}
                  </p>
                </div>
              </div>

              {/* Status footer pill */}
              <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-current/10">
                {isUnlocked ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'he' ? 'הושג בהצלחה' : 'Unlocked'}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 opacity-75">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{language === 'he' ? 'נעול' : 'Locked'}</span>
                  </span>
                )}

                <span className="text-xs opacity-60 underline">
                  {language === 'he' ? 'פרטים נוספים' : 'Learn more'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Accessible Badge Detail Modal */}
      {selectedBadge && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border-3 shadow-2xl relative transition-all animate-bounce-short ${
              highContrast
                ? 'bg-black text-yellow-300 border-yellow-400'
                : theme === 'dark'
                ? 'bg-slate-900 border-slate-700 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button (min 48px) */}
            <button
              onClick={() => setSelectedBadge(null)}
              aria-label={language === 'he' ? 'סגור פרטי תג' : 'Close badge details'}
              className="absolute top-4 end-4 w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-current/10 transition-colors cursor-pointer"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Modal Icon Hero */}
            <div className="flex flex-col items-center text-center mb-6">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-3 shadow-lg ${
                  selectedBadge.unlocked
                    ? highContrast
                      ? 'bg-yellow-400 text-black'
                      : `bg-gradient-to-tr ${selectedBadge.accent_color} text-white`
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {selectedBadge.unlocked ? (
                  renderBadgeIcon(selectedBadge.icon_name, 'w-10 h-10')
                ) : (
                  <Lock className="w-9 h-9" />
                )}
              </div>

              <div className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-1 bg-current/10">
                {selectedBadge.unlocked ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{language === 'he' ? 'תג פתוח' : 'Unlocked Badge'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>{language === 'he' ? 'תג שטרם נפתח' : 'Locked Badge'}</span>
                  </>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black mt-1">
                {language === 'he' ? selectedBadge.badge_name_he : selectedBadge.badge_name_en}
              </h3>
            </div>

            {/* Explanation Section */}
            <div className="space-y-4 mb-6">
              <div
                className={`p-4 rounded-2xl border ${
                  highContrast
                    ? 'border-yellow-400/60 bg-yellow-400/10'
                    : 'border-current/10 bg-current/5'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1 opacity-80">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{language === 'he' ? 'כיצד משיגים תג זה?' : 'How to unlock this badge?'}</span>
                </div>
                <p className="text-base sm:text-lg font-extrabold">
                  {language === 'he' ? selectedBadge.description_he : selectedBadge.description_en}
                </p>
              </div>

              {/* Cognitive Benefit Explanation */}
              <div
                className={`p-4 rounded-2xl border ${
                  highContrast
                    ? 'border-yellow-400/60 bg-yellow-400/10'
                    : 'border-current/10 bg-current/5'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1 opacity-80 text-blue-500">
                  <Brain className="w-4 h-4 shrink-0" />
                  <span>{language === 'he' ? 'ההשפעה הקוגניטיבית והבריאותית' : 'Cognitive & Health Benefit'}</span>
                </div>
                <p className="text-sm sm:text-base font-medium leading-relaxed">
                  {language === 'he'
                    ? selectedBadge.detailed_benefit_he
                    : selectedBadge.detailed_benefit_en}
                </p>
              </div>

              {selectedBadge.unlocked && selectedBadge.awarded_at && (
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold opacity-70">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {language === 'he' ? 'הוענק בתאריך:' : 'Awarded on:'}{' '}
                    {new Date(selectedBadge.awarded_at).toLocaleDateString(
                      language === 'he' ? 'he-IL' : 'en-US'
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Close Primary Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className={`w-full min-h-[56px] py-3.5 px-6 rounded-2xl text-lg font-black flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-md ${
                highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
              }`}
            >
              <span>{language === 'he' ? 'הבנתי, תודה!' : 'Got it, thank you!'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
