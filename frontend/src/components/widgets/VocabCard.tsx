import React from 'react';
import { Volume2, BookOpen } from 'lucide-react';
import { DifficultWord } from '../../types';
import { ttsService } from '../../services/ttsService';
import { useDyslexiaTheme } from '../../core/theme/ThemeContext';

interface VocabCardProps {
  item: DifficultWord;
}

export const VocabCard: React.FC<VocabCardProps> = ({ item }) => {
  const { getThemeClasses, getFontFamilyStyle, settings } = useDyslexiaTheme();
  const theme = getThemeClasses();

  const playPronunciation = () => {
    ttsService.speak(item.word, { rate: 0.8 });
  };

  return (
    <div
      style={{ fontFamily: getFontFamilyStyle() }}
      className={`p-4 rounded-2xl ${theme.cardBg} border-2 ${theme.border} shadow-sm flex flex-col gap-2`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
          <span className="text-xl font-bold tracking-wide">{item.word}</span>
        </div>
        <button
          onClick={playPronunciation}
          aria-label={`Listen to pronunciation of ${item.word}`}
          className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Volume2 className="w-5 h-5" />
          <span className="text-xs font-semibold">Listen</span>
        </button>
      </div>

      {item.phonetic && (
        <div className="text-sm font-mono opacity-75 italic bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg w-fit">
          Pronunciation: {item.phonetic}
        </div>
      )}

      <p className="text-base leading-relaxed opacity-90 mt-1">{item.definition}</p>
    </div>
  );
};
