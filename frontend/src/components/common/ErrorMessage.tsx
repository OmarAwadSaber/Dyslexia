import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useDyslexiaTheme } from '../../core/theme/ThemeContext';
import { TactileButton } from '../widgets/TactileButton';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "We couldn't read this document",
  message,
  onRetry,
  onBack,
}) => {
  const { getThemeClasses, getFontFamilyStyle } = useDyslexiaTheme();
  const theme = getThemeClasses();

  return (
    <div
      style={{ fontFamily: getFontFamilyStyle() }}
      className={`p-6 rounded-3xl ${theme.cardBg} border-2 border-amber-600/50 shadow-lg space-y-5 my-4 max-w-lg mx-auto`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-wide">{title}</h3>
          <p className="text-base leading-relaxed opacity-90">{message}</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1 text-sm leading-snug">
        <span className="font-bold">Tips for best reading results:</span>
        <ul className="list-disc list-inside opacity-85 space-y-1 pl-1">
          <li>Hold your camera steady in bright light</li>
          <li>Ensure text is oriented straight</li>
          <li>Avoid severe shadows or glossy glare</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {onRetry && (
          <TactileButton
            label="Try Again"
            icon={RefreshCw}
            variant="amber"
            fullWidth
            onClick={onRetry}
          />
        )}
        {onBack && (
          <TactileButton
            label="Go Back"
            icon={ArrowLeft}
            variant="outline"
            fullWidth
            onClick={onBack}
          />
        )}
      </div>
    </div>
  );
};
