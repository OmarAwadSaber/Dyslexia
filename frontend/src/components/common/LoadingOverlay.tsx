import React from 'react';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useDyslexiaTheme } from '../../core/theme/ThemeContext';

interface LoadingOverlayProps {
  message?: string;
  step?: 'ocr' | 'upload' | 'ai' | 'complete';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Reading document...',
  step = 'ocr',
}) => {
  const { getThemeClasses, getFontFamilyStyle } = useDyslexiaTheme();
  const theme = getThemeClasses();

  return (
    <div
      style={{ fontFamily: getFontFamilyStyle() }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 ${theme.bg} ${theme.text} bg-opacity-95`}
    >
      <div className={`p-8 rounded-3xl ${theme.cardBg} border-2 ${theme.border} max-w-md w-full text-center shadow-xl space-y-6`}>
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
          </div>
          <Sparkles className="w-6 h-6 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-wide">{message}</h2>
          <p className="text-base opacity-80 leading-relaxed">
            Please wait while we make this text easier and clearer to read.
          </p>
        </div>

        {/* Step indicator */}
        <div className="space-y-3 pt-2 text-left">
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${step === 'ocr' ? 'border-amber-500 bg-amber-500/10 font-bold' : 'border-transparent opacity-60'}`}>
            <CheckCircle2 className={`w-5 h-5 ${step === 'ocr' ? 'text-amber-600' : 'text-gray-400'}`} />
            <span className="text-sm">1. Reading characters from document</span>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl border ${step === 'upload' ? 'border-amber-500 bg-amber-500/10 font-bold' : 'border-transparent opacity-60'}`}>
            <CheckCircle2 className={`w-5 h-5 ${step === 'upload' ? 'text-amber-600' : 'text-gray-400'}`} />
            <span className="text-sm">2. Sending text to reader engine</span>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl border ${step === 'ai' ? 'border-amber-500 bg-amber-500/10 font-bold' : 'border-transparent opacity-60'}`}>
            <CheckCircle2 className={`w-5 h-5 ${step === 'ai' ? 'text-amber-600' : 'text-gray-400'}`} />
            <span className="text-sm">3. Simplifying words & formatting layout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
