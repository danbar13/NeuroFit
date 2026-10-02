import React, { useState, useEffect } from 'react';
import type { UserProfile, CognitiveProfile } from '../../types/database';
import { adminUserService, type ResetUserOptions } from '../../lib/adminUserService';
import { INITIAL_FAMILY_GROUPS } from '../../lib/settingsService';
import {
  Users,
  UserPlus,
  RotateCcw,
  Trash2,
  Edit2,
  LogIn,
  Search,
  AlertTriangle,
  Key,
  Shield,
  Coins,
  Flame,
  Brain,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

interface UserManagerProps {
  currentAdminUserId?: string;
  onUserSwitched: (newUser: UserProfile) => void;
  onNotification: (text: string, type?: 'success' | 'error') => void;
}

export const UserManager: React.FC<UserManagerProps> = ({
  currentAdminUserId,
  onUserSwitched,
  onNotification,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [resettingUser, setResettingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formBirthYear, setFormBirthYear] = useState('1948');
  const [formFamily, setFormFamily] = useState('group_barkai');
  const [formIsAdmin, setFormIsAdmin] = useState(false);
  const [formCoins, setFormCoins] = useState('0');

  // Reset options state
  const [resetOptions, setResetOptions] = useState<ResetUserOptions>({
    resetBaseline: true,
    resetCoins: true,
    resetStreak: true,
    resetBadges: true,
    resetLogs: true,
  });

  // Password change form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Cognitive profiles cache
  const [userProfiles, setUserProfiles] = useState<Record<string, CognitiveProfile | null>>({});

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const all = await adminUserService.getAllUsers();
      setUsers(all);

      // Load cognitive profiles for each user
      const profilesMap: Record<string, CognitiveProfile | null> = {};
      for (const u of all) {
        profilesMap[u.user_id] = adminUserService.getUserCognitiveProfile(u.user_id);
      }
      setUserProfiles(profilesMap);
    } catch {
      onNotification('שגיאה בטעינת רשימת המשתמשים', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      filterRole === 'all' || (filterRole === 'admin' ? !!u.is_admin : !u.is_admin);
    return matchesSearch && matchesRole;
  });

  // Handlers
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormBirthYear('1950');
    setFormFamily('group_barkai');
    setFormIsAdmin(false);
    setFormCoins('0');
    setIsAddUserModalOpen(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormName(user.display_name);
    setFormBirthYear(user.birth_year ? user.birth_year.toString() : '1950');
    setFormFamily(user.family_group_id || 'group_barkai');
    setFormIsAdmin(!!user.is_admin);
    setFormCoins(user.total_coins.toString());
    setIsAddUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onNotification('נא להזין שם משתמש', 'error');
      return;
    }
    const birthYearNum = parseInt(formBirthYear, 10);
    if (isNaN(birthYearNum) || birthYearNum < 1910 || birthYearNum > 2024) {
      onNotification('נא להזין שנת לידה תקינה', 'error');
      return;
    }

    try {
      if (editingUser) {
        await adminUserService.updateUser(editingUser.user_id, {
          display_name: formName.trim(),
          birth_year: birthYearNum,
          family_group_id: formFamily,
          is_admin: formIsAdmin,
          total_coins: parseInt(formCoins, 10) || 0,
        });
        onNotification(`המשתמש "${formName}" עודכן בהצלחה!`);
      } else {
        await adminUserService.createUser({
          display_name: formName.trim(),
          birth_year: birthYearNum,
          family_group_id: formFamily,
          is_admin: formIsAdmin,
          total_coins: parseInt(formCoins, 10) || 0,
        });
        onNotification(`משתמש חדש "${formName}" נוסף בהצלחה למערכת!`);
      }
      setIsAddUserModalOpen(false);
      await loadUsers();
    } catch {
      onNotification('שגיאה בשמירת המשתמש', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await adminUserService.deleteUser(deletingUser.user_id);
      onNotification(`המשתמש "${deletingUser.display_name}" הוסר מהמערכת`);
      setDeletingUser(null);
      await loadUsers();
    } catch {
      onNotification('שגיאה במחיקת המשתמש', 'error');
    }
  };

  const handleConfirmReset = async () => {
    if (!resettingUser) return;
    try {
      await adminUserService.resetUserData(resettingUser.user_id, resetOptions);
      onNotification(`הנתונים של "${resettingUser.display_name}" אופסו בהצלחה`);
      setResettingUser(null);
      await loadUsers();
    } catch {
      onNotification('שגיאה באיפוס נתוני המשתמש', 'error');
    }
  };

  const handleSwitchUser = (user: UserProfile) => {
    adminUserService.switchActiveUser(user);
    onUserSwitched(user);
    onNotification(`התחברת כעת כמשתמש: "${user.display_name}"`);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('הסיסמה החדשה ואימות הסיסמה אינם תואמים');
      return;
    }
    const res = adminUserService.setAdminPassword(oldPassword, newPassword);
    if (res.success) {
      onNotification('סיסמת האדמין עודכנה בהצלחה!');
      setIsPasswordModalOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(res.message);
    }
  };

  const totalCoinsSum = users.reduce((sum, u) => sum + (u.total_coins || 0), 0);
  const baselineCompletedCount = Object.values(userProfiles).filter((p) => p && p.baseline_completed).length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">סך מתאמנים</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-3xl font-black text-white">{users.length}</span>
          <span className="text-[11px] text-slate-400 block mt-1">רשומים במערכת</span>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">כוילו בהצלחה</span>
            <Brain className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-emerald-400">{baselineCompletedCount}</span>
          <span className="text-[11px] text-slate-400 block mt-1">עברו מבדק כיול ראשוני</span>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">סך מטבעות</span>
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-amber-400">{totalCoinsSum.toLocaleString()}</span>
          <span className="text-[11px] text-slate-400 block mt-1">נצברו על ידי כלל המשתמשים</span>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">מנהלי מערכת</span>
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-3xl font-black text-purple-400">
            {users.filter((u) => u.is_admin).length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">בעלי הרשאות אדמין</span>
        </div>
      </div>

      {/* 2. Actions & Controls Bar */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-md">
        {/* Search & Filters */}
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש מתאמן לפי שם או מזהה..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">כל התפקידים</option>
            <option value="user">מתאמנים רגילים</option>
            <option value="admin">מנהלי מערכת (Admins)</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            title="שינוי סיסמת אדמין"
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">אבטחת מנהל</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>הוספת משתמש חדש</span>
          </button>
        </div>
      </div>

      {/* 3. Users List / Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">טוען משתמשים...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-2xl text-slate-400">
            לא נמצאו משתמשים התואמים את החיפוש
          </div>
        ) : (
          filteredUsers.map((user) => {
            const cognitive = userProfiles[user.user_id];
            const currentYear = new Date().getFullYear();
            const age = user.birth_year ? currentYear - user.birth_year : null;
            const familyGroup = INITIAL_FAMILY_GROUPS.find((g) => g.group_id === user.family_group_id);
            const isCurrentActive = currentAdminUserId === user.user_id;

            return (
              <div
                key={user.user_id}
                className={`bg-slate-800/90 border transition-all rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-slate-600 ${
                  isCurrentActive ? 'border-indigo-500/80 bg-indigo-950/20' : 'border-slate-700'
                }`}
              >
                {/* User Info & Badges */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  {/* Avatar Circle */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                    {user.display_name.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-lg text-white truncate">
                        {user.display_name}
                      </span>
                      {user.is_admin ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-950 border border-purple-500/40 text-purple-300 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-purple-400" />
                          <span>מנהל מערכת</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-400">
                          מתאמן
                        </span>
                      )}
                      {isCurrentActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-900/80 border border-indigo-400/50 text-indigo-200">
                          מחובר כעת
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {age !== null && (
                        <span>
                          גיל: <strong className="text-slate-200">{age}</strong> ({user.birth_year})
                        </span>
                      )}
                      <span>•</span>
                      <span>
                        קבוצה: <strong className="text-slate-200">{familyGroup?.group_name || 'כללי'}</strong>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-500">ID: {user.user_id}</span>
                    </div>

                    {/* Stats & Cognitive Profile Pill */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Coins className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{user.total_coins} מטבעות</span>
                      </div>
                      <div className="flex items-center gap-1 text-rose-400 font-bold">
                        <Flame className="w-3.5 h-3.5 fill-rose-400" />
                        <span>רצף {user.current_streak} ימים</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Brain className="w-3.5 h-3.5 text-blue-400" />
                        {cognitive?.baseline_completed ? (
                          <span className="text-emerald-400 font-semibold">
                            כויל: זיכרון {cognitive.memory_level} | קשב {cognitive.attention_level} | מהירות {cognitive.speed_level} | שפה {cognitive.language_level}
                          </span>
                        ) : (
                          <span className="text-amber-400/90 font-medium">טרם כויל (מבדק ראשוני ממתין)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-700/60 justify-end">
                  {/* Switch to this user */}
                  <button
                    onClick={() => handleSwitchUser(user)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="התחבר כמשתמש זה"
                  >
                    <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                    <span>התחבר כמשתמש</span>
                  </button>

                  {/* Reset Data */}
                  <button
                    onClick={() => {
                      setResettingUser(user);
                      setResetOptions({
                        resetBaseline: true,
                        resetCoins: true,
                        resetStreak: true,
                        resetBadges: true,
                        resetLogs: true,
                      });
                    }}
                    className="px-3 py-2 bg-slate-900 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-500/50 rounded-xl text-xs font-bold text-amber-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="איפוס נתונים למשתמש זה"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>איפוס נתונים</span>
                  </button>

                  {/* Edit User */}
                  <button
                    onClick={() => handleOpenEditModal(user)}
                    className="px-2.5 py-2 bg-slate-900 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                    title="עריכת פרטי משתמש"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">עריכה</span>
                  </button>

                  {/* Delete User */}
                  <button
                    onClick={() => setDeletingUser(user)}
                    className="px-2.5 py-2 bg-slate-900 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/50 rounded-xl text-xs font-bold text-rose-400 flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                    title="מחיקת משתמש"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">מחיקה</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT USER */}
      {/* ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsAddUserModalOpen(false)}
              className="absolute left-4 top-4 w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              <span>{editingUser ? 'עריכת פרטי משתמש' : 'הוספת מתאמן חדש למערכת'}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {editingUser ? 'עדכון פרטים, קבוצה או הרשאות' : 'הגדרת משתמש חדש במערכת NeuroFit'}
            </p>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  שם מלא / כינוי
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="לדוגמה: סבתא שרה, דוד כהן"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    שנת לידה
                  </label>
                  <input
                    type="number"
                    min="1920"
                    max="2020"
                    value={formBirthYear}
                    onChange={(e) => setFormBirthYear(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    מטבעות התחלתיים
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formCoins}
                    onChange={(e) => setFormCoins(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  קבוצה משפחתית (Family Group)
                </label>
                <select
                  value={formFamily}
                  onChange={(e) => setFormFamily(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {INITIAL_FAMILY_GROUPS.map((g) => (
                    <option key={g.group_id} value={g.group_id}>
                      {g.group_name} ({g.invite_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">הרשאת מנהל מערכת (Admin)</span>
                  <span className="text-xs text-slate-400">מאפשר כניסה ללוח ה-CMS ולניהול משתמשים</span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsAdmin}
                  onChange={(e) => setFormIsAdmin(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white text-sm font-bold cursor-pointer"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
                >
                  {editingUser ? 'שמור שינויים' : 'צור משתמש חדש'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RESET USER DATA */}
      {/* ========================================================================= */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              איפוס נתונים עבור: {resettingUser.display_name}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              סמנו את הנתונים שברצונכם לאפס עבור מתאמן זה:
            </p>

            <div className="space-y-3 mb-6">
              <label className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-800">
                <div>
                  <span className="text-sm font-bold text-white block">איפוס מבדק כיול ראשוני (Baseline)</span>
                  <span className="text-xs text-slate-400">המתאמן יחויב לבצע מבדק הערכה חדש בכניסה הבאה</span>
                </div>
                <input
                  type="checkbox"
                  checked={resetOptions.resetBaseline}
                  onChange={(e) => setResetOptions({ ...resetOptions, resetBaseline: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <label className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-800">
                <div>
                  <span className="text-sm font-bold text-white block">איפוס מטבעות (Coins) ל-0</span>
                  <span className="text-xs text-slate-400">מאפס את המטבעות שנצברו עד כה</span>
                </div>
                <input
                  type="checkbox"
                  checked={resetOptions.resetCoins}
                  onChange={(e) => setResetOptions({ ...resetOptions, resetCoins: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <label className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-800">
                <div>
                  <span className="text-sm font-bold text-white block">איפוס רצף ימים (Streak) ל-0</span>
                  <span className="text-xs text-slate-400">מאפס את מד הרצף היומי</span>
                </div>
                <input
                  type="checkbox"
                  checked={resetOptions.resetStreak}
                  onChange={(e) => setResetOptions({ ...resetOptions, resetStreak: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <label className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-800">
                <div>
                  <span className="text-sm font-bold text-white block">איפוס תגים והישגים (Badges)</span>
                  <span className="text-xs text-slate-400">מוחק את התגים שנפתחו באפליקציה</span>
                </div>
                <input
                  type="checkbox"
                  checked={resetOptions.resetBadges}
                  onChange={(e) => setResetOptions({ ...resetOptions, resetBadges: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <label className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-800">
                <div>
                  <span className="text-sm font-bold text-white block">איפוס יומני אימון ותרגילים</span>
                  <span className="text-xs text-slate-400">מוחק את היסטוריית הפעלות התרגילים והסשנים</span>
                </div>
                <input
                  type="checkbox"
                  checked={resetOptions.resetLogs}
                  onChange={(e) => setResetOptions({ ...resetOptions, resetLogs: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() =>
                  setResetOptions({
                    resetBaseline: true,
                    resetCoins: true,
                    resetStreak: true,
                    resetBadges: true,
                    resetLogs: true,
                  })
                }
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                בחר איפוס מלא (הכל)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 text-slate-300 hover:text-white text-sm font-bold cursor-pointer"
                >
                  ביטול
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm cursor-pointer shadow-md"
                >
                  בצע איפוס
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              מחיקת משתמש: {deletingUser.display_name}
            </h3>
            <p className="text-sm text-slate-300 mb-6">
              האם אתם בטוחים שברצונכם למחוק לצמיתות את המשתמש <strong>"{deletingUser.display_name}"</strong>?
              פעולה זו תמחק את כל היסטוריית האימונים, המטבעות, הרצפים והכיולים שלו.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white text-sm font-bold cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm cursor-pointer shadow-md"
              >
                כן, מחק משתמש
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADMIN PASSWORD SETTINGS */}
      {/* ========================================================================= */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute left-4 top-4 w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Key className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">ניהול סיסמת מנהל מערכת</h3>
            <p className="text-xs text-slate-400 mb-6">
              שינוי הסיסמה הנדרשת לכניסה ללוח הניהול (CMS)
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  סיסמה נוכחית (Current Password)
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="ברירת מחדל: admin123"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute left-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  סיסמה חדשה (New Password)
                </label>
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="לפחות 4 תווים"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  אימות סיסמה חדשה (Confirm New Password)
                </label>
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="הזינו שוב את הסיסמה החדשה"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
                  {passwordError}
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white text-sm font-bold cursor-pointer"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer"
                >
                  שמור סיסמה חדשה
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
