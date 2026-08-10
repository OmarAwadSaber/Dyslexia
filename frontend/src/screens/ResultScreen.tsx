import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Pause,
  Play,
  RotateCcw,
  Copy,
  Check,
  Eye,
  SlidersHorizontal,
  BookOpen,
  ListOrdered,
  FileText,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { useDyslexiaTheme } from '../core/theme/ThemeContext';
import { VocabCard } from '../components/widgets/VocabCard';
import { ttsService } from '../services/ttsService';

interface ResultScreenProps {
  document: DocumentItem;
  onBackToHome: () => void;
  onOpenCustomizer: () => void;
  onToggleLineReader: () => void;
  isLineReaderActive: boolean;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  document,
  onBackToHome,
  onOpenCustomizer,
  onToggleLineReader,
  isLineReaderActive,
}) => {
  const { getThemeClasses, getFontFamilyStyle, settings } = useDyslexiaTheme();
  const theme = getThemeClasses();

  const [activeTab, setActiveTab] = useState<'simplified' | 'bullets' | 'vocab' | 'original'>('simplified');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const processed = document.processed_data;
  const simplifiedText = processed?.simplifiedText || document.raw_text;

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  const togglePlayTTS = () => {
    if (isPlaying) {
      ttsService.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      ttsService.speak(simplifiedText, {
        rate: settings.readingSpeed,
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  const stopTTS = () => {
    ttsService.stop();
    setIsPlaying(false);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(simplifiedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{ fontFamily: getFontFamilyStyle() }}
      className={`min-h-[calc(100vh-64px)] pb-32 p-4 sm:p-6 max-w-3xl mx-auto space-y-5 ${theme.bg} ${theme.text}`}
    >
      {/* Top Banner Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className={`px-4 py-2.5 rounded-2xl ${theme.cardBg} border ${theme.border} font-bold text-sm flex items-center gap-2 active:scale-95 cursor-pointer shadow-xs`}
        >
          <ArrowLeft className="w-5 h-5 text-amber-600" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLineReader}
            aria-label="Toggle Line Focus Ruler"
            className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
              isLineReaderActive
                ? 'bg-amber-500 text-white border-amber-600'
                : `${theme.cardBg} ${theme.border}`
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Line Ruler</span>
          </button>

          <button
            onClick={onOpenCustomizer}
            aria-label="Customize typography"
            className={`p-2.5 rounded-xl ${theme.cardBg} border ${theme.border} cursor-pointer active:scale-95`}
          >
            <SlidersHorizontal className="w-5 h-5 text-amber-600" />
          </button>
        </div>
      </div>

      {/* Summary Box */}
      {processed?.summary && (
        <div className={`p-5 rounded-3xl ${theme.cardBg} border-2 border-amber-500/50 shadow-sm space-y-2`}>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>2-Sentence Overview</span>
          </div>
          <p className="text-lg font-semibold leading-relaxed">{processed.summary}</p>
        </div>
      )}

      {/* Segmented View Selector */}
      <div className={`grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl ${theme.cardBg} border ${theme.border} text-xs font-bold`}>
        <button
          onClick={() => setActiveTab('simplified')}
          className={`py-3 px-1 rounded-xl transition-all cursor-pointer text-center ${
            activeTab === 'simplified'
              ? 'bg-amber-600 text-white shadow-xs font-extrabold'
              : 'hover:bg-black/5 opacity-80'
          }`}
        >
          Readable Text
        </button>

        <button
          onClick={() => setActiveTab('bullets')}
          className={`py-3 px-1 rounded-xl transition-all cursor-pointer text-center ${
            activeTab === 'bullets'
              ? 'bg-amber-600 text-white shadow-xs font-extrabold'
              : 'hover:bg-black/5 opacity-80'
          }`}
        >
          Key Points ({processed?.keyPoints?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('vocab')}
          className={`py-3 px-1 rounded-xl transition-all cursor-pointer text-center ${
            activeTab === 'vocab'
              ? 'bg-amber-600 text-white shadow-xs font-extrabold'
              : 'hover:bg-black/5 opacity-80'
          }`}
        >
          Tricky Words ({processed?.difficultWords?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('original')}
          className={`py-3 px-1 rounded-xl transition-all cursor-pointer text-center ${
            activeTab === 'original'
              ? 'bg-amber-600 text-white shadow-xs font-extrabold'
              : 'hover:bg-black/5 opacity-80'
          }`}
        >
          Raw OCR
        </button>
      </div>

      {/* Tab Contents */}
      {/* 1. SIMPLIFIED READABLE TEXT */}
      {activeTab === 'simplified' && (
        <div
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            letterSpacing: `${settings.letterSpacing}px`,
          }}
          className={`p-6 sm:p-8 rounded-3xl ${theme.cardBg} border-2 ${theme.border} shadow-md space-y-6 transition-all`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">
              Est. Reading Time: ~{processed?.readingTimeMinutes || 1} min
            </span>
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 p-2 rounded-xl hover:bg-black/5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="whitespace-pre-line leading-relaxed font-normal">
            {simplifiedText}
          </div>
        </div>
      )}

      {/* 2. KEY POINTS */}
      {activeTab === 'bullets' && (
        <div className={`p-6 rounded-3xl ${theme.cardBg} border-2 ${theme.border} shadow-md space-y-4`}>
          <div className="flex items-center gap-2 font-bold text-lg">
            <ListOrdered className="w-6 h-6 text-amber-600" />
            <span>Key Takeaways</span>
          </div>

          <div className="space-y-3">
            {processed?.keyPoints && processed.keyPoints.length > 0 ? (
              processed.keyPoints.map((point, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: `${settings.fontSize - 1}px`,
                    lineHeight: settings.lineHeight,
                  }}
                  className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3"
                >
                  <span className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                    {i + 1}
                  </span>
                  <p className="font-medium pt-0.5">{point}</p>
                </div>
              ))
            ) : (
              <p className="opacity-80">No bullet points extracted.</p>
            )}
          </div>
        </div>
      )}

      {/* 3. TRICKY VOCABULARY */}
      {activeTab === 'vocab' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-bold text-lg px-2">
            <BookOpen className="w-6 h-6 text-amber-600" />
            <span>Difficult Words & Definitions</span>
          </div>

          {processed?.difficultWords && processed.difficultWords.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {processed.difficultWords.map((wordObj, i) => (
                <VocabCard key={i} item={wordObj} />
              ))}
            </div>
          ) : (
            <div className={`p-6 rounded-3xl ${theme.cardBg} border ${theme.border} text-center opacity-80`}>
              No complex vocabulary words found in this text.
            </div>
          )}
        </div>
      )}

      {/* 4. ORIGINAL OCR TEXT */}
      {activeTab === 'original' && (
        <div className={`p-6 rounded-3xl ${theme.cardBg} border-2 ${theme.border} space-y-3 opacity-80`}>
          <div className="text-xs font-bold uppercase tracking-wider">Raw Unprocessed OCR Text</div>
          <p className="text-sm font-mono whitespace-pre-wrap leading-relaxed">{document.raw_text}</p>
        </div>
      )}

      {/* Floating Read-Aloud Audio Bar */}
      <div className={`fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-30 p-4 rounded-3xl ${theme.cardBg} border-2 border-amber-500 shadow-2xl flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayTTS}
            aria-label={isPlaying ? 'Pause read aloud' : 'Play read aloud'}
            className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer shrink-0"
          >
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
          </button>

          <div>
            <div className="font-bold text-base flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-amber-600" />
              <span>{isPlaying ? 'Reading Aloud...' : 'Read Text Aloud'}</span>
            </div>
            <div className="text-xs opacity-75 font-semibold">
              Speed: {settings.readingSpeed}x
            </div>
          </div>
        </div>

        {isPlaying && (
          <button
            onClick={stopTTS}
            className="p-3 rounded-xl bg-red-500/15 text-red-600 hover:bg-red-500/25 active:scale-95 cursor-pointer"
            title="Stop Reading"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
