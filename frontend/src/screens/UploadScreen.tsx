import React, { useState } from 'react';
import { Upload, FileImage, FileText, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useDyslexiaTheme } from '../core/theme/ThemeContext';
import { TactileButton } from '../components/widgets/TactileButton';

interface UploadScreenProps {
  onFileSelected: (file: File) => void;
  onCancel: () => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onFileSelected, onCancel }) => {
  const { getThemeClasses, getFontFamilyStyle } = useDyslexiaTheme();
  const theme = getThemeClasses();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please select a photo or image file (.png, .jpg, .jpeg, .webp).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size is too large (max 15MB).');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  return (
    <div
      style={{ fontFamily: getFontFamilyStyle() }}
      className={`min-h-[calc(100vh-64px)] p-4 sm:p-6 space-y-6 max-w-lg mx-auto ${theme.bg}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-wide">Upload Document</h2>
        <button
          onClick={onCancel}
          aria-label="Back"
          className={`p-2.5 rounded-xl ${theme.cardBg} border ${theme.border} cursor-pointer active:scale-95`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-600/50 text-amber-900 dark:text-amber-100 flex items-center gap-3 text-sm font-semibold">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dropzone Container */}
      <label
        htmlFor="doc-file-input"
        className={`relative p-8 rounded-3xl border-4 border-dashed ${
          selectedFile ? 'border-amber-500 bg-amber-500/10' : `${theme.border} ${theme.cardBg}`
        } hover:border-amber-500 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[280px] shadow-sm`}
      >
        <input
          id="doc-file-input"
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="space-y-3 w-full">
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="max-h-52 mx-auto rounded-2xl object-contain border-2 border-amber-500/40 shadow-md"
            />
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
              <span>{selectedFile?.name}</span>
            </div>
            <span className="text-xs opacity-75 block">Tap to change image</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
              <Upload className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-xl font-bold tracking-wide block">Tap to select photo</span>
              <span className="text-sm opacity-80 block">PNG, JPG, or WEBP up to 15MB</span>
            </div>
          </div>
        )}
      </label>

      {/* Confirm & Process Button */}
      {selectedFile && (
        <div className="pt-2">
          <TactileButton
            label="Read & Simplify Text"
            icon={FileText}
            variant="amber"
            fullWidth
            onClick={handleConfirm}
            className="py-5 text-xl"
          />
        </div>
      )}
    </div>
  );
};
