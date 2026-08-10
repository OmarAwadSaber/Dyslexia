import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';
import { useDyslexiaTheme } from '../../core/theme/ThemeContext';

interface MobileContainerFrameProps {
  children: React.ReactNode;
}

export const MobileContainerFrame: React.FC<MobileContainerFrameProps> = ({ children }) => {
  const { getThemeClasses, getFontFamilyStyle } = useDyslexiaTheme();
  const theme = getThemeClasses();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-4">
      {/* Outer Phone Shell */}
      <div className="w-full max-w-md sm:max-w-lg min-h-screen sm:min-h-[880px] sm:h-[92vh] bg-black sm:rounded-[44px] sm:p-3 sm:shadow-2xl border-0 sm:border-8 sm:border-slate-800 flex flex-col relative overflow-hidden">
        {/* Android Status Bar */}
        <div className="bg-black text-white px-6 py-2 flex items-center justify-between text-xs font-mono select-none z-40 shrink-0">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="w-20 h-4 bg-slate-900 rounded-full hidden sm:block border border-slate-800" />
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Screen Content Wrapper */}
        <div
          style={{ fontFamily: getFontFamilyStyle() }}
          className={`flex-1 ${theme.bg} ${theme.text} overflow-y-auto sm:rounded-[32px] relative transition-colors`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
