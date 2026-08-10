import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, FlipHorizontal, Zap, AlertCircle } from 'lucide-react';
import { useDyslexiaTheme } from '../core/theme/ThemeContext';
import { TactileButton } from '../components/widgets/TactileButton';

interface CameraScreenProps {
  onCapture: (canvasDataUrl: string) => void;
  onCancel: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ onCapture, onCancel }) => {
  const { getThemeClasses, getFontFamilyStyle } = useDyslexiaTheme();
  const theme = getThemeClasses();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Initialize Camera
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setCameraError(null);
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraError(
          'Unable to access phone camera. Please grant camera permissions or try uploading an image.'
        );
      }
    }

    if (!capturedImage) {
      initCamera();
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode, capturedImage]);

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
    }
    setIsCapturing(false);
  };

  const handleConfirmImage = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div
      style={{ fontFamily: getFontFamilyStyle() }}
      className={`min-h-[calc(100vh-64px)] p-4 flex flex-col justify-between max-w-lg mx-auto ${theme.bg}`}
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-xl font-bold tracking-wide">
          {capturedImage ? 'Review Captured Photo' : 'Scan Document'}
        </h2>
        <button
          onClick={onCancel}
          aria-label="Cancel scanning"
          className={`p-2.5 rounded-xl ${theme.cardBg} border ${theme.border} active:scale-95 cursor-pointer`}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 my-2 rounded-3xl overflow-hidden bg-black flex items-center justify-center border-4 border-amber-500/60 shadow-xl min-h-[360px]">
        {cameraError ? (
          <div className="p-6 text-center text-white space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <p className="text-base font-semibold">{cameraError}</p>
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        ) : capturedImage ? (
          /* Captured Preview */
          <img
            src={capturedImage}
            alt="Captured document snapshot"
            className="w-full h-full object-contain"
          />
        ) : (
          /* Live Video Stream */
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Accessibility Framing Guide */}
            <div className="absolute inset-6 border-2 border-dashed border-amber-400 rounded-2xl pointer-events-none flex flex-col justify-between p-4 bg-amber-500/5">
              <div className="text-xs font-bold bg-amber-500/80 text-black px-3 py-1 rounded-full w-fit">
                Align document inside frame
              </div>
              <div className="text-xs text-white/90 bg-black/60 px-3 py-1.5 rounded-lg text-center backdrop-blur-xs">
                Hold phone steady in bright light
              </div>
            </div>
          </>
        )}
      </div>

      {/* Camera Action Buttons */}
      <div className="pt-3 space-y-3">
        {capturedImage ? (
          <div className="grid grid-cols-2 gap-3">
            <TactileButton
              label="Retake"
              icon={RefreshCw}
              variant="outline"
              onClick={handleRetake}
              fullWidth
            />
            <TactileButton
              label="Read Text"
              icon={Camera}
              variant="amber"
              onClick={handleConfirmImage}
              fullWidth
            />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={toggleCameraFacing}
              aria-label="Switch camera"
              className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.border} text-sm font-bold flex items-center gap-2 cursor-pointer active:scale-95`}
            >
              <FlipHorizontal className="w-6 h-6 text-amber-600" />
              <span className="hidden sm:inline">Flip Camera</span>
            </button>

            {/* Shutter Trigger */}
            <button
              onClick={handleTakeSnapshot}
              disabled={isCapturing || !!cameraError}
              aria-label="Take picture"
              className="w-20 h-20 rounded-full bg-amber-500 border-4 border-white shadow-xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer shrink-0"
            >
              <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </button>

            <button
              onClick={onCancel}
              className={`p-4 rounded-2xl ${theme.cardBg} border ${theme.border} text-sm font-bold cursor-pointer active:scale-95`}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
