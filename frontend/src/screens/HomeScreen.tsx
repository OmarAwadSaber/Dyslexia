import React from 'react';
import { Camera, Upload, BookOpen, History, Settings, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { useDyslexiaTheme } from '../core/theme/ThemeContext';
import { TactileButton } from '../components/widgets/TactileButton';
import { DocumentItem } from '../types';

interface HomeScreenProps {
  onScanClick: () => void;
  onUploadClick: () => void;
  onSelectSample: (sampleText: string) => void;
  onViewHistory: () => void;
  onOpenSettings: () => void;
  recentDocs: DocumentItem[];
  onSelectDoc: (doc: DocumentItem) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onScanClick,
  onUploadClick,
  onSelectSample,
  onViewHistory,
  onOpenSettings,
  recentDocs,
  onSelectDoc,
}) => {
  const { getThemeClasses, getFontFamilyStyle } = useDyslexiaTheme();
  const theme = getThemeClasses();

  const samples = [
    {
      title: '📖 Medicine Label',
      desc: 'Important health instructions',
      text: 'Take two tablets orally twice daily with food or milk. Do not exceed four tablets in 24 hours. May cause drowsiness or lightheadedness. Consult a physician before consuming alcohol or operating heavy machinery.',
    },
    {
      title: '📄 Textbook Passage',
      desc: 'Complex scientific explanation',
      text: 'Photosynthesis is the biochemical process by which photoautotrophic organisms convert light energy into chemical energy. Chlorophyll pigments absorb light quanta within the thylakoid membrane, triggering photolysis of water molecules.',
    },
    {
      title: '✉️ Business Notice',
      desc: 'Official invoice terms',
      text: 'Pursuant to Section 4.2 of the master services agreement, failure to remit full payment within thirty (30) consecutive calendar days of receipt shall incur a compounding interest penalty of 1.5% per billing cycle.',
    },
  ];

  return (
    <div
      style={{ fontFamily: getFontFamilyStyle() }}
      className={`min-h-[calc(100vh-64px)] p-4 sm:p-6 space-y-6 max-w-2xl mx-auto`}
    >
      {/* Welcome Banner */}
      <div className={`p-5 rounded-3xl ${theme.cardBg} border-2 ${theme.border} shadow-sm space-y-2 relative overflow-hidden`}>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-200 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Dyslexia Assist Mode</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 cursor-pointer text-xs font-semibold flex items-center gap-1"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide leading-snug">
          What would you like to read today?
        </h2>
        <p className="text-base opacity-85 leading-relaxed">
          Scan any page or image to transform hard text into clear, easy-to-read words.
        </p>
      </div>

      {/* Primary Big Action Buttons */}
      <div className="space-y-4">
        <TactileButton
          label="Scan Document"
          sublabel="Use phone camera to scan physical paper"
          icon={Camera}
          variant="primary"
          fullWidth
          onClick={onScanClick}
          className="py-6 rounded-3xl text-2xl border-2 border-amber-600/40"
        />

        <TactileButton
          label="Upload Document"
          sublabel="Choose photo or image file from phone"
          icon={Upload}
          variant="secondary"
          fullWidth
          onClick={onUploadClick}
          className="py-6 rounded-3xl text-2xl"
        />
      </div>

      {/* Try Sample Texts */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-wide flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>Quick Try Samples</span>
          </h3>
          <span className="text-xs opacity-75">1-Tap Test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {samples.map((s, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSample(s.text)}
              className={`p-4 rounded-2xl ${theme.cardBg} border-2 ${theme.border} hover:border-amber-500 text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between gap-2 shadow-xs`}
            >
              <div>
                <div className="font-bold text-base">{s.title}</div>
                <div className="text-xs opacity-75 mt-0.5">{s.desc}</div>
              </div>
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <span>Try this</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      {recentDocs && recentDocs.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-wide flex items-center gap-2">
              <History className="w-5 h-5 text-amber-600" />
              <span>Recent Reads</span>
            </h3>
            <button
              onClick={onViewHistory}
              className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
            >
              See All ({recentDocs.length})
            </button>
          </div>

          <div className="space-y-2">
            {recentDocs.slice(0, 3).map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                className={`w-full p-3.5 rounded-2xl ${theme.cardBg} border ${theme.border} hover:border-amber-500/50 text-left flex items-center justify-between transition-all cursor-pointer`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-base truncate">
                      {doc.processed_data?.summary || doc.raw_text.slice(0, 40) + '...'}
                    </div>
                    <div className="text-xs opacity-70">
                      {new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {doc.source}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-60 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
