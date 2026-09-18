import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  MoodLevel,
  MoodEntry,
  JournalEntry,
  MeditationSession,
  UserProfile,
} from '@/domain/models';
import type { AppState } from '@store/types';
import { createSettingsSlice } from '@store/slices/settingsSlice';
import { createProfileSlice } from '@store/slices/profileSlice';
import { createMoodSlice } from '@store/slices/moodSlice';
import { createJournalSlice } from '@store/slices/journalSlice';
import { createMeditationSlice } from '@store/slices/meditationSlice';
import { createStreakSlice } from '@store/slices/streakSlice';

export type { MoodLevel, MoodEntry, JournalEntry, MeditationSession, UserProfile };
export type { AppState } from '@store/types';

export const useAppStore = create<AppState>()(
  persist(
    (set, get, api) => ({
      ...createSettingsSlice(set, get, api),
      ...createProfileSlice(set, get, api),
      ...createMoodSlice(set, get, api),
      ...createJournalSlice(set, get, api),
      ...createMeditationSlice(set, get, api),
      ...createStreakSlice(set, get, api),
      clearAllUserData: () =>
        set({
          moodEntries: [],
          journalEntries: [],
          meditationSessions: [],
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
          todayMood: null,
        }),
    }),
    {
      name: 'lumina-flow-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        isDarkMode: state.isDarkMode,
        profile: state.profile,
        moodEntries: state.moodEntries,
        todayMood: state.todayMood,
        journalEntries: state.journalEntries,
        meditationSessions: state.meditationSessions,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastActiveDate: state.lastActiveDate,
      }),
    },
  ),
);

export const useMoodEntries = () => useAppStore((s) => s.moodEntries);
export const useJournalEntries = () => useAppStore((s) => s.journalEntries);
export const useProfile = () => useAppStore((s) => s.profile);
export const useStreak = () =>
  useAppStore(
    useShallow((s) => ({ current: s.currentStreak, longest: s.longestStreak })),
  );

/** @deprecated Import from `@utils/id` */
export { genId } from '@utils/id';
/** @deprecated Import from `@utils/date` */
export { todayISO } from '@utils/date';
