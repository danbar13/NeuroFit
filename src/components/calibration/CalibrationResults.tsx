import React, { useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { audioManager } from '../../lib/soundEffects';
import type { CalibrationSummary } from '../../lib/calibrationEngine';
import { Coins, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CalibrationResultsProps {
  summary: CalibrationSummary;
  onProceedToDaily: () => void;
  onRecalibrate: () => void;
}

export const CalibrationResults: React.FC<CalibrationResultsProps> = ({
  summary,
  onProceedToDaily,
  onRecalibrate,
}) => {
  const { theme, highContrast, reduceAnimations, soundEnabled, t } = useAccessibility();

  useEffect(() => {
    audioManager.playSuccess(soundEnabled);
    if (!reduceAnimations) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [reduceAnimations, soundEnabled]);

  const getLevelLabel = (level: 1 | 2 | 3) => {
    if (level === 3) return t.level3Name;
    if (level === 2) return t.level2Name;
    return t.level1Name;
  };

  const categories = [
    { key: 'memory', name: t.test1Category, level: summary.memoryLevel, icon: '🧠' },
    { key: 'attention', name: t.test2Category, level: summary.attentionLevel, icon: '🔍' },
    { key: 'speed', name: t.test3Category, level: summary.speedLevel, icon: '⚡' },
    { key: 'language', name: t.test4Category, level: summary.languageLevel, icon: '📖' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-4 flex flex-col items-center text-center">
      {/* Celebration Icon */}
      <div
        className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-lg transition-all ${
          highContrast
            ? 'bg-yellow-400 text-black'
            : theme === 'dark'
            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
            : 'bg-emerald-100 text-emerald-800'
        }`}
      >
        <Sparkles className="w-12 h-12" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
        {t.resultsTitle}
      </h1>
      <p className="text-xl opacity-80 mb-6 max-w-lg">
        {t.resultsSubtitle}
      </p>

      {/* 50 Welcome Coins Banner */}
      <div
        className={`w-full max-w-lg p-4 rounded-2xl border-2 flex items-center justify-center gap-3 mb-6 shadow-sm ${
          highContrast
            ? 'bg-yellow-400 text-black border-yellow-300 font-extrabold'
            : theme === 'dark'
            ? 'bg-amber-950/70 border-amber-600 text-amber-200'
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}
      >
        <Coins className="w-8 h-8 text-amber-500 fill-amber-400" />
        <span className="text-xl sm:text-2xl font-black">
          {t.coinsBonus}
        </span>
      </div>

      {/* Cognitive Profile Pillar Cards */}
      <div className="w-full space-y-3 mb-8 text-start">
        <h2 className="text-xl font-bold text-center mb-3">
          {t.calibratedLevelsTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.key}
              className={`p-4 rounded-2xl border-2 transition-all ${
                highContrast
                  ? 'bg-gray-900 border-yellow-400 text-white'
                  : theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl" role="img" aria-hidden="true">{cat.icon}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-extrabold border ${
                    highContrast
                      ? 'bg-yellow-400 text-black border-yellow-400'
                      : theme === 'dark'
                      ? 'bg-blue-900/60 text-blue-200 border-blue-600'
                      : 'bg-blue-100 text-blue-900 border-blue-200'
                  }`}
                >
                  רמה {cat.level}
                </span>
              </div>
              <h3 className="text-lg font-bold">{cat.name}</h3>
              <p className="text-sm opacity-80 mt-1">{getLevelLabel(cat.level)}</p>
            </div>
          ))}
        </div>

        {/* Accuracy and Average Speed Pill */}
        <div
          className={`p-3 rounded-xl border text-center text-sm font-medium ${
            highContrast
              ? 'border-gray-700 text-gray-300'
              : theme === 'dark'
              ? 'border-slate-700 text-slate-300'
              : 'border-slate-200 text-slate-600'
          }`}
        >
          {t.accuracyLabel}: {summary.overallAccuracyPercent}% • {t.speedLabel}: {summary.averageResponseTimeSeconds} {t.seconds}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-3">
        <button
          onClick={() => {
            audioManager.playSuccess(soundEnabled);
            onProceedToDaily();
          }}
          className={`w-full min-h-[68px] px-8 rounded-2xl font-bold text-2xl flex items-center justify-center gap-3 shadow-xl transition-transform active:scale-95 ${
            highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300 ring-4 ring-yellow-400/40'
              : 'bg-emerald-700 text-white hover:bg-emerald-800 ring-4 ring-emerald-600/30'
          }`}
        >
          <span>{t.startDailyExercises}</span>
          <ArrowRight className="w-7 h-7 rtl:rotate-180" />
        </button>

        <button
          onClick={() => {
            audioManager.playTap(soundEnabled);
            onRecalibrate();
          }}
          className={`w-full min-h-[56px] px-6 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 border transition-transform active:scale-95 ${
            highContrast
              ? 'bg-gray-900 text-white border-gray-700 hover:border-yellow-400'
              : theme === 'dark'
              ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          <span>{t.retakeCalibration}</span>
        </button>
      </div>
    </div>
  );
};
