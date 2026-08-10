import React from 'react';
import { ArrowLeft, FileText, Trash2, ArrowRight } from 'lucide-react';
import { useDyslexiaTheme } from '../core/theme/ThemeContext';
import { DocumentItem } from '../types';

interface HistoryScreenProps {
  documents: DocumentItem[];
  onSelectDoc: (doc: DocumentItem) => void;
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ documents, onSelectDoc, onBack }) => {
  const { getThemeClasses, getFontFamilyStyle } = useDyslexiaTheme();
  const theme = getThemeClasses();

  return (
    <div
      style={{ fontFamily: getFontFamilyStyle() }}
      className={`min-h-[calc(100vh-64px)] p-4 sm:p-6 space-y-5 max-w-2xl mx-auto ${theme.bg}`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-black/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Back"
            className={`p-2.5 rounded-xl ${theme.cardBg} border ${theme.border} cursor-pointer active:scale-95`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold tracking-wide">Document History</h2>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-800">
          {documents.length} Saved
        </span>
      </div>

      {documents.length === 0 ? (
        <div className={`p-8 rounded-3xl ${theme.cardBg} border ${theme.border} text-center space-y-3`}>
          <FileText className="w-12 h-12 text-amber-600 mx-auto opacity-60" />
          <h3 className="text-xl font-bold">No documents scanned yet</h3>
          <p className="text-sm opacity-80">
            Scan paper pages or upload photos to convert them into easy reading.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelectDoc(doc)}
              className={`w-full p-4 rounded-2xl ${theme.cardBg} border-2 ${theme.border} hover:border-amber-500 text-left transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between shadow-xs`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-3 rounded-xl bg-amber-500/15 text-amber-700 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <div className="font-bold text-lg truncate">
                    {doc.processed_data?.summary || doc.raw_text.slice(0, 45) + '...'}
                  </div>
                  <div className="text-xs opacity-75 mt-0.5">
                    {new Date(doc.created_at).toLocaleDateString()} at{' '}
                    {new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    <span className="capitalize">{doc.source}</span>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-amber-600 shrink-0 ml-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
