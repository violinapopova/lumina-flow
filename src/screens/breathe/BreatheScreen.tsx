import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  type ListRenderItemInfo,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { BreathingOrb } from '@components/BreathingOrb';
import { GlassCardInset } from '@components/GlassCardInset';
import { LiquidGlassCard } from '@components/LiquidGlassCard';
import { LiquidButton } from '@components/LiquidButton';
import { AnimatedBackground } from '@components/AnimatedBackground';
import { Colors, Spacing } from '@theme';
import { breatheTw } from './breathe.tw';
import { breatheStatic } from './breathe.static';
import { useAppStore } from '@store/useAppStore';
import { BREATH_PATTERNS } from '@/data/breathPatterns';
import type { BreathPattern, BreathPhase } from '@/domain/breathing';
import { PHASE_LABELS } from '@/domain/breathing';
import { useBreathingTimer } from '@hooks/useBreathingTimer';
import { genId } from '@utils/id';
import {
  speakBreathingCountdown,
  speakBreathingPhase,
  speakSessionComplete,
  stopBreathingSpeech,
} from '@utils/breathingSpeech';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function resolveOrbPhase(
  isCountingDown: boolean,
  countdownWord: string | null,
  phase: BreathPhase,
): BreathPhase {
  if (!isCountingDown) return phase;
  if (countdownWord === 'Start') return 'inhale';
  return 'idle';
}

function resolveOrbLabel(
  isCountingDown: boolean,
  countdownWord: string | null,
  phase: BreathPhase,
): string {
  if (isCountingDown && countdownWord) {
    return countdownWord === 'Start' ? 'Start' : '';
  }
  return PHASE_LABELS[phase];
}

function resolveOrbSeconds(
  isCountingDown: boolean,
  countdownWord: string | null,
  secondsLeft: number,
): number {
  if (isCountingDown && countdownWord && /^\d$/.test(countdownWord)) {
    return Number.parseInt(countdownWord, 10);
  }
  if (isCountingDown) return 0;
  return secondsLeft;
}

const PatternCard = React.memo(function PatternCard({
  pattern,
  selected,
  onSelect,
}: {
  pattern: BreathPattern;
  selected: boolean;
  onSelect: (p: BreathPattern) => void;
}) {
  const emphasis = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    emphasis.value = withSpring(selected ? 1 : 0, { damping: 16, stiffness: 200 });
  }, [selected]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: interpolate(emphasis.value, [0, 1], [0.92, 1]),
  }));

  return (
    <Animated.View style={[breatheStatic.patternCardWrap, cardStyle]}>
      <LiquidGlassCard
        className={`${breatheTw.patternCard}${selected ? ` ${breatheTw.patternCardSelected}` : ''}`}
        intensity="medium"
        onPress={() => onSelect(pattern)}
        borderGlow={selected}
      >
        <GlassCardInset gradientColors={pattern.gradient}>
        <View className={breatheTw.patternCardContent}>
        <View className={breatheTw.patternRow}>
          <Text className={breatheTw.patternEmoji}>{pattern.emoji}</Text>
          <View className={breatheTw.patternText}>
            <Text className={breatheTw.patternName}>{pattern.name}</Text>
            <Text className={breatheTw.patternMeta}>
              {pattern.inhale}-{pattern.hold > 0 ? `${pattern.hold}-` : ''}{pattern.exhale} · {pattern.cycles} cycles
            </Text>
          </View>
          {selected && <View className={breatheTw.selectedDot} />}
        </View>
        <Text className={breatheTw.patternDesc} numberOfLines={2}>{pattern.description}</Text>
        </View>
        </GlassCardInset>
      </LiquidGlassCard>
    </Animated.View>
  );
});

const PatternListSeparator = () => <View className={breatheTw.patternSeparator} />;

export const BreatheScreen: React.FC = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const [selectedPattern, setSelectedPattern] = useState(BREATH_PATTERNS[0]);
  const [isActive, setIsActive] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const addMeditationSession = useAppStore((s) => s.addMeditationSession);

  const totalDuration = selectedPattern.cycles *
    (selectedPattern.inhale + selectedPattern.hold + selectedPattern.exhale + selectedPattern.pause);

  const handleComplete = useCallback(() => {
    stopBreathingSpeech();
    speakSessionComplete();
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

  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownWord, setCountdownWord] = useState<string | null>(null);
  const inSession = isActive || isCountingDown;

  useEffect(() => {
    if (!inSession) {
      stopBreathingSpeech();
    }
  }, [inSession]);

  useEffect(() => {
    if (!isActive || phase === 'idle') return;
    speakBreathingPhase(phase);
  }, [isActive, phase]);

  const renderPattern = useCallback(
    ({ item }: ListRenderItemInfo<BreathPattern>) => (
      <PatternCard
        pattern={item}
        selected={selectedPattern.id === item.id}
        onSelect={setSelectedPattern}
      />
    ),
    [selectedPattern.id],
  );

  const patternListHeader = useMemo(
    () => (
      <>
        {sessionDone && (
          <Animated.View entering={FadeIn}>
            <LiquidGlassCard className={breatheTw.doneCard} intensity="medium">
              <LinearGradient
                colors={['rgba(110,231,183,0.25)', 'rgba(52,211,153,0.10)']}
                style={[StyleSheet.absoluteFill, breatheStatic.doneGradient]}
              />
              <Text className={breatheTw.doneEmoji}>✨</Text>
              <Text className={breatheTw.doneTitle}>Session Complete!</Text>
              <Text className={breatheTw.doneSub}>
                {selectedPattern.cycles} cycles · {Math.round(totalDuration / 60)} min
              </Text>
            </LiquidGlassCard>
          </Animated.View>
        )}
        <Text className={breatheTw.listSectionLabel}>Choose a pattern</Text>
      </>
    ),
    [sessionDone, selectedPattern.cycles, totalDuration],
  );

  const handleStart = () => {
    if (isCountingDown || isActive) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSessionDone(false);
    setCountdownWord(null);
    setIsCountingDown(true);
    speakBreathingCountdown(
      () => {
        setCountdownWord(null);
        setIsCountingDown(false);
        setIsActive(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
      (word) => setCountdownWord(word),
    );
  };

  const handleStop = () => {
    stopBreathingSpeech();
    setCountdownWord(null);
    setIsCountingDown(false);
    setIsActive(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const orbPhase = resolveOrbPhase(isCountingDown, countdownWord, phase);
  const orbLabel = resolveOrbLabel(isCountingDown, countdownWord, phase);
  const orbSeconds = resolveOrbSeconds(isCountingDown, countdownWord, secondsLeft);

  return (
    <View className={breatheTw.screen}>
      <AnimatedBackground variant="breathe" />
      <SafeAreaView className={breatheTw.safe} edges={['top']}>

        {inSession ? (
          // ─── Active Session View ─────────────────────────────────────────
          <View
            className={breatheTw.sessionView}
            style={{ paddingBottom: tabBarHeight + Spacing.md }}
          >
            <View className={breatheTw.sessionHeader}>
              <Text className={breatheTw.sessionTitle}>{selectedPattern.name}</Text>
              <Text className={breatheTw.sessionCycles}>
                Cycle {Math.min(cyclesDone + 1, selectedPattern.cycles)} of{' '}
                {selectedPattern.cycles}
              </Text>
            </View>

            <View className={breatheTw.orbWrapper}>
              <BreathingOrb
                isActive={inSession}
                phase={orbPhase}
                progress={isCountingDown ? 0 : progress}
                label={orbLabel}
                secondsLeft={orbSeconds}
              />
            </View>

            <View className={breatheTw.guidance}>
              <Text className={breatheTw.guidanceText}>
                {phase === 'inhale' || isCountingDown
                  ? 'Breathe in slowly through your nose...'
                  : null}
                {!isCountingDown && phase === 'hold' && 'Hold gently, keep still...'}
                {!isCountingDown && phase === 'exhale' && 'Release slowly through your mouth...'}
                {!isCountingDown && phase === 'pause' && 'Rest, let everything settle...'}
              </Text>
            </View>

            <LiquidButton
              label="End Session"
              variant="ghost"
              size="md"
              onPress={handleStop}
            />
          </View>
        ) : (
          // ─── Selection View: pinned summary + scrollable pattern list ───
          <View className={breatheTw.selectionLayout}>
            <View className={breatheTw.selectionPinned}>
              <View className={breatheTw.header}>
                <View className={breatheTw.headerText}>
                  <Text className={breatheTw.pageTitle}>Breathe</Text>
                  <Text className={breatheTw.pageSubtitle}>
                    {selectedPattern.emoji} {selectedPattern.name} · ~{Math.round(totalDuration / 60)} min
                  </Text>
                </View>
                <Pressable className={breatheTw.startHeaderBtn} onPress={handleStart}>
                  <BlurView intensity={30} tint="dark" className="absolute inset-0" />
                  <LinearGradient
                    colors={[Colors.accent.primary, '#5B3FD9']}
                    style={[StyleSheet.absoluteFill, breatheStatic.startBtnGradient]}
                  />
                  <Text className={breatheTw.startHeaderBtnText}>Start</Text>
                </Pressable>
              </View>

              <LiquidGlassCard className={breatheTw.detailCard} intensity="light">
                <View className={breatheTw.detailCardInner}>
                  <LinearGradient
                    colors={selectedPattern.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, breatheStatic.detailGradient]}
                  />
                  <View className={breatheTw.detailGrid}>
                    {[
                      { label: 'Inhale', value: `${selectedPattern.inhale}s` },
                      { label: 'Hold', value: selectedPattern.hold > 0 ? `${selectedPattern.hold}s` : '—' },
                      { label: 'Exhale', value: `${selectedPattern.exhale}s` },
                      { label: 'Duration', value: `~${Math.round(totalDuration / 60)}m` },
                    ].map(({ label, value }) => (
                      <View key={label} className={breatheTw.detailItem}>
                        <Text className={breatheTw.detailValue}>{value}</Text>
                        <Text className={breatheTw.detailLabel}>{label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </LiquidGlassCard>
            </View>

            <FlatList
              className={breatheTw.scroll}
              data={BREATH_PATTERNS}
              keyExtractor={(item) => item.id}
              renderItem={renderPattern}
              ListHeaderComponent={patternListHeader}
              ItemSeparatorComponent={PatternListSeparator}
              contentContainerClassName={breatheTw.scrollContent}
              contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing.lg }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

