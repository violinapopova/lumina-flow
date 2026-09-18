import { Colors } from '@theme';

export type MoodLevel = 'rad' | 'good' | 'meh' | 'bad' | 'awful';

export interface MoodMeta {
  emoji: string;
  label: string;
  color: string;
  gradient: [string, string];
  glow: string;
  chartValue: number;
}

export const MOOD_CATALOG: Record<MoodLevel, MoodMeta> = {
  rad: {
    emoji: '🤩',
    label: 'Rad',
    color: Colors.mood.rad,
    gradient: ['#F472B6', '#EC4899'],
    glow: 'rgba(244, 114, 182, 0.6)',
    chartValue: 5,
  },
  good: {
    emoji: '😊',
    label: 'Good',
    color: Colors.mood.good,
    gradient: ['#34D399', '#10B981'],
    glow: 'rgba(52, 211, 153, 0.6)',
    chartValue: 4,
  },
  meh: {
    emoji: '😐',
    label: 'Meh',
    color: Colors.mood.meh,
    gradient: ['#FBBF24', '#F59E0B'],
    glow: 'rgba(251, 191, 36, 0.6)',
    chartValue: 3,
  },
  bad: {
    emoji: '😔',
    label: 'Bad',
    color: Colors.mood.bad,
    gradient: ['#60A5FA', '#3B82F6'],
    glow: 'rgba(96, 165, 250, 0.6)',
    chartValue: 2,
  },
  awful: {
    emoji: '😢',
    label: 'Awful',
    color: Colors.mood.awful,
    gradient: ['#F87171', '#EF4444'],
    glow: 'rgba(248, 113, 113, 0.6)',
    chartValue: 1,
  },
};

export const MOOD_LEVELS: MoodLevel[] = ['rad', 'good', 'meh', 'bad', 'awful'];

export function getMoodMeta(level: MoodLevel): MoodMeta {
  return MOOD_CATALOG[level];
}

export const MOOD_PICKER_OPTIONS = MOOD_LEVELS.map((mood) => ({
  mood,
  emoji: MOOD_CATALOG[mood].emoji,
  label: MOOD_CATALOG[mood].label,
}));
