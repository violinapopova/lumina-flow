import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LiquidGlassCard } from '@components/LiquidGlassCard';
import { MoodOrb } from '@components/MoodOrb';
import { StreakCounter } from '@components/StreakCounter';
import { LiquidButton } from '@components/LiquidButton';
import { AnimatedBackground } from '@components/AnimatedBackground';
import { Colors, Typography, Spacing, Radius } from '@theme';
import { useAppStore, genId, type MoodLevel } from '@store/useAppStore';
import type { TabParamList, RootStackParamList } from '@navigation/types';

const { width: W } = Dimensions.get('window');

const AFFIRMATIONS = [
  "You are exactly where you need to be. 🌿",
  "Every breath is a new beginning. ✨",
  "Your feelings are valid. Be gentle with yourself. 💙",
  "Progress, not perfection. You are growing. 🌱",
  "Today, choose peace over worry. 🕊️",
  "You have survived every difficult day so far. 💜",
  "Small steps still move you forward. 🌊",
];

const MOOD_OPTIONS: { mood: MoodLevel; emoji: string; label: string }[] = [
  { mood: 'rad', emoji: '🤩', label: 'Rad' },
  { mood: 'good', emoji: '😊', label: 'Good' },
  { mood: 'meh', emoji: '😐', label: 'Meh' },
  { mood: 'bad', emoji: '😔', label: 'Bad' },
  { mood: 'awful', emoji: '😢', label: 'Awful' },
];

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const RippleHeroCard: React.FC<{ affirmation: string }> = ({ affirmation }) => {
  const ripple1 = useSharedValue(0);
  const ripple2 = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    textOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });

    const startRipple = () => {
      ripple1.value = 0;
      ripple1.value = withTiming(1, { duration: 2500, easing: Easing.out(Easing.cubic) });
      setTimeout(() => {
        ripple2.value = 0;
        ripple2.value = withTiming(1, { duration: 2500, easing: Easing.out(Easing.cubic) });
      }, 600);
    };

    startRipple();
    const interval = setInterval(startRipple, 4000);
    return () => clearInterval(interval);
  }, []);

  const ripple1Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ripple1.value, [0, 1], [0.6, 1.6]) }],
    opacity: interpolate(ripple1.value, [0, 0.3, 1], [0.5, 0.3, 0]),
  }));

  const ripple2Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ripple2.value, [0, 1], [0.6, 1.6]) }],
    opacity: interpolate(ripple2.value, [0, 0.3, 1], [0.4, 0.2, 0]),
  }));

  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  return (
    <LiquidGlassCard style={styles.heroCard} intensity="strong" borderGlow animated>
      <LinearGradient
        colors={['rgba(124,95,244,0.22)', 'rgba(90,60,220,0.08)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
      />

      {/* Ripple circles */}
      <View style={styles.rippleContainer} pointerEvents="none">
        <Animated.View style={[styles.rippleRing, ripple1Style]} />
        <Animated.View style={[styles.rippleRing, ripple2Style]} />
      </View>

      <Animated.View style={[styles.heroContent, textStyle]}>
        <Text style={styles.heroLabel}>DAILY AFFIRMATION</Text>
        <Text style={styles.heroText}>{affirmation}</Text>
        <Text style={styles.heroDate}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </Animated.View>
    </LiquidGlassCard>
  );
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const affirmation = AFFIRMATIONS[new Date().getDay() % AFFIRMATIONS.length];
  const { addMoodEntry, todayMood, currentStreak, longestStreak, checkAndUpdateStreak } =
    useAppStore();

  useEffect(() => {
    checkAndUpdateStreak();
  }, []);

  const handleMoodSelect = (mood: MoodLevel) => {
    addMoodEntry({
      id: genId(),
      mood,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground variant="home" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good morning ☀️</Text>
              <Text style={styles.headerSubtitle}>How are you flowing today?</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
              style={styles.avatarButton}
            >
              <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
              <Text style={styles.avatarEmoji}>🌸</Text>
            </Pressable>
          </View>

          {/* Hero Affirmation Card */}
          <RippleHeroCard affirmation={affirmation} />

          {/* Mood Picker */}
          <LiquidGlassCard style={styles.moodCard} intensity="light">
            <Text style={styles.sectionLabel}>How are you feeling?</Text>
            {todayMood && (
              <Text style={styles.moodSetLabel}>
                Today you felt {todayMood} ✓
              </Text>
            )}
            <View style={styles.moodRow}>
              {MOOD_OPTIONS.map((opt, i) => (
                <MoodOrb
                  key={opt.mood}
                  mood={opt.mood}
                  emoji={opt.emoji}
                  label={opt.label}
                  selected={todayMood === opt.mood}
                  onSelect={handleMoodSelect}
                  delay={i * 100}
                />
              ))}
            </View>
          </LiquidGlassCard>

          {/* Streak Counter */}
          <StreakCounter current={currentStreak} longest={longestStreak} />

          {/* Breathe Quick Launch */}
          <LiquidGlassCard
            style={styles.breatheCard}
            intensity="medium"
            onPress={() => navigation.navigate('Main', { screen: 'Breathe' })}
            borderGlow
          >
            <LinearGradient
              colors={['rgba(96,165,250,0.20)', 'rgba(110,231,183,0.10)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
            />
            <View style={styles.breatheRow}>
              <View style={styles.breatheTextGroup}>
                <Text style={styles.breatheTitle}>Take a breath 🌬️</Text>
                <Text style={styles.breatheSubtitle}>4-7-8 breathing • 5 min</Text>
              </View>
              <View style={styles.breatheArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* Quick Journal Entry */}
          <LiquidGlassCard
            style={styles.journalCard}
            intensity="light"
            onPress={() => navigation.navigate('Main', { screen: 'Journal' })}
          >
            <LinearGradient
              colors={['rgba(249,168,212,0.15)', 'rgba(244,114,182,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
            />
            <View style={styles.journalRow}>
              <Text style={styles.journalTitle}>Write in your journal 📖</Text>
              <Text style={styles.journalSub}>Capture today's moments</Text>
            </View>
          </LiquidGlassCard>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, gap: Spacing.base },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  greeting: { ...Typography.h1, color: Colors.text.primary },
  headerSubtitle: { ...Typography.body, color: Colors.text.secondary, marginTop: 2 },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  avatarEmoji: { fontSize: 24 },
  heroCard: { padding: Spacing.xl, minHeight: 160, overflow: 'hidden' },
  rippleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: Colors.accent.secondary,
  },
  heroContent: { gap: Spacing.sm },
  heroLabel: { ...Typography.labelSm, color: Colors.accent.secondary },
  heroText: { ...Typography.h2, color: Colors.text.primary, lineHeight: 32 },
  heroDate: { ...Typography.caption, color: Colors.text.tertiary },
  moodCard: { padding: Spacing.base, gap: Spacing.md },
  sectionLabel: { ...Typography.label, color: Colors.text.secondary },
  moodSetLabel: { ...Typography.caption, color: Colors.accent.secondary },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  breatheCard: { padding: Spacing.base, overflow: 'hidden' },
  breatheRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  breatheTextGroup: { gap: 4 },
  breatheTitle: { ...Typography.h3, color: Colors.text.primary },
  breatheSubtitle: { ...Typography.body, color: Colors.text.secondary },
  breatheArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(96,165,250,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { fontSize: 20, color: Colors.orbs.blue },
  journalCard: { padding: Spacing.base, overflow: 'hidden' },
  journalRow: { gap: 4 },
  journalTitle: { ...Typography.h3, color: Colors.text.primary },
  journalSub: { ...Typography.body, color: Colors.text.secondary },
});
