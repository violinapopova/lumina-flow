import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MoodLevel = 'rad' | 'good' | 'meh' | 'bad' | 'awful';

export interface MoodEntry {
  id: string;
  mood: MoodLevel;
  note?: string;
  createdAt: string; // ISO date string
}

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  mood?: MoodLevel;
  createdAt: string;
  updatedAt: string;
}

export interface MeditationSession {
  id: string;
  type: 'breathe' | 'guided' | 'timer';
  durationSeconds: number;
  completedAt: string;
}

export interface UserProfile {
  name: string;
  avatarEmoji: string;
  joinedAt: string;
  reminderEnabled: boolean;
  reminderTime: string; // "HH:mm"
  notificationPermission: 'granted' | 'denied' | 'undetermined';
}

// ─── State ────────────────────────────────────────────────────────────────────

interface AppState {
  // Onboarding
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Profile
  profile: UserProfile;
  updateProfile: (partial: Partial<UserProfile>) => void;

  // Mood
  moodEntries: MoodEntry[];
  addMoodEntry: (entry: MoodEntry) => void;
  removeMoodEntry: (id: string) => void;
  todayMood: MoodLevel | null;

  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (id: string, partial: Partial<JournalEntry>) => void;
  removeJournalEntry: (id: string) => void;

  // Meditation
  meditationSessions: MeditationSession[];
  addMeditationSession: (session: MeditationSession) => void;

  // Streak
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  checkAndUpdateStreak: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const todayISO = () => new Date().toISOString().split('T')[0];
const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Onboarding
      hasOnboarded: false,
      setHasOnboarded: (v) => set({ hasOnboarded: v }),

      // ── Theme
      isDarkMode: true,
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),

      // ── Profile
      profile: {
        name: 'Friend',
        avatarEmoji: '🌸',
        joinedAt: new Date().toISOString(),
        reminderEnabled: false,
        reminderTime: '08:00',
        notificationPermission: 'undetermined',
      },
      updateProfile: (partial) =>
        set((s) => ({ profile: { ...s.profile, ...partial } })),

      // ── Mood
      moodEntries: [],
      todayMood: null,
      addMoodEntry: (entry) =>
        set((s) => {
          const today = todayISO();
          const isToday = entry.createdAt.startsWith(today);
          return {
            moodEntries: [entry, ...s.moodEntries],
            todayMood: isToday ? entry.mood : s.todayMood,
          };
        }),
      removeMoodEntry: (id) =>
        set((s) => ({ moodEntries: s.moodEntries.filter((e) => e.id !== id) })),

      // ── Journal
      journalEntries: [],
      addJournalEntry: (entry) =>
        set((s) => ({ journalEntries: [entry, ...s.journalEntries] })),
      updateJournalEntry: (id, partial) =>
        set((s) => ({
          journalEntries: s.journalEntries.map((e) =>
            e.id === id ? { ...e, ...partial, updatedAt: new Date().toISOString() } : e
          ),
        })),
      removeJournalEntry: (id) =>
        set((s) => ({ journalEntries: s.journalEntries.filter((e) => e.id !== id) })),

      // ── Meditation
      meditationSessions: [],
      addMeditationSession: (session) =>
        set((s) => ({ meditationSessions: [session, ...s.meditationSessions] })),

      // ── Streak
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      checkAndUpdateStreak: () => {
        const { lastActiveDate, currentStreak, longestStreak } = get();
        const today = todayISO();

        if (lastActiveDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayISO = yesterday.toISOString().split('T')[0];

        const newStreak =
          lastActiveDate === yesterdayISO ? currentStreak + 1 : 1;
        const newLongest = Math.max(newStreak, longestStreak);

        set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActiveDate: today,
        });
      },
    }),
    {
      name: 'lumina-flow-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Convenience selector hooks
export const useMoodEntries = () => useAppStore((s) => s.moodEntries);
export const useJournalEntries = () => useAppStore((s) => s.journalEntries);
export const useProfile = () => useAppStore((s) => s.profile);
export const useStreak = () =>
  useAppStore((s) => ({ current: s.currentStreak, longest: s.longestStreak }));
export { genId, todayISO };
