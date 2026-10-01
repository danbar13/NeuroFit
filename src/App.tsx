import { useState, useEffect } from 'react';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { GamificationProvider } from './context/GamificationContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { HomeDashboard } from './components/home/HomeDashboard';
import { DailyWorkoutManager } from './components/daily/DailyWorkoutManager';
import { BaselineFlow } from './components/calibration/BaselineFlow';
import { FamilyDashboardScreen } from './components/family/FamilyDashboardScreen';
import { UserDashboardScreen } from './components/dashboard/UserDashboardScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAuthGuard } from './components/admin/AdminAuthGuard';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { GameCatalogScreen } from './components/catalog/GameCatalogScreen';
import { ExerciseRenderer } from './components/exercises/ExerciseRenderer';
import { Home, ArrowRight } from 'lucide-react';
import {
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  getCognitiveProfile,
  saveCognitiveProfile,
} from './lib/authStateService';
import type { UserProfile, CognitiveProfile } from './types/database';
import type { ExerciseCategory } from './types/exercise';
import type { CalibrationSummary } from './lib/calibrationEngine';

export type AppView =
  | 'auth'
  | 'home'
  | 'daily_workout'
  | 'baseline_test'
  | 'game_catalog'
  | 'solo_game'
  | 'family_dashboard'
  | 'user_dashboard'
  | 'admin'
  | 'settings';

export function App() {
  const [currentUser, setAppStateUser] = useState<UserProfile | null>(getCurrentUser);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedSoloGame, setSelectedSoloGame] = useState<{ id: string; category: ExerciseCategory } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(true);

  // Strict Gatekeeper logic:
  // 1. If no authenticated user -> force 'auth'
  // 2. If authenticated user has NO baseline profile -> force 'baseline_test'
  // 3. Otherwise allow standard navigation
  useEffect(() => {
    if (!currentUser) {
      setCurrentView('auth');
      return;
    }

    const profile = getCognitiveProfile(currentUser.user_id);
    if (!profile || !profile.last_assessed_at) {
      setCurrentView('baseline_test');
    }
  }, [currentUser]);

  // URL hash sync (e.g. #admin directly navigates to CMS, #settings to settings)
  useEffect(() => {
    const handleHash = () => {
      if (!currentUser) return;
      const profile = getCognitiveProfile(currentUser.user_id);
      if (!profile || !profile.last_assessed_at) return;

      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin') setCurrentView('admin');
      else if (hash === 'settings') setCurrentView('settings');
      else if (hash === 'family') setCurrentView('family_dashboard');
      else if (hash === 'profile') setCurrentView('user_dashboard');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentUser]);

  // Handle user authentication / registration
  const handleAuthenticated = (newUser: UserProfile) => {
    setCurrentUser(newUser);
    setAppStateUser(newUser);

    const profile = getCognitiveProfile(newUser.user_id);
    if (!profile || !profile.last_assessed_at) {
      setCurrentView('baseline_test');
    } else {
      setCurrentView('home');
    }
  };

  // Handle baseline test completion
  const handleBaselineCompleted = (summary?: CalibrationSummary) => {
    if (currentUser) {
      const initialProfile: CognitiveProfile = {
        user_id: currentUser.user_id,
        memory_level: summary?.memoryLevel ?? 2,
        attention_level: summary?.attentionLevel ?? 2,
        speed_level: summary?.speedLevel ?? 2,
        language_level: summary?.languageLevel ?? 2,
        baseline_completed: true,
        last_assessed_at: new Date().toISOString(),
      };
      saveCognitiveProfile(initialProfile);
    }
    setCurrentView('home');
  };

  // Handle logout
  const handleLogout = () => {
    clearCurrentUser();
    setAppStateUser(null);
    setCurrentView('auth');
  };

  return (
    <AccessibilityProvider>
      <GamificationProvider currentUser={currentUser}>
        <div className="min-h-screen w-full flex flex-col font-sans transition-colors duration-150">
          {/* 1. Unauthenticated Gate */}
          {(!currentUser || currentView === 'auth') && (
            <AuthScreen onAuthenticated={handleAuthenticated} />
          )}

          {/* 2. Mandatory Baseline Assessment Gate */}
          {currentUser && currentView === 'baseline_test' && (
            <BaselineFlow
              currentUser={currentUser}
              onComplete={handleBaselineCompleted}
              onExit={() => {
                // If user hasn't completed baseline, they stay or go back to auth
                const profile = getCognitiveProfile(currentUser.user_id);
                if (profile?.last_assessed_at) {
                  setCurrentView('home');
                } else {
                  handleLogout();
                }
              }}
            />
          )}

          {/* 3. Main Dashboard & Gated Views */}
          {currentUser && currentView === 'home' && (
            <HomeDashboard
              currentUser={currentUser}
              onStartDailyWorkout={() => setCurrentView('daily_workout')}
              onStartBaseline={() => setCurrentView('baseline_test')}
              onOpenCatalog={() => setCurrentView('game_catalog')}
              onOpenFamilyDashboard={() => setCurrentView('family_dashboard')}
              onOpenUserDashboard={() => setCurrentView('user_dashboard')}
              onOpenSettings={() => setCurrentView('settings')}
              onOpenAdmin={() => setCurrentView('admin')}
            />
          )}

          {currentUser && currentView === 'game_catalog' && (
            <GameCatalogScreen
              onReturnToHome={() => setCurrentView('home')}
              onSelectGame={(gameId, category) => {
                setSelectedSoloGame({ id: gameId, category });
                setCurrentView('solo_game');
              }}
            />
          )}

          {currentUser && currentView === 'solo_game' && selectedSoloGame && (
            <div className="min-h-screen flex flex-col justify-between p-4">
              <div className="w-full flex justify-between items-center mb-4 max-w-4xl mx-auto">
                <button
                  onClick={() => setCurrentView('game_catalog')}
                  className="min-h-[56px] px-4 sm:px-5 py-2.5 rounded-2xl border-2 font-bold cursor-pointer flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm sm:text-base"
                >
                  <ArrowRight className="w-5 h-5 rtl:inline ltr:hidden" />
                  <span>חזרה לספריית המשחקים</span>
                </button>

                <button
                  onClick={() => setCurrentView('home')}
                  className="min-h-[56px] px-4 sm:px-5 py-2.5 rounded-2xl border-2 font-black cursor-pointer flex items-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-slate-700 transition-all text-sm sm:text-base shadow-sm"
                >
                  <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>דף הבית</span>
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <ExerciseRenderer
                  category={selectedSoloGame.category}
                  levelNumber={2}
                  gameId={selectedSoloGame.id}
                  onFeedbackGiven={() => {}}
                />
              </div>
            </div>
          )}

          {currentUser && currentView === 'daily_workout' && (
            <DailyWorkoutManager
              currentUser={currentUser}
              onReturnToHome={() => setCurrentView('home')}
              onOpenFamilyDashboard={() => setCurrentView('family_dashboard')}
            />
          )}

          {currentUser && currentView === 'family_dashboard' && (
            <FamilyDashboardScreen
              currentUser={currentUser}
              onReturnToHome={() => setCurrentView('home')}
              onStartDailyWorkout={() => setCurrentView('daily_workout')}
            />
          )}

          {currentUser && currentView === 'user_dashboard' && (
            <UserDashboardScreen
              currentUser={currentUser}
              onReturnToHome={() => setCurrentView('home')}
              onStartDailyWorkout={() => setCurrentView('daily_workout')}
              onOpenFamilyDashboard={() => setCurrentView('family_dashboard')}
              onOpenSettings={() => setCurrentView('settings')}
            />
          )}

          {currentUser && currentView === 'settings' && (
            <SettingsScreen
              currentUser={currentUser}
              onReturnToHome={() => setCurrentView('home')}
              onLogout={handleLogout}
            />
          )}

          {currentUser && currentView === 'admin' && (
            <AdminAuthGuard
              isAdmin={isAdmin}
              onToggleAdminRole={setIsAdmin}
              onReturnToApp={() => setCurrentView('home')}
            >
              <AdminDashboard
                isAdmin={isAdmin}
                onToggleAdminRole={setIsAdmin}
                onReturnToApp={() => setCurrentView('home')}
              />
            </AdminAuthGuard>
          )}
        </div>
      </GamificationProvider>
    </AccessibilityProvider>
  );
}

export default App;
