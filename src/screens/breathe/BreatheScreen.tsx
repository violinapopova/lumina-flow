import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BreathingOrb } from '@components/BreathingOrb';
import { LiquidGlassCard } from '@components/LiquidGlassCard';
import { LiquidButton } from '@components/LiquidButton';
import { AnimatedBackground } from '@components/AnimatedBackground';
import { Colors, Typography, Spacing, Radius } from '@theme';
import { useAppStore, genId } from '@store/useAppStore';

const { width: W, height: H } = Dimensions.get('window');

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'pause';

interface BreathPattern {
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

const PATTERNS: BreathPattern[] = [
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

const PHASE_LABELS: Record<Phase, string> = {
  idle: 'Ready',
  inhale: 'Inhale',
  hold: 'Hold',
  exhale: 'Exhale',
  pause: 'Pause',
};

function useBreathingTimer(
  pattern: BreathPattern,
  isActive: boolean,
  onComplete: () => void,
) {
  const [phase, setPhase] = useState<Phase>('idle');
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
    (ph: Phase, duration: number, onEnd: () => void) => {
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
    []
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
    [pattern, runPhase, onComplete]
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
  }, [isActive, pattern]);

  return { phase, secondsLeft, progress, cyclesDone };
}

const PatternCard: React.FC<{
  pattern: BreathPattern;
  selected: boolean;
  onSelect: (p: BreathPattern) => void;
}> = ({ pattern, selected, onSelect }) => {
  const scale = useSharedValue(selected ? 1 : 0.97);

  useEffect(() => {
    scale.value = withSpring(selected ? 1 : 0.97, { damping: 16, stiffness: 200 });
  }, [selected]);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={cardStyle}>
      <LiquidGlassCard
        style={[styles.patternCard, selected && styles.patternCardSelected]}
        intensity="medium"
        onPress={() => onSelect(pattern)}
        borderGlow={selected}
      >
        <LinearGradient
          colors={pattern.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
        />
        <View style={styles.patternRow}>
          <Text style={styles.patternEmoji}>{pattern.emoji}</Text>
          <View style={styles.patternText}>
            <Text style={styles.patternName}>{pattern.name}</Text>
            <Text style={styles.patternMeta}>
              {pattern.inhale}-{pattern.hold > 0 ? `${pattern.hold}-` : ''}{pattern.exhale} · {pattern.cycles} cycles
            </Text>
          </View>
          {selected && <View style={styles.selectedDot} />}
        </View>
        <Text style={styles.patternDesc} numberOfLines={2}>{pattern.description}</Text>
      </LiquidGlassCard>
    </Animated.View>
  );
};

export const BreatheScreen: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState(PATTERNS[0]);
  const [isActive, setIsActive] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const addMeditationSession = useAppStore((s) => s.addMeditationSession);

  const totalDuration = selectedPattern.cycles *
    (selectedPattern.inhale + selectedPattern.hold + selectedPattern.exhale + selectedPattern.pause);

  const handleComplete = useCallback(() => {
    setIsActive(false);
    setSessionDone(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addMeditationSession({
      id: genId(),
      type: 'breathe',
      durationSeconds: totalDuration,
      completedAt: new Date().toISOString(),
    });
  }, [totalDuration, addMeditationSession]);

  const { phase, secondsLeft, progress, cyclesDone } = useBreathingTimer(
    selectedPattern, isActive, handleComplete
  );

  const handleStart = () => {
    setSessionDone(false);
    setIsActive(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleStop = () => {
    setIsActive(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground variant="breathe" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        {isActive ? (
          // ─── Active Session View ─────────────────────────────────────────
          <View style={styles.sessionView}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTitle}>{selectedPattern.name}</Text>
              <Text style={styles.sessionCycles}>
                Cycle {Math.min(cyclesDone + 1, selectedPattern.cycles)} of {selectedPattern.cycles}
              </Text>
            </View>

            <View style={styles.orbWrapper}>
              <BreathingOrb
                isActive={isActive}
                phase={phase}
                progress={progress}
                label={PHASE_LABELS[phase]}
                secondsLeft={secondsLeft}
              />
            </View>

            {/* Phase guidance text */}
            <Animated.View entering={FadeIn} style={styles.guidance}>
              <Text style={styles.guidanceText}>
                {phase === 'inhale' && 'Breathe in slowly through your nose...'}
                {phase === 'hold' && 'Hold gently, keep still...'}
                {phase === 'exhale' && 'Release slowly through your mouth...'}
                {phase === 'pause' && 'Rest, let everything settle...'}
              </Text>
            </Animated.View>

            <LiquidButton
              label="End Session"
              variant="ghost"
              size="md"
              onPress={handleStop}
              style={styles.stopBtn}
            />
          </View>
        ) : (
          // ─── Selection View ──────────────────────────────────────────────
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.pageTitle}>Breathe</Text>
              <Text style={styles.pageSubtitle}>Choose a breathing pattern</Text>
            </View>

            {sessionDone && (
              <Animated.View entering={FadeIn}>
                <LiquidGlassCard style={styles.doneCard} intensity="medium">
                  <LinearGradient
                    colors={['rgba(110,231,183,0.25)', 'rgba(52,211,153,0.10)']}
                    style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
                  />
                  <Text style={styles.doneEmoji}>✨</Text>
                  <Text style={styles.doneTitle}>Session Complete!</Text>
                  <Text style={styles.doneSub}>
                    {selectedPattern.cycles} cycles · {Math.round(totalDuration / 60)} min
                  </Text>
                </LiquidGlassCard>
              </Animated.View>
            )}

            <View style={styles.patternList}>
              {PATTERNS.map((p) => (
                <PatternCard
                  key={p.id}
                  pattern={p}
                  selected={selectedPattern.id === p.id}
                  onSelect={setSelectedPattern}
                />
              ))}
            </View>

            {/* Selected pattern detail */}
            <LiquidGlassCard style={styles.detailCard} intensity="light">
              <LinearGradient
                colors={selectedPattern.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
              />
              <View style={styles.detailGrid}>
                {[
                  { label: 'Inhale', value: `${selectedPattern.inhale}s` },
                  { label: 'Hold', value: selectedPattern.hold > 0 ? `${selectedPattern.hold}s` : '—' },
                  { label: 'Exhale', value: `${selectedPattern.exhale}s` },
                  { label: 'Duration', value: `~${Math.round(totalDuration / 60)}m` },
                ].map(({ label, value }) => (
                  <View key={label} style={styles.detailItem}>
                    <Text style={styles.detailValue}>{value}</Text>
                    <Text style={styles.detailLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </LiquidGlassCard>

            <LiquidButton
              label={`Start ${selectedPattern.name}`}
              variant="primary"
              size="lg"
              onPress={handleStart}
              style={styles.startBtn}
            />

            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, gap: Spacing.base },
  header: { paddingVertical: Spacing.sm },
  pageTitle: { ...Typography.h1, color: Colors.text.primary },
  pageSubtitle: { ...Typography.body, color: Colors.text.secondary, marginTop: 2 },
  patternList: { gap: Spacing.sm },
  patternCard: { padding: Spacing.base, overflow: 'hidden' },
  patternCardSelected: { borderColor: Colors.accent.secondary },
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, marginBottom: 8 },
  patternEmoji: { fontSize: 28 },
  patternText: { flex: 1 },
  patternName: { ...Typography.h3, color: Colors.text.primary },
  patternMeta: { ...Typography.caption, color: Colors.accent.secondary, marginTop: 2 },
  selectedDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.accent.secondary,
  },
  patternDesc: { ...Typography.bodySm, color: Colors.text.secondary },
  detailCard: { padding: Spacing.xl, overflow: 'hidden' },
  detailGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { alignItems: 'center', gap: 4 },
  detailValue: { ...Typography.h2, color: Colors.text.primary },
  detailLabel: { ...Typography.labelSm, color: Colors.text.tertiary },
  startBtn: { marginTop: Spacing.sm },
  doneCard: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, overflow: 'hidden' },
  doneEmoji: { fontSize: 48 },
  doneTitle: { ...Typography.h2, color: Colors.text.primary },
  doneSub: { ...Typography.body, color: Colors.text.secondary },

  // Session view
  sessionView: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing['2xl'] },
  sessionHeader: { alignItems: 'center', gap: 4 },
  sessionTitle: { ...Typography.h2, color: Colors.text.primary },
  sessionCycles: { ...Typography.body, color: Colors.text.secondary },
  orbWrapper: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  guidance: { paddingHorizontal: Spacing['3xl'] },
  guidanceText: { ...Typography.bodyLg, color: Colors.text.secondary, textAlign: 'center', fontStyle: 'italic' },
  stopBtn: { marginBottom: Spacing.xl },
});
