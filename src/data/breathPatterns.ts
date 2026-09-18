import type { BreathPattern } from '@/domain/breathing';

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: '478',
    name: '4-7-8 Calm',
    description: 'Reduces anxiety and helps you fall asleep. A classic technique by Dr. Weil.',
    emoji: '🌙',
    inhale: 4, hold: 7, exhale: 8, pause: 0, cycles: 4,
    gradient: ['rgba(124,95,244,0.3)', 'rgba(96,165,250,0.2)'],
  },
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Used by Navy SEALs to maintain calm under pressure. Equal four-count phases.',
    emoji: '🏔️',
    inhale: 4, hold: 4, exhale: 4, pause: 4, cycles: 6,
    gradient: ['rgba(110,231,183,0.3)', 'rgba(52,211,153,0.2)'],
  },
  {
    id: 'relax',
    name: 'Deep Relax',
    description: 'Slow exhale activates the parasympathetic nervous system. Perfect for stress.',
    emoji: '🌊',
    inhale: 5, hold: 2, exhale: 7, pause: 1, cycles: 5,
    gradient: ['rgba(249,168,212,0.3)', 'rgba(244,114,182,0.2)'],
  },
  {
    id: 'energize',
    name: 'Energize',
    description: 'Quick inhales boost alertness. Great for morning or when you need a lift.',
    emoji: '⚡',
    inhale: 2, hold: 1, exhale: 4, pause: 1, cycles: 8,
    gradient: ['rgba(251,191,36,0.3)', 'rgba(245,158,11,0.2)'],
  },
];
