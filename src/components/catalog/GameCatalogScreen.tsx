import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { ExerciseHeader } from '../exercise/ExerciseHeader';
import { AccessibilityModal } from '../accessibility/AccessibilityModal';
import { COMPLETE_GAME_CATALOG } from '../../data/gameCatalog';
import type { ExerciseCategory } from '../../types/exercise';
import {
  Brain,
  Eye,
  Zap,
  BookOpen,
  Play,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface GameCatalogScreenProps {
  onReturnToHome: () => void;
  onSelectGame: (gameId: string, category: ExerciseCategory) => void;
}

export const GameCatalogScreen: React.FC<GameCatalogScreenProps> = ({
  onReturnToHome,
  onSelectGame,
}) => {
  const { theme, highContrast, language } = useAccessibility();
  const isRtl = language === 'he';

  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  const categories: { key: ExerciseCategory | 'all'; label: { he: string; en: string }; icon: React.ReactNode }[] = [
    { key: 'all', label: { he: 'כל המשחקים (40)', en: 'All Games (40)' }, icon: <Sparkles className="w-5 h-5" /> },
    { key: 'memory', label: { he: 'זיכרון עבודה (10)', en: 'Working Memory (10)' }, icon: <Brain className="w-5 h-5 text-indigo-500" /> },
    { key: 'attention', label: { he: 'קשב וריכוז (10)', en: 'Attention (10)' }, icon: <Eye className="w-5 h-5 text-emerald-500" /> },
    { key: 'speed', label: { he: 'מהירות וגמישות (10)', en: 'Speed & Flexibility (10)' }, icon: <Zap className="w-5 h-5 text-amber-500" /> },
    { key: 'language', label: { he: 'שפה ושליפה (10)', en: 'Language & Logic (10)' }, icon: <BookOpen className="w-5 h-5 text-rose-500" /> },
  ];

  const filteredGames = COMPLETE_GAME_CATALOG.filter(
    (g) => selectedCategory === 'all' || g.category === selectedCategory
  );

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
        highContrast
          ? 'bg-black text-white'
          : theme === 'dark'
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 1. Header */}
      <ExerciseHeader
        currentStep={1}
        totalSteps={1}
        hideProgress={true}
        title={language === 'he' ? 'ספריית המשחקים המדעית' : 'Scientific Game Catalog'}
        onHome={onReturnToHome}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
      />

      {/* 2. Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Intro Banner */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            {language === 'he' ? '40 משחקים מדעיים לאימון מוח מקיף' : '40 Scientific Brain Training Games'}
          </h1>
          <p className="text-lg sm:text-xl font-medium text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {language === 'he'
              ? '10 משחקים ייחודיים בכל אחד מ-4 תחומי המוח. בחרו משחק להתנסות אישית או שחקו במסלול היומי המגוון.'
              : '10 distinct paradigms across all 4 cognitive domains. Practice individually or play the daily routine.'}
          </p>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-8 justify-start sm:justify-center">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`py-3 px-5 rounded-2xl font-bold text-base sm:text-lg flex items-center gap-2.5 whitespace-nowrap border-2 transition-all transform active:scale-95 cursor-pointer ${
                  isSelected
                    ? highContrast
                      ? 'bg-yellow-400 text-black border-white ring-2 ring-yellow-400'
                      : 'bg-primary-600 text-white border-primary-500 shadow-md ring-2 ring-primary-400/40'
                    : highContrast
                    ? 'bg-zinc-900 border-zinc-700 text-white hover:border-yellow-400'
                    : theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
                }`}
              >
                {cat.icon}
                <span>{cat.label[language]}</span>
              </button>
            );
          })}
        </div>

        {/* Games Grid (40 Games) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map((game, idx) => (
            <div
              key={game.id}
              className={`p-6 rounded-3xl border-2 shadow-lg flex flex-col justify-between transition-all hover:scale-101 ${
                highContrast
                  ? 'bg-zinc-900 border-zinc-700 hover:border-yellow-400 text-white'
                  : theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 hover:border-primary-500 text-white'
                  : 'bg-white border-slate-200 hover:border-primary-400 text-slate-900 shadow-sm'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      game.category === 'memory'
                        ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                        : game.category === 'attention'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : game.category === 'speed'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    #{idx + 1} • {game.category.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    רמות 1–10
                  </span>
                </div>

                {/* Game Title */}
                <h3 className="text-2xl font-black mb-2 leading-tight">
                  {game.title[language]}
                </h3>

                {/* Description */}
                <p className="text-base text-slate-600 dark:text-slate-300 font-medium mb-4 leading-relaxed">
                  {game.shortDescription[language]}
                </p>

                {/* Scientific Protocol */}
                <div className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-6 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{game.scientificProtocol}</span>
                </div>
              </div>

              {/* Play Action Button */}
              <button
                onClick={() => onSelectGame(game.id, game.category)}
                className={`w-full py-4 px-6 rounded-2xl text-xl font-black flex items-center justify-center gap-2 shadow-md transform active:scale-95 transition-all cursor-pointer ${
                  highContrast
                    ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                    : 'bg-primary-600 hover:bg-primary-500 text-white'
                }`}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{language === 'he' ? 'שחקו עכשיו' : 'Play Game'}</span>
                {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Accessibility Modal */}
      <AccessibilityModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />
    </div>
  );
};
