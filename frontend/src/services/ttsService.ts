export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentWordIndex: number;
  rate: number;
  voice: SpeechSynthesisVoice | null;
}

export const ttsService = {
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }
    return window.speechSynthesis.getVoices();
  },

  speak(
    text: string,
    options: {
      rate?: number;
      voice?: SpeechSynthesisVoice | null;
      onBoundary?: (wordIndex: number) => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): SpeechSynthesisUtterance | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this environment.');
      return null;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.9;
    
    if (options.voice) {
      utterance.voice = options.voice;
    }

    if (options.onBoundary) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          options.onBoundary!(event.charIndex);
        }
      };
    }

    if (options.onEnd) {
      utterance.onend = () => {
        options.onEnd!();
      };
    }

    if (options.onError) {
      utterance.onerror = (e) => {
        options.onError!(e);
      };
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
  },

  pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  },

  resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  },

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },
};
