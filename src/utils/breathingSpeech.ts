import * as Speech from 'expo-speech';
import type { ActiveBreathPhase } from '@/domain/breathing';
import { PHASE_VOICE } from '@/domain/breathing';

const SPEAK_OPTIONS: Speech.SpeechOptions = {
  language: 'en-US',
  rate: 0.95,
  pitch: 1.0,
};

let countdownCancelled = false;

export function stopBreathingSpeech(): void {
  countdownCancelled = true;
  Speech.stop();
}

function speakLine(text: string, onDone?: () => void): void {
  Speech.speak(text, {
    ...SPEAK_OPTIONS,
    onDone: onDone
      ? () => {
          if (!countdownCancelled) onDone();
        }
      : undefined,
  });
}

/** 3, 2, 1, Start — then runs onComplete (e.g. begin the timer). */
export function speakBreathingCountdown(
  onComplete: () => void,
  onStep?: (word: string) => void,
): void {
  countdownCancelled = false;
  Speech.stop();

  const steps = ['3', '2', '1', 'Start'];
  let index = 0;

  const next = () => {
    if (countdownCancelled) return;
    if (index >= steps.length) {
      onComplete();
      return;
    }
    const word = steps[index];
    index += 1;
    onStep?.(word);
    speakLine(word, next);
  };

  next();
}

export function speakBreathingPhase(phase: ActiveBreathPhase): void {
  if (countdownCancelled) return;
  Speech.stop();
  speakLine(PHASE_VOICE[phase]);
}

export function speakSessionComplete(): void {
  Speech.stop();
  speakLine('Done');
}
