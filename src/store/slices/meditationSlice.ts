import type { StateCreator } from 'zustand';
import type { AppState, MeditationSlice } from '@store/types';

export const createMeditationSlice: StateCreator<
  AppState,
  [],
  [],
  MeditationSlice
> = (set) => ({
  meditationSessions: [],
  addMeditationSession: (session) =>
    set((s) => ({ meditationSessions: [session, ...s.meditationSessions] })),
});
