import type { MoodLevel } from '@/domain/mood';

export type { MoodLevel };

export interface MoodEntry {
  id: string;
  mood: MoodLevel;
  note?: string;
  createdAt: string;
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
  reminderTime: string;
  notificationPermission: 'granted' | 'denied' | 'undetermined';
}
