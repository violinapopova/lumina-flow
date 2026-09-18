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
import { Colors } from '@theme';
import { onboardingTw } from './onboarding.tw';
import { onboardingStatic } from './onboarding.static';
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
    <View style={onboardingStatic.slide}>
      <Animated.View className={onboardingTw.cardWrapper} style={cardStyle}>
        <LiquidGlassCard
          className={onboardingTw.card}
          intensity="medium"
          borderGlow
          animated
          enterDelay={index * 150}
        >
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, onboardingStatic.slideGradient]}
          />

          <Animated.Text style={[onboardingStatic.emoji, emojiStyle]}>{item.emoji}</Animated.Text>

          <View className={onboardingTw.textContent}>
            <Text className={onboardingTw.title}>{item.title}</Text>
            <Text className={onboardingTw.subtitle}>{item.subtitle}</Text>
          </View>

          <View
            className={onboardingTw.accentDot}
            style={{ backgroundColor: item.accentColor }}
          />
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
    <View className={onboardingTw.screen}>
      <AnimatedBackground variant="home" />

      <SafeAreaView className={onboardingTw.safe} edges={['top', 'bottom']}>
        <View className={onboardingTw.logoRow}>
          <Text className={onboardingTw.logoText}>LuminaFlow</Text>
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
        <View className={onboardingTw.dots}>
          {SLIDES.map((_, i) => (
            <DotIndicator key={i} index={i} activeIndex={activeIndex} scrollX={scrollX} />
          ))}
        </View>

        <View className={onboardingTw.ctaContainer}>
          <View className={onboardingTw.ctaButton}>
            <LiquidButton
              label={isLast ? 'Begin Your Journey ✨' : 'Continue'}
              onPress={handleNext}
              variant="primary"
              size="lg"
              style={{ width: '100%' }}
            />
          </View>
          {!isLast && (
            <LiquidButton
              label="Skip"
              onPress={handleGetStarted}
              variant="ghost"
              size="sm"
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
      className={onboardingTw.dot}
      style={[
        dotStyle,
        { backgroundColor: activeIndex === index ? Colors.accent.secondary : Colors.text.tertiary },
      ]}
    />
  );
};
