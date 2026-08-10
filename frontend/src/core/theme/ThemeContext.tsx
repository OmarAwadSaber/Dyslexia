import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings, ThemeMode, DyslexiaFont } from '../../types';

interface ThemeContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  getThemeClasses: () => { bg: string; text: string; cardBg: string; border: string; accent: string };
  getFontFamilyStyle: () => string;
}

const defaultSettings: UserSettings = {
  fontFamily: 'Lexend',
  fontSize: 21,
  letterSpacing: 1.5,
  lineHeight: 1.8,
  themeMode: 'sepia',
  readingSpeed: 0.9,
  showLineReader: false,
  lineReaderHeight: 52,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('dyslexia_settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('dyslexia_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const getThemeClasses = () => {
    switch (settings.themeMode) {
      case 'sepia':
        return {
          bg: 'bg-[#FAF4E8]',
          text: 'text-[#2D2418]',
          cardBg: 'bg-[#F2E8D5]',
          border: 'border-[#D8C7A3]',
          accent: 'bg-[#D97706] text-white',
        };
      case 'dark':
        return {
          bg: 'bg-[#121826]',
          text: 'text-[#E2E8F0]',
          cardBg: 'bg-[#1E293B]',
          border: 'border-[#334155]',
          accent: 'bg-[#3B82F6] text-white',
        };
      case 'cream':
        return {
          bg: 'bg-[#FFFDF7]',
          text: 'text-[#1C1917]',
          cardBg: 'bg-[#F5F2E9]',
          border: 'border-[#E7E2D4]',
          accent: 'bg-[#059669] text-white',
        };
      case 'soft-blue':
        return {
          bg: 'bg-[#F0F9FF]',
          text: 'text-[#0C4A6E]',
          cardBg: 'bg-[#E0F2FE]',
          border: 'border-[#BAE6FD]',
          accent: 'bg-[#0284C7] text-white',
        };
      case 'light':
      default:
        return {
          bg: 'bg-[#F8FAFC]',
          text: 'text-[#0F172A]',
          cardBg: 'bg-white',
          border: 'border-[#E2E8F0]',
          accent: 'bg-[#2563EB] text-white',
        };
    }
  };

  const getFontFamilyStyle = () => {
    switch (settings.fontFamily) {
      case 'OpenDyslexic':
        return '"OpenDyslexic", "Comic Sans MS", cursive, sans-serif';
      case 'Atkinson':
        return '"Atkinson Hyperlegible", sans-serif';
      case 'Lexend':
        return '"Lexend", sans-serif';
      case 'System':
      default:
        return 'system-ui, -apple-system, sans-serif';
    }
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, getThemeClasses, getFontFamilyStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useDyslexiaTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useDyslexiaTheme must be used within a ThemeProvider');
  }
  return context;
};
