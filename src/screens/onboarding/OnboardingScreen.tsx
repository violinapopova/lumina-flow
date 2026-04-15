import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LiquidGlassCard } from '@components/LiquidGlassCard';
import { LiquidButton } from '@components/LiquidButton';
import { AnimatedBackground } from '@components/AnimatedBackground';
import { Colors, Typography, Spacing, Radius } from '@theme';
import { useAppStore } from '@store/useAppStore';
import type { RootStackParamList } from '@navigation/types';

const { width: W, height: H } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
  accentColor: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    emoji: '🌊',
    title: 'Flow with your feelings',
    subtitle: 'LuminaFlow gently guides you through daily check-ins, helping you understand your emotional tides.',
    gradient: ['rgba(124,95,244,0.35)', 'rgba(167,139,250,0.15)'],
    accentColor: Colors.accent.primary,
  },
  {
    id: '2',
    emoji: '🌿',
    title: 'Breathe & be present',
    subtitle: 'Immersive breathing sessions and guided meditations designed to quiet the mind and restore calm.',
    gradient: ['rgba(110,231,183,0.30)', 'rgba(52,211,153,0.12)'],
    accentColor: Colors.orbs.mint,
  },
  {
    id: '3',
    emoji: '📖',
    title: 'Journal your journey',
    subtitle: 'A private, beautiful space to capture your thoughts. Writing helps you process, reflect, and grow.',
    gradient: ['rgba(249,168,212,0.28)', 'rgba(244,114,182,0.12)'],
    accentColor: Colors.orbs.rose,
  },
  {
    id: '4',
    emoji: '✨',
    title: 'Your daily sanctuary',
    subtitle: 'Build gentle habits with streak tracking, affirmations, and mood insights — all in one luminous place.',
    gradient: ['rgba(251,191,36,0.25)', 'rgba(245,158,11,0.10)'],
    accentColor: Colors.orbs.amber,
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const SlideCard: React.FC<{ item: OnboardingSlide; index: number; scrollX: SharedValue<number> }> = ({
  item, index, scrollX,
}) => {
  const cardAnim = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      cardAnim.value = withSpring(1, { damping: 16, stiffness: 100 });
    }, index * 100);
    return () => clearTimeout(timer);
  }, []);

  const inputRange = [(index - 1) * W, index * W, (index + 1) * W];

  const cardStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.88, 1, 0.88], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [30, 0, 30], Extrapolation.CLAMP);
    return { transform: [{ scale }, { translateY }], opacity };
  });

  const emojiStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [20, 0, 20], Extrapolation.CLAMP);
    return { transform: [{ scale }, { translateY }] };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.cardWrapper, cardStyle]}>
        <LiquidGlassCard style={styles.card} intensity="medium" borderGlow animated enterDelay={index * 150}>
          {/* Gradient tint */}
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
          />

          <Animated.Text style={[styles.emoji, emojiStyle]}>{item.emoji}</Animated.Text>

          <View style={styles.textContent}>
            <Text style={[styles.title, { color: Colors.text.primary }]}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>

          {/* Decorative liquid dot */}
          <View style={[styles.accentDot, { backgroundColor: item.accentColor }]} />
        </LiquidGlassCard>
      </Animated.View>
    </View>
  );
};

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    setActiveIndex(idx);
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    setHasOnboarded(true);
    navigation.replace('Main', { screen: 'Home' } as any);
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <AnimatedBackground variant="home" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>LuminaFlow</Text>
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item, index }: ListRenderItemInfo<OnboardingSlide>) => (
            <SlideCard item={item} index={index} scrollX={scrollX} />
          )}
        />

        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <DotIndicator key={i} index={i} activeIndex={activeIndex} scrollX={scrollX} />
          ))}
        </View>

        {/* CTA Button */}
        <View style={styles.ctaContainer}>
          <LiquidButton
            label={isLast ? 'Begin Your Journey ✨' : 'Continue'}
            onPress={handleNext}
            variant="primary"
            size="lg"
            style={styles.ctaButton}
          />
          {!isLast && (
            <LiquidButton
              label="Skip"
              onPress={handleGetStarted}
              variant="ghost"
              size="sm"
              style={styles.skipButton}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const DotIndicator: React.FC<{
  index: number;
  activeIndex: number;
  scrollX: SharedValue<number>;
}> = ({ index, activeIndex, scrollX }) => {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * W, index * W, (index + 1) * W];
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolation.CLAMP);
    return { width, opacity };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        dotStyle,
        { backgroundColor: activeIndex === index ? Colors.accent.secondary : Colors.text.tertiary },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  safeArea: { flex: 1 },
  logoRow: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  logoText: {
    ...Typography.h2,
    color: Colors.accent.tertiary,
    letterSpacing: 1,
  },
  slide: {
    width: W,
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  cardWrapper: {
    borderRadius: Radius.lg,
  },
  card: {
    padding: Spacing['2xl'],
    minHeight: H * 0.45,
    overflow: 'hidden',
    position: 'relative',
  },
  emoji: {
    fontSize: 72,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  textContent: {
    gap: Spacing.md,
  },
  title: {
    ...Typography.displaySm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyLg,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  accentDot: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.15,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
  },
  skipButton: {},
});
