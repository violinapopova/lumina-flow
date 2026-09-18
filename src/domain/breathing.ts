export type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'pause';

export type ActiveBreathPhase = Exclude<BreathPhase, 'idle'>;

export const PHASE_LABELS: Record<BreathPhase, string> = {
  idle: 'Ready',
  inhale: 'Inhale',
  hold: 'Hold',
  exhale: 'Exhale',
  pause: 'Pause',
};

export const PHASE_VOICE: Record<ActiveBreathPhase, string> = {
  inhale: 'Inhale',
  hold: 'Hold',
  exhale: 'Exhale',
  pause: 'Rest',
};

export interface BreathPattern {
  id: string;
  name: string;
  description: string;
  emoji: string;
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
  cycles: number;
  gradient: [string, string];
}
