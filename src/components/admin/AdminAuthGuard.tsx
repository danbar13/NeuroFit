import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Lock, Key, Eye, EyeOff } from 'lucide-react';
import { adminUserService } from '../../lib/adminUserService';

interface AdminAuthGuardProps {
  isAdmin: boolean;
  onToggleAdminRole: (newAdminState: boolean) => void;
  onReturnToApp: () => void;
  children: React.ReactNode;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({
  isAdmin,
  onToggleAdminRole,
  onReturnToApp,
  children,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setErrorMsg('יש להזין סיסמת מנהל');
      return;
    }

    const isValid = adminUserService.verifyAdminPassword(passcode);
    if (isValid) {
      adminUserService.setAdminSession(true);
      onToggleAdminRole(true);
      setErrorMsg('');
      setPasscode('');
    } else {
      setErrorMsg('סיסמת מנהל שגויה. אנא נסו שוב (סיסמת ברירת מחדל: admin123)');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-center w-16 h-16 bg-red-950/60 border border-red-500/30 rounded-2xl text-red-400 mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">גישת מנהל מערכת מאובטחת</h1>
            <p className="text-slate-400 text-sm">
              אזור הניהול (CMS וניהול משתמשים) מוגן בסיסמה למורשים בלבד.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                סיסמת מנהל (Admin Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="הזינו סיסמת מנהל (ברירת מחדל: admin123)"
                  autoFocus
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-11 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-right font-mono"
                />
                <Key className="w-5 h-5 text-slate-500 absolute right-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-200 p-1"
                  title={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorMsg && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
            >
              אימות וכניסה כמנהל מערכת
            </button>
          </form>

          <div className="pt-4 border-t border-slate-700/60 flex flex-col gap-3">
            <button
              type="button"
              onClick={onReturnToApp}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-0" />
              <span>חזרה לאפליקציית המתאמנים (NeuroFit)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
