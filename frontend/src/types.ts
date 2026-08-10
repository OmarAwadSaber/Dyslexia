export type DyslexiaFont = 'OpenDyslexic' | 'Atkinson' | 'Lexend' | 'System';
export type ThemeMode = 'sepia' | 'dark' | 'cream' | 'light' | 'soft-blue';

export interface UserSettings {
  fontFamily: DyslexiaFont;
  fontSize: number; // in px, default 20
  letterSpacing: number; // in px, default 1.5
  lineHeight: number; // default 1.8
  themeMode: ThemeMode;
  readingSpeed: number; // 0.5 to 1.5
  voiceGender?: 'female' | 'male';
  showLineReader: boolean;
  lineReaderHeight: number; // in px
}

export interface DifficultWord {
  word: string;
  definition: string;
  phonetic?: string;
}

export interface ProcessedResult {
  simplifiedText: string;
  summary: string;
  keyPoints: string[];
  difficultWords: DifficultWord[];
  readingTimeMinutes: number;
  gradeLevel: string;
}

export interface DocumentItem {
  id: string;
  source: 'camera' | 'upload' | 'sample' | 'mobile';
  raw_text: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  processed_data?: ProcessedResult;
  created_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
}
