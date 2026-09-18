import type { StateCreator } from 'zustand';
import { todayISO } from '@utils/date';
import type { AppState, MoodSlice } from '@store/types';

export const createMoodSlice: StateCreator<AppState, [], [], MoodSlice> = (set) => ({
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
});
