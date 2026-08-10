import React from 'react';
import { ArrowLeft, Type, Sun, Moon, Sparkles, SlidersHorizontal, History } from 'lucide-react';
import { useDyslexiaTheme } from '../../core/theme/ThemeContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenFontCustomizer?: () => void;
  onOpenHistory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  onOpenFontCustomizer,
  onOpenHistory,
}) => {
  const { getThemeClasses, getFontFamilyStyle, settings, updateSettings } = useDyslexiaTheme();
  const theme = getThemeClasses();

  const toggleQuickTheme = () => {
    const themes: Array<'sepia' | 'dark' | 'cream' | 'light'> = ['sepia', 'dark', 'cream', 'light'];
    const currentIndex = themes.indexOf(settings.themeMode as any);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    updateSettings({ themeMode: nextTheme });
  };

  return (
    <header
      style={{ fontFamily: getFontFamilyStyle() }}
      className={`sticky top-0 z-30 px-4 py-3 border-b-2 ${theme.border} ${theme.bg} transition-colors flex items-center justify-between shadow-xs`}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className={`p-3 rounded-2xl ${theme.cardBg} border ${theme.border} active:scale-95 transition-transform cursor-pointer`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-wide leading-tight">{title}</h1>
          <div className="flex items-center gap-1.5 text-xs opacity-75 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Dyslexia Assistant</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            aria-label="Document history"
            title="Recent Documents"
            className={`p-2.5 rounded-xl ${theme.cardBg} border ${theme.border} hover:opacity-90 active:scale-95 transition-all cursor-pointer`}
          >
            <History className="w-5 h-5" />
          </button>
        )}

        {onOpenFontCustomizer && (
          <button
            onClick={onOpenFontCustomizer}
            aria-label="Customize text appearance"
            title="Text Appearance"
            className={`p-2.5 rounded-xl ${theme.cardBg} border ${theme.border} hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer`}
          >
            <Type className="w-5 h-5 text-amber-600" />
            <SlidersHorizontal className="w-4 h-4 opacity-75" />
          </button>
        )}

        <button
          onClick={toggleQuickTheme}
          aria-label="Toggle theme contrast mode"
          title={`Theme: ${settings.themeMode}`}
          className={`p-2.5 rounded-xl ${theme.cardBg} border ${theme.border} hover:opacity-90 active:scale-95 transition-all cursor-pointer capitalize font-semibold text-xs flex items-center gap-1.5`}
        >
          {settings.themeMode === 'dark' ? (
            <Moon className="w-5 h-5 text-indigo-400" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500" />
          )}
          <span className="hidden sm:inline">{settings.themeMode}</span>
        </button>
      </div>
    </header>
  );
};
