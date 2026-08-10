import React from 'react';
import { X, Type, Eye, Volume2, RotateCcw } from 'lucide-react';
import { useDyslexiaTheme } from '../../core/theme/ThemeContext';
import { DyslexiaFont, ThemeMode } from '../../types';

interface FontCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FontCustomizerModal: React.FC<FontCustomizerModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, getThemeClasses, getFontFamilyStyle } = useDyslexiaTheme();
  const theme = getThemeClasses();

  if (!isOpen) return null;

  const fontOptions: Array<{ id: DyslexiaFont; name: string; desc: string }> = [
    { id: 'Lexend', name: 'Lexend', desc: 'Designed for fluent reading' },
    { id: 'OpenDyslexic', name: 'OpenDyslexic', desc: 'Heavy bottom font weighted against rotation' },
    { id: 'Atkinson', name: 'Atkinson', desc: 'High-legibility braille institute font' },
    { id: 'System', name: 'System Sans', desc: 'Standard clean sans-serif' },
  ];

  const themeOptions: Array<{ id: ThemeMode; label: string; colorBg: string; colorText: string }> = [
    { id: 'sepia', label: 'Sepia Warm', colorBg: '#FAF4E8', colorText: '#2D2418' },
    { id: 'cream', label: 'Cream Soft', colorBg: '#FFFDF7', colorText: '#1C1917' },
    { id: 'soft-blue', label: 'Soft Blue', colorBg: '#F0F9FF', colorText: '#0C4A6E' },
    { id: 'light', label: 'Clean White', colorBg: '#FFFFFF', colorText: '#0F172A' },
    { id: 'dark', label: 'Dark High Contrast', colorBg: '#121826', colorText: '#E2E8F0' },
  ];

  const resetToDefaults = () => {
    updateSettings({
      fontFamily: 'Lexend',
      fontSize: 21,
      letterSpacing: 1.5,
      lineHeight: 1.8,
      themeMode: 'sepia',
      readingSpeed: 0.9,
      lineReaderHeight: 52,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div
        style={{ fontFamily: getFontFamilyStyle() }}
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl ${theme.bg} ${theme.text} border-t-2 sm:border-2 ${theme.border} p-5 shadow-2xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-black/10 dark:border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Type className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold tracking-wide">Reading & Font Customizer</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close customizer"
            className={`p-2 rounded-xl ${theme.cardBg} border ${theme.border} cursor-pointer active:scale-95`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Font Family Selection */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold uppercase tracking-wider opacity-80 mb-2 block">
              1. Dyslexia Font Family
            </label>
            <div className="grid grid-cols-1 gap-2">
              {fontOptions.map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateSettings({ fontFamily: f.id })}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    settings.fontFamily === f.id
                      ? 'border-amber-600 bg-amber-500/15 font-bold shadow-xs'
                      : `${theme.cardBg} ${theme.border}`
                  }`}
                >
                  <div>
                    <div className="text-base font-bold">{f.name}</div>
                    <div className="text-xs opacity-75">{f.desc}</div>
                  </div>
                  {settings.fontFamily === f.id && (
                    <span className="w-3 h-3 rounded-full bg-amber-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color Contrast Themes */}
          <div>
            <label className="text-sm font-bold uppercase tracking-wider opacity-80 mb-2 block">
              2. Contrast & Color Palette
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {themeOptions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateSettings({ themeMode: t.id })}
                  style={{ backgroundColor: t.colorBg, color: t.colorText }}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                    settings.themeMode === t.id ? 'border-amber-600 ring-2 ring-amber-500' : 'border-black/20'
                  }`}
                >
                  <div className="text-sm font-bold">{t.label}</div>
                  <div className="text-[10px] opacity-80">Aa Text</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Size Slider */}
          <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-2`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Text Size: {settings.fontSize}px</span>
              <span className="text-xs opacity-75">16px – 32px</span>
            </div>
            <input
              type="range"
              min="16"
              max="32"
              value={settings.fontSize}
              onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
              className="w-full accent-amber-600 h-2 bg-black/10 rounded-lg cursor-pointer"
            />
          </div>

          {/* Line Height & Letter Spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-2`}>
              <div className="flex justify-between items-center text-xs font-bold">
                <span>Line Spacing: {settings.lineHeight}x</span>
              </div>
              <input
                type="range"
                min="1.4"
                max="2.4"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => updateSettings({ lineHeight: Number(e.target.value) })}
                className="w-full accent-amber-600 h-2 bg-black/10 rounded-lg cursor-pointer"
              />
            </div>

            <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-2`}>
              <div className="flex justify-between items-center text-xs font-bold">
                <span>Letter Spacing: {settings.letterSpacing}px</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.5"
                value={settings.letterSpacing}
                onChange={(e) => updateSettings({ letterSpacing: Number(e.target.value) })}
                className="w-full accent-amber-600 h-2 bg-black/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Audio Speech Rate */}
          <div className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-2`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-600" />
                Read Aloud Speed: {settings.readingSpeed}x
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.3"
              step="0.1"
              value={settings.readingSpeed}
              onChange={(e) => updateSettings({ readingSpeed: Number(e.target.value) })}
              className="w-full accent-amber-600 h-2 bg-black/10 rounded-lg cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-black/10">
            <button
              onClick={resetToDefaults}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 p-2 rounded-lg hover:bg-black/5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Defaults
            </button>
            <button
              onClick={onClose}
              className="bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md cursor-pointer active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
