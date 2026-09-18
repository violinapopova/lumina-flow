import type {
  JournalEntry,
  MeditationSession,
  MoodEntry,
  MoodLevel,
  UserProfile,
} from '@/domain/models';

export interface SettingsSlice {
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export interface ProfileSlice {
  profile: UserProfile;
  updateProfile: (partial: Partial<UserProfile>) => void;
}

export interface MoodSlice {
  moodEntries: MoodEntry[];
  todayMood: MoodLevel | null;
  addMoodEntry: (entry: MoodEntry) => void;
  removeMoodEntry: (id: string) => void;
}

export interface JournalSlice {
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (id: string, partial: Partial<JournalEntry>) => void;
  removeJournalEntry: (id: string) => void;
}

export interface MeditationSlice {
  meditationSessions: MeditationSession[];
  addMeditationSession: (session: MeditationSession) => void;
}

export interface StreakSlice {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  checkAndUpdateStreak: () => void;
}

export interface AppSlice {
  clearAllUserData: () => void;
}

export type AppState = SettingsSlice &
  ProfileSlice &
  MoodSlice &
  JournalSlice &
  MeditationSlice &
  StreakSlice &
  AppSlice;
