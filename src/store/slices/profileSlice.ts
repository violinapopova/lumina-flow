import type { StateCreator } from 'zustand';
import type { AppState, ProfileSlice } from '@store/types';

export const createProfileSlice: StateCreator<
  AppState,
  [],
  [],
  ProfileSlice
> = (set) => ({
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
});
