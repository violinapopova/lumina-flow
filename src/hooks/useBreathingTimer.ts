import { useState, useEffect, useCallback, useRef } from 'react';
import type { BreathPattern, BreathPhase } from '@/domain/breathing';

export function useBreathingTimer(
  pattern: BreathPattern,
  isActive: boolean,
  onComplete: () => void,
) {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cyclesDone, setCyclesDone] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const runPhase = useCallback(
    (ph: BreathPhase, duration: number, onEnd: () => void) => {
      setPhase(ph);
      setSecondsLeft(duration);
      setProgress(0);

      const start = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - start) / 1000;
        const left = Math.max(0, duration - elapsed);
        setSecondsLeft(Math.ceil(left));
        setProgress(elapsed / duration);
      }, 100);

      timerRef.current = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onEnd();
      }, duration * 1000);
    },
    [],
  );

  const runCycle = useCallback(
    (cycleIndex: number) => {
      if (cycleIndex >= pattern.cycles) {
        setPhase('idle');
        onComplete();
        return;
      }

      runPhase('inhale', pattern.inhale, () => {
        if (pattern.hold > 0) {
          runPhase('hold', pattern.hold, () => {
            runPhase('exhale', pattern.exhale, () => {
              if (pattern.pause > 0) {
                runPhase('pause', pattern.pause, () => {
                  setCyclesDone(cycleIndex + 1);
                  runCycle(cycleIndex + 1);
                });
              } else {
                setCyclesDone(cycleIndex + 1);
                runCycle(cycleIndex + 1);
              }
            });
          });
        } else {
          runPhase('exhale', pattern.exhale, () => {
            if (pattern.pause > 0) {
              runPhase('pause', pattern.pause, () => {
                setCyclesDone(cycleIndex + 1);
                runCycle(cycleIndex + 1);
              });
            } else {
              setCyclesDone(cycleIndex + 1);
              runCycle(cycleIndex + 1);
            }
          });
        }
      });
    },
    [pattern, runPhase, onComplete],
  );

  useEffect(() => {
    if (isActive) {
      setCyclesDone(0);
      runCycle(0);
    } else {
      clearTimers();
      setPhase('idle');
      setSecondsLeft(0);
      setProgress(0);
    }
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when active/pattern changes
  }, [isActive, pattern]);

  return { phase, secondsLeft, progress, cyclesDone };
}
