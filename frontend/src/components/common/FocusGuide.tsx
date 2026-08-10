import React, { useState, useEffect } from 'react';
import { Eye, MoveVertical } from 'lucide-react';
import { useDyslexiaTheme } from '../../core/theme/ThemeContext';

interface FocusGuideProps {
  isActive: boolean;
  onToggle: () => void;
}

export const FocusGuide: React.FC<FocusGuideProps> = ({ isActive, onToggle }) => {
  const { settings, updateSettings } = useDyslexiaTheme();
  const [posY, setPosY] = useState<number>(200);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        setPosY(e.clientY);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Top darkened area */}
      <div
        className="absolute top-0 left-0 right-0 bg-black/40 backdrop-blur-[1px] transition-all duration-75"
        style={{ height: Math.max(0, posY - settings.lineReaderHeight / 2) }}
      />

      {/* Clear reading window */}
      <div
        onPointerDown={() => setIsDragging(true)}
        className="absolute left-0 right-0 pointer-events-auto cursor-grab active:cursor-grabbing border-y-2 border-amber-500/80 bg-amber-400/10 flex items-center justify-between px-4 transition-all duration-75 shadow-md"
        style={{
          top: Math.max(0, posY - settings.lineReaderHeight / 2),
          height: settings.lineReaderHeight,
        }}
      >
        <div className="flex items-center gap-2 bg-amber-500/20 px-2 py-0.5 rounded-md text-amber-900 dark:text-amber-100 text-xs font-bold pointer-events-none">
          <MoveVertical className="w-3.5 h-3.5" />
          <span>Line Focus Ruler (Drag)</span>
        </div>

        <button
          onClick={onToggle}
          className="pointer-events-auto p-1.5 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-500/30 text-xs font-semibold"
        >
          Hide Guide
        </button>
      </div>

      {/* Bottom darkened area */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-[1px] transition-all duration-75"
        style={{
          top: posY + settings.lineReaderHeight / 2,
        }}
      />
    </div>
  );
};
