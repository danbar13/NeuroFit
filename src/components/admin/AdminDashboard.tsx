import React, { useState, useEffect } from 'react';
import type {
  ExerciseDictionaryCategory,
  ExerciseDictionaryEntry,
} from '../../types/database';
import { exerciseDictionaryService } from '../../lib/exerciseDictionaryService';
import { adminUserService } from '../../lib/adminUserService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { ContentForm } from './ContentForm';
import { ContentDataGrid } from './ContentDataGrid';
import { UserManager } from './UserManager';
import {
  BookOpen,
  Search,
  Zap,
  Brain,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  Plus,
  Home,
  Users,
  LogOut,
} from 'lucide-react';

interface AdminDashboardProps {
  onReturnToApp: () => void;
  isAdmin: boolean;
  onToggleAdminRole: (newAdminState: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onReturnToApp,
  isAdmin: _isAdmin,
  onToggleAdminRole,
}) => {
  const [activeTab, setActiveTab] = useState<ExerciseDictionaryCategory | 'overview' | 'users'>('users');
  const [entries, setEntries] = useState<ExerciseDictionaryEntry[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [editingEntry, setEditingEntry] = useState<ExerciseDictionaryEntry | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(true);
  const [_isLoading, setIsLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  const supabaseReady = isSupabaseConfigured();

  // Load entries on tab change
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [all, allUsers] = await Promise.all([
        exerciseDictionaryService.getAll(),
        adminUserService.getAllUsers(),
      ]);
      setEntries(all);
      setUsersCount(allUsers.length);
    } catch (err: any) {
      setFeedbackMessage({ text: 'שגיאה בטעינת נתונים: ' + (err?.message || 'שגיאה בלתי צפויה'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Handlers
  const handleSaveEntry = async (
    entryData: Omit<ExerciseDictionaryEntry, 'item_id' | 'created_at' | 'updated_at'>
  ) => {
    if (editingEntry) {
      const updated = await exerciseDictionaryService.update(editingEntry.item_id, entryData);
      if (updated) {
        showNotification(`התרגיל "${updated.title}" עודכן בהצלחה במסד הנתונים`);
      }
      setEditingEntry(null);
    } else {
      const created = await exerciseDictionaryService.create(entryData);
      showNotification(`התרגיל "${created.title}" נוסף בהצלחה למאגר (DDA רמה ${created.target_level})`);
    }
    await loadData();
  };

  const handleDeleteEntry = async (itemId: string) => {
    const success = await exerciseDictionaryService.delete(itemId);
    if (success) {
      showNotification('התרגיל נמחק בהצלחה ממסד הנתונים');
      await loadData();
    }
  };

  const handleToggleActive = async (entry: ExerciseDictionaryEntry) => {
    const updated = await exerciseDictionaryService.update(entry.item_id, {
      is_active: !entry.is_active,
    });
    if (updated) {
      showNotification(`סטטוס התרגיל עודכן ל-${updated.is_active ? 'פעיל' : 'מושבת'}`);
      await loadData();
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('האם לאפס את כל התרגילים למאגר ברירת המחדל? פעולה זו תמחק תרגילים מותאמים.')) {
      await exerciseDictionaryService.resetToDefaults();
      showNotification('המאגר אופס בהצלחה לתוכן ברירת המחדל');
      await loadData();
    }
  };

  const handleExportJson = async () => {
    const jsonStr = await exerciseDictionaryService.exportJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurofit_exercise_dictionary_${Date.now()}.json`;
    a.click();
    showNotification('קובץ JSON יוצא בהצלחה');
  };

  const handleImportJson = async () => {
    if (!importJsonText.trim()) return;
    const res = await exerciseDictionaryService.importJson(importJsonText);
    if (res.success) {
      showNotification(`יובאו בהצלחה ${res.count} תרגילים למאגר`);
      setShowImportModal(false);
      setImportJsonText('');
      await loadData();
    } else {
      showNotification(`שגיאה בייבוא: ${res.error}`, 'error');
    }
  };

  // Filter entries for current active category
  const currentCategoryEntries =
    activeTab === 'overview' || activeTab === 'users' ? entries : entries.filter((e) => e.category === activeTab);

  // Tab definitions
  const tabs = [
    { id: 'users' as const, label: 'ניהול משתמשים (User Management)', icon: Users, count: usersCount },
    { id: 'language' as const, label: 'חשיבה מילולית (Language)', icon: BookOpen, count: entries.filter(e => e.category === 'language').length },
    { id: 'attention' as const, label: 'קשב וסריקה (Visual Search)', icon: Search, count: entries.filter(e => e.category === 'attention').length },
    { id: 'speed' as const, label: 'מהירות תגובה (Processing Speed)', icon: Zap, count: entries.filter(e => e.category === 'speed').length },
    { id: 'memory' as const, label: 'זיכרון עבודה (Working Memory)', icon: Brain, count: entries.filter(e => e.category === 'memory').length },
    { id: 'overview' as const, label: 'סקירת מערכת ו-DB', icon: Database, count: entries.length },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Admin Top Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-600/30">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">NeuroFit CMS</span>
                <span className="bg-indigo-950 text-indigo-300 border border-indigo-700/50 text-[10px] font-mono font-semibold px-2 py-0.5 rounded">
                  Admin Panel v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">ניהול משתמשים, הזרקת תרגילים והגדרות DDA</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Supabase Status Indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                supabaseReady
                  ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-700/50 text-amber-300'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{supabaseReady ? 'Supabase Live' : 'Local Storage Mode'}</span>
            </div>

            {/* Logout Admin Button */}
            <button
              onClick={() => {
                adminUserService.setAdminSession(false);
                onToggleAdminRole(false);
                onReturnToApp();
              }}
              title="נעילת הרשאת מנהל ויציאה"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>נעילת מנהל</span>
            </button>

            {/* Return to Main App */}
            <button
              onClick={onReturnToApp}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>חזרה לדף הבית</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {feedbackMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 border ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-600'
                : 'bg-red-900 text-red-100 border-red-600'
            }`}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main CMS Layout with Sidebar + Content */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row p-4 gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            קטגוריות תרגילים (CMS Categories)
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setEditingEntry(null);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label.split(' ')[0]} {tab.label.split(' ')[1]}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-indigo-800/80 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              כלים מהירים למאגר
            </div>
            <button
              onClick={handleExportJson}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>ייצוא נתונים (Export JSON)</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>ייבוא נתונים (Import JSON)</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-300 hover:bg-rose-950/40 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
              <span>איפוס לברירת מחדל</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'users' ? (
            <UserManager
              onUserSwitched={() => {
                onReturnToApp();
              }}
              onNotification={(text, type) => showNotification(text, type)}
            />
          ) : activeTab === 'overview' ? (
            /* System Overview Tab */
            <div className="space-y-6">
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 shadow-lg">
                <h2 className="text-lg font-bold text-white mb-2">סטטוס מסד הנתונים ומאגר התרגילים</h2>
                <p className="text-xs text-slate-400 mb-6">
                  מערכת ה-CMS מאפשרת הזנה ישירה של תרגילים לטבלת <code className="text-amber-400 bg-slate-900 px-1 py-0.5 rounded">exercise_dictionary</code>.
                  מנוע האימון היומי של NeuroFit מושך את הפריטים בהתאם לרמת ה-DDA של כל מתאמן.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-900/80 border border-slate-750 p-4 rounded-xl">
                    <span className="text-[11px] text-slate-400 block mb-1">חשיבה מילולית</span>
                    <span className="text-2xl font-black text-emerald-400">
                      {entries.filter((e) => e.category === 'language').length}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">צמדי מילים והפכים</span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-750 p-4 rounded-xl">
                    <span className="text-[11px] text-slate-400 block mb-1">קשב וסריקה</span>
                    <span className="text-2xl font-black text-indigo-400">
                      {entries.filter((e) => e.category === 'attention').length}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">רשתות סריקה ומסיחים</span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-750 p-4 rounded-xl">
                    <span className="text-[11px] text-slate-400 block mb-1">מהירות תגובה</span>
                    <span className="text-2xl font-black text-amber-400">
                      {entries.filter((e) => e.category === 'speed').length}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">גירויי מיון והחלפת חוק</span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-750 p-4 rounded-xl">
                    <span className="text-[11px] text-slate-400 block mb-1">זיכרון עבודה</span>
                    <span className="text-2xl font-black text-blue-400">
                      {entries.filter((e) => e.category === 'memory').length}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">משחקי עקיבה מרחבית</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => setActiveTab('language')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    הוסף תרגיל חדש עכשיו
                  </button>
                  <button
                    onClick={handleExportJson}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ייצא את כל המאגר ל-JSON
                  </button>
                </div>
              </div>

              {/* All entries table */}
              <ContentDataGrid
                category={'language'}
                entries={entries}
                onEdit={(entry) => {
                  setActiveTab(entry.category);
                  setEditingEntry(entry);
                  setShowAddForm(true);
                }}
                onDelete={handleDeleteEntry}
                onToggleActive={handleToggleActive}
              />
            </div>
          ) : (
            /* Category CRUD Tab */
            <div className="space-y-4">
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>
                      {activeTab === 'language' && 'חשיבה מילולית ושליפה (Language)'}
                      {activeTab === 'attention' && 'קשב וסריקה חזותית (Visual Search)'}
                      {activeTab === 'speed' && 'מהירות עיבוד ומעבר משימות (Processing Speed)'}
                      {activeTab === 'memory' && 'זיכרון עבודה מרחבי (Working Memory)'}
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    הזרקה, עריכה וניהול פרמטרי רמות (1-10) עבור קטגוריה זו.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingEntry(null);
                    setShowAddForm(!showAddForm);
                  }}
                  className="self-start sm:self-auto flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddForm && !editingEntry ? 'הסתר טופס הוספה' : 'הוסף תרגיל לקטגוריה'}</span>
                </button>
              </div>

              {/* Content Form (for Add or Edit) */}
              {(showAddForm || editingEntry) && (
                <ContentForm
                  category={activeTab}
                  initialData={editingEntry}
                  onSave={handleSaveEntry}
                  onCancel={() => {
                    setEditingEntry(null);
                    setShowAddForm(false);
                  }}
                />
              )}

              {/* Data Grid Table */}
              <ContentDataGrid
                category={activeTab}
                entries={currentCategoryEntries}
                onEdit={(entry) => {
                  setEditingEntry(entry);
                  setShowAddForm(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={handleDeleteEntry}
                onToggleActive={handleToggleActive}
              />
            </div>
          )}
        </main>
      </div>

      {/* Import JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-5 shadow-2xl">
            <h3 className="font-bold text-sm text-white mb-2">ייבוא תרגילים מ-JSON</h3>
            <p className="text-xs text-slate-400 mb-3">
              הדביקו מערך JSON של תרגילים בפורמט <code className="text-amber-400">ExerciseDictionaryEntry[]</code>:
            </p>
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="[ { &quot;item_id&quot;: &quot;...&quot;, &quot;category&quot;: &quot;language&quot; ... } ]"
              className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-400 focus:outline-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-1.5 px-3 rounded-lg"
              >
                ביטול
              </button>
              <button
                onClick={handleImportJson}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 px-4 rounded-lg"
              >
                בצע ייבוא
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
