import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Lock, Key } from 'lucide-react';

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
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default demo admin code or quick unlock
    if (passcode === 'admin123' || passcode === 'neurofit' || passcode === '') {
      onToggleAdminRole(true);
      setErrorMsg('');
    } else {
      setErrorMsg('קוד מנהל שגוי. נסו: admin123 או לחצו על כפתור התחברות מהירה');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-center w-16 h-16 bg-red-950/60 border border-red-500/30 rounded-2xl text-red-400 mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">גישת מנהלים מאובטחת</h1>
            <p className="text-slate-400 text-sm">
              אזור ניהול התוכן (CMS) מוגבל למשתמשים בעלי הרשאת <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">is_admin == true</code> בלבד.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                קוד אימות מנהל (Passcode)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="הזינו סיסמת מנהל (ברירת מחדל: admin123)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <Key className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
              </div>
              {errorMsg && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
            >
              כניסה כמנהל מערכת (Verify & Enter)
            </button>
          </form>

          <div className="pt-4 border-t border-slate-700/60 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onToggleAdminRole(true)}
              className="text-xs text-slate-400 hover:text-slate-200 underline text-center"
            >
              ⚡ מעקף פיתוח: הפעל הרשאת מנהל בלחיצה אחת (Dev Admin Toggle)
            </button>

            <button
              type="button"
              onClick={onReturnToApp}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה לאפליקציית המתאמנים (NeuroFit)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
