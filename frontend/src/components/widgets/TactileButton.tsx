import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useDyslexiaTheme } from '../../core/theme/ThemeContext';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  sublabel?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'outline' | 'amber';
  fullWidth?: boolean;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  label,
  sublabel,
  icon: Icon,
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const { getThemeClasses, getFontFamilyStyle } = useDyslexiaTheme();
  const theme = getThemeClasses();

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = `${theme.accent} shadow-md active:scale-[0.98]`;
      break;
    case 'amber':
      variantStyles = 'bg-amber-600 text-white hover:bg-amber-700 shadow-md active:scale-[0.98]';
      break;
    case 'secondary':
      variantStyles = `${theme.cardBg} ${theme.text} border-2 ${theme.border} shadow-sm active:scale-[0.98]`;
      break;
    case 'outline':
      variantStyles = `bg-transparent ${theme.text} border-2 ${theme.border} hover:bg-black/5 active:scale-[0.98]`;
      break;
  }

  return (
    <button
      style={{ fontFamily: getFontFamilyStyle() }}
      disabled={disabled}
      className={`
        flex items-center justify-between p-4 rounded-2xl transition-all duration-150 min-h-[56px]
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${variantStyles}
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center gap-4 text-left">
        {Icon && (
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Icon className="w-7 h-7" />
          </div>
        )}
        <div>
          <div className="text-xl font-bold tracking-wide leading-tight">{label}</div>
          {sublabel && <div className="text-sm opacity-85 mt-0.5 leading-snug">{sublabel}</div>}
        </div>
      </div>
    </button>
  );
};
