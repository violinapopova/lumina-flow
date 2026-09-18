import type { StateCreator } from 'zustand';
import { todayISO } from '@utils/date';
import type { AppState, StreakSlice } from '@store/types';

export const createStreakSlice: StateCreator<AppState, [], [], StreakSlice> = (
  set,
  get,
) => ({
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

    const newStreak = lastActiveDate === yesterdayISO ? currentStreak + 1 : 1;
    const newLongest = Math.max(newStreak, longestStreak);

    set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
    });
  },
});
