import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './core/theme/ThemeContext';
import { Header } from './components/common/Header';
import { MobileContainerFrame } from './components/common/MobileContainerFrame';
import { FontCustomizerModal } from './components/common/FontCustomizerModal';
import { FocusGuide } from './components/common/FocusGuide';
import { LoadingOverlay } from './components/common/LoadingOverlay';
import { ErrorMessage } from './components/common/ErrorMessage';

import { HomeScreen } from './screens/HomeScreen';
import { CameraScreen } from './screens/CameraScreen';
import { UploadScreen } from './screens/UploadScreen';
import { ResultScreen } from './screens/ResultScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';

import { apiService } from './services/apiService';
import { ocrService } from './services/ocrService';
import { DocumentItem } from './types';

type Screen = 'home' | 'camera' | 'upload' | 'processing' | 'result' | 'history' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isLineReaderActive, setIsLineReaderActive] = useState<boolean>(false);

  // Document & Processing states
  const [currentDoc, setCurrentDoc] = useState<DocumentItem | null>(null);
  const [historyDocs, setHistoryDocs] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMsg, setLoadingMsg] = useState<string>('Processing...');
  const [loadingStep, setLoadingStep] = useState<'ocr' | 'upload' | 'ai'>('ocr');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch document history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const docs = await apiService.getDocumentsHistory();
      setHistoryDocs(docs);
    } catch (e) {
      console.warn('Failed to load history:', e);
    }
  };

  /**
   * Main Document Pipeline Flow:
   * 1. Local OCR (if image)
   * 2. POST /api/documents/
   * 3. POST /api/documents/:id/process/
   * 4. GET /api/documents/:id/processed/
   */
  const handleProcessRawText = async (rawText: string, source: 'camera' | 'upload' | 'sample') => {
    try {
      setErrorMessage(null);
      setIsLoading(true);

      // Step 2: Send text to backend
      setLoadingStep('upload');
      setLoadingMsg('Connecting to dyslexia reader engine...');
      const createdDoc = await apiService.createDocument(rawText, source);

      // Step 3: Trigger backend AI processing
      setLoadingStep('ai');
      setLoadingMsg('Making this text easier to read...');
      await apiService.processDocument(createdDoc.id);

      // Step 4: Retrieve processed document
      const processedDoc = await apiService.getProcessedDocument(createdDoc.id);

      setCurrentDoc(processedDoc);
      setIsLoading(false);
      setCurrentScreen('result');
      fetchHistory();
    } catch (err: any) {
      console.error('Processing pipeline error:', err);
      setIsLoading(false);
      setErrorMessage(
        err.message || "We couldn't process this document. Please check your connection and try again."
      );
    }
  };

  // Handle image capture from Camera
  const handleCameraCapture = async (dataUrl: string) => {
    setCurrentScreen('home');
    setIsLoading(true);
    setLoadingStep('ocr');
    setLoadingMsg('Reading text from photo...');

    try {
      const extractedText = await ocrService.recognizeImage(dataUrl);
      await handleProcessRawText(extractedText, 'camera');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "We couldn't read this document. Try taking a clearer photo in bright light.");
    }
  };

  // Handle uploaded File
  const handleFileUploaded = async (file: File) => {
    setCurrentScreen('home');
    setIsLoading(true);
    setLoadingStep('ocr');
    setLoadingMsg('Extracting text from image file...');

    try {
      const extractedText = await ocrService.recognizeImage(file);
      await handleProcessRawText(extractedText, 'upload');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Unable to read text from this file. Please select a clearer image.');
    }
  };

  // Handle Sample selection
  const handleSelectSample = (sampleText: string) => {
    handleProcessRawText(sampleText, 'sample');
  };

  const handleSelectHistoryDoc = (doc: DocumentItem) => {
    setCurrentDoc(doc);
    setCurrentScreen('result');
  };

  return (
    <ThemeProvider>
      <MobileContainerFrame>
        {/* Top Header Navigation */}
        <Header
          title={
            currentScreen === 'home'
              ? 'Reading Assistant'
              : currentScreen === 'camera'
              ? 'Scan Document'
              : currentScreen === 'upload'
              ? 'Upload Document'
              : currentScreen === 'result'
              ? 'Accessible Result'
              : currentScreen === 'history'
              ? 'Saved Documents'
              : 'Settings'
          }
          showBack={currentScreen !== 'home'}
          onBack={() => {
            setErrorMessage(null);
            setCurrentScreen('home');
          }}
          onOpenFontCustomizer={() => setIsCustomizerOpen(true)}
          onOpenHistory={() => setCurrentScreen('history')}
        />

        {/* Loading Overlay */}
        {isLoading && <LoadingOverlay message={loadingMsg} step={loadingStep} />}

        {/* Global Error Banner */}
        {errorMessage && !isLoading && (
          <div className="p-4">
            <ErrorMessage
              message={errorMessage}
              onRetry={() => {
                setErrorMessage(null);
                setCurrentScreen('home');
              }}
              onBack={() => {
                setErrorMessage(null);
                setCurrentScreen('home');
              }}
            />
          </div>
        )}

        {/* Active Screen Rendering */}
        {!isLoading && !errorMessage && (
          <>
            {currentScreen === 'home' && (
              <HomeScreen
                onScanClick={() => setCurrentScreen('camera')}
                onUploadClick={() => setCurrentScreen('upload')}
                onSelectSample={handleSelectSample}
                onViewHistory={() => setCurrentScreen('history')}
                onOpenSettings={() => setCurrentScreen('settings')}
                recentDocs={historyDocs}
                onSelectDoc={handleSelectHistoryDoc}
              />
            )}

            {currentScreen === 'camera' && (
              <CameraScreen
                onCapture={handleCameraCapture}
                onCancel={() => setCurrentScreen('home')}
              />
            )}

            {currentScreen === 'upload' && (
              <UploadScreen
                onFileSelected={handleFileUploaded}
                onCancel={() => setCurrentScreen('home')}
              />
            )}

            {currentScreen === 'result' && currentDoc && (
              <ResultScreen
                document={currentDoc}
                onBackToHome={() => setCurrentScreen('home')}
                onOpenCustomizer={() => setIsCustomizerOpen(true)}
                onToggleLineReader={() => setIsLineReaderActive(!isLineReaderActive)}
                isLineReaderActive={isLineReaderActive}
              />
            )}

            {currentScreen === 'history' && (
              <HistoryScreen
                documents={historyDocs}
                onSelectDoc={handleSelectHistoryDoc}
                onBack={() => setCurrentScreen('home')}
              />
            )}

            {currentScreen === 'settings' && (
              <SettingsScreen
                onBack={() => setCurrentScreen('home')}
                onOpenCustomizer={() => setIsCustomizerOpen(true)}
              />
            )}
          </>
        )}

        {/* Line Focus Ruler Guide Overlay */}
        <FocusGuide
          isActive={isLineReaderActive}
          onToggle={() => setIsLineReaderActive(false)}
        />

        {/* Font Customizer Modal */}
        <FontCustomizerModal
          isOpen={isCustomizerOpen}
          onClose={() => setIsCustomizerOpen(false)}
        />
      </MobileContainerFrame>
    </ThemeProvider>
  );
}
