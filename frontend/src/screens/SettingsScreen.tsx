import React, { useState } from 'react';
import { ArrowLeft, User, Key, CheckCircle2, Sliders, Server, Shield, Sparkles } from 'lucide-react';
import { useDyslexiaTheme } from '../core/theme/ThemeContext';
import { API_BASE_URL } from '../core/config/api';
import { authService } from '../services/authService';

interface SettingsScreenProps {
  onBack: () => void;
  onOpenCustomizer: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onOpenCustomizer }) => {
  const { getThemeClasses, getFontFamilyStyle, settings } = useDyslexiaTheme();
  const theme = getThemeClasses();

  const [username, setUsername] = useState<string>('dyslexia_user');
  const [password, setPassword] = useState<string>('••••••••');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!authService.getAccessToken());
  const [authMsg, setAuthMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthMsg(null);
      await authService.login(username, password);
      setIsLoggedIn(true);
      setAuthMsg('Successfully authenticated with JWT token!');
    } catch (err: any) {
      setAuthMsg('Authentication failed: ' + err.message);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setAuthMsg('Logged out.');
  };

  return (
    <div
      style={{ fontFamily: getFontFamilyStyle() }}
      className={`min-h-[calc(100vh-64px)] p-4 sm:p-6 space-y-6 max-w-2xl mx-auto ${theme.bg}`}
    >
      <div className="flex items-center gap-3 pb-2 border-b border-black/10">
        <button
          onClick={onBack}
          aria-label="Back"
          className={`p-2.5 rounded-xl ${theme.cardBg} border ${theme.border} cursor-pointer active:scale-95`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold tracking-wide">App & Account Settings</h2>
      </div>

      {/* Typography Quick Action */}
      <div className={`p-5 rounded-3xl ${theme.cardBg} border-2 ${theme.border} space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-amber-600" />
            <h3 className="text-lg font-bold">Dyslexia Typography Preferences</h3>
          </div>
          <button
            onClick={onOpenCustomizer}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs cursor-pointer active:scale-95"
          >
            Customize
          </button>
        </div>
        <div className="text-sm opacity-80 grid grid-cols-2 gap-2">
          <div>Font: <span className="font-bold">{settings.fontFamily}</span></div>
          <div>Size: <span className="font-bold">{settings.fontSize}px</span></div>
          <div>Theme: <span className="font-bold capitalize">{settings.themeMode}</span></div>
          <div>TTS Rate: <span className="font-bold">{settings.readingSpeed}x</span></div>
        </div>
      </div>

      {/* Backend API Configuration */}
      <div className={`p-5 rounded-3xl ${theme.cardBg} border-2 ${theme.border} space-y-3`}>
        <div className="flex items-center gap-2">
          <Server className="w-6 h-6 text-amber-600" />
          <h3 className="text-lg font-bold">Backend Service API</h3>
        </div>
        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-1 text-sm font-mono">
          <div>Base API URL: <span className="text-amber-700 dark:text-amber-400 font-bold">{API_BASE_URL}</span></div>
          <div>Engine: <span className="font-semibold">Express Node + Gemini 2.5 Flash AI</span></div>
        </div>
      </div>

      {/* JWT Authentication Form */}
      <div className={`p-5 rounded-3xl ${theme.cardBg} border-2 ${theme.border} space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-600" />
            <h3 className="text-lg font-bold">JWT Authentication</h3>
          </div>
          {isLoggedIn && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/15 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" /> Authenticated
            </span>
          )}
        </div>

        {authMsg && (
          <div className="p-3 rounded-xl bg-amber-500/15 text-xs font-bold text-amber-800">
            {authMsg}
          </div>
        )}

        {isLoggedIn ? (
          <div className="space-y-3">
            <p className="text-sm opacity-80">
              Connected as <span className="font-bold text-amber-600">{username}</span>.
            </p>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm cursor-pointer active:scale-95"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase opacity-80 block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full p-3 rounded-xl ${theme.cardBg} border ${theme.border} font-bold text-sm`}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase opacity-80 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 rounded-xl ${theme.cardBg} border ${theme.border} font-bold text-sm`}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 text-white font-bold text-sm cursor-pointer active:scale-95 shadow-md"
            >
              Login with JWT (/api/auth/jwt/create/)
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
