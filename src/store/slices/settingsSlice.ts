import type { StateCreator } from 'zustand';
import type { AppState, SettingsSlice } from '@store/types';

export const createSettingsSlice: StateCreator<
  AppState,
  [],
  [],
  SettingsSlice
> = (set) => ({
  hasOnboarded: false,
  setHasOnboarded: (v) => set({ hasOnboarded: v }),
  isDarkMode: true,
  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
});
