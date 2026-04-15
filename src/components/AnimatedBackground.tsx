import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@theme';

const { width: W, height: H } = Dimensions.get('window');

interface FloatingOrbProps {
  size: number;
  color: string;
  startX: number;
  startY: number;
  duration: number;
  delay: number;
  amplitude: number;
}

const FloatingOrb: React.FC<FloatingOrbProps> = ({
  size, color, startX, startY, duration, delay, amplitude,
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 800 });
      translateY.value = withRepeat(
        withSequence(
          withTiming(-amplitude, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(amplitude * 0.6, { duration: duration / 2, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      translateX.value = withRepeat(
        withSequence(
          withTiming(amplitude * 0.4, { duration: duration * 0.7, easing: Easing.inOut(Easing.sin) }),
          withTiming(-amplitude * 0.3, { duration: duration * 0.3, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: duration * 0.6, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.92, { duration: duration * 0.4, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: startX - size / 2,
          top: startY - size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
};

interface AnimatedBackgroundProps {
  variant?: 'home' | 'breathe' | 'mood' | 'journal';
}

const ORB_CONFIGS: Record<
  NonNullable<AnimatedBackgroundProps['variant']>,
  FloatingOrbProps[]
> = {
  home: [
    { size: 300, color: 'rgba(124, 95, 244, 0.18)', startX: W * 0.8, startY: H * 0.1, duration: 8000, delay: 0, amplitude: 30 },
    { size: 220, color: 'rgba(192, 132, 252, 0.14)', startX: W * 0.1, startY: H * 0.4, duration: 10000, delay: 500, amplitude: 25 },
    { size: 160, color: 'rgba(110, 231, 183, 0.10)', startX: W * 0.6, startY: H * 0.7, duration: 7000, delay: 1000, amplitude: 20 },
    { size: 120, color: 'rgba(249, 168, 212, 0.12)', startX: W * 0.2, startY: H * 0.8, duration: 9000, delay: 300, amplitude: 22 },
  ],
  breathe: [
    { size: 400, color: 'rgba(96, 165, 250, 0.15)', startX: W * 0.5, startY: H * 0.4, duration: 6000, delay: 0, amplitude: 60 },
    { size: 260, color: 'rgba(110, 231, 183, 0.12)', startX: W * 0.2, startY: H * 0.6, duration: 8000, delay: 800, amplitude: 40 },
    { size: 180, color: 'rgba(167, 139, 250, 0.15)', startX: W * 0.8, startY: H * 0.3, duration: 7000, delay: 400, amplitude: 35 },
  ],
  mood: [
    { size: 250, color: 'rgba(244, 114, 182, 0.12)', startX: W * 0.9, startY: H * 0.15, duration: 9000, delay: 0, amplitude: 28 },
    { size: 200, color: 'rgba(251, 191, 36, 0.10)', startX: W * 0.05, startY: H * 0.5, duration: 11000, delay: 600, amplitude: 22 },
    { size: 150, color: 'rgba(124, 95, 244, 0.15)', startX: W * 0.5, startY: H * 0.8, duration: 8000, delay: 200, amplitude: 18 },
  ],
  journal: [
    { size: 280, color: 'rgba(124, 95, 244, 0.12)', startX: W * 0.8, startY: H * 0.2, duration: 10000, delay: 0, amplitude: 25 },
    { size: 200, color: 'rgba(110, 231, 183, 0.10)', startX: W * 0.15, startY: H * 0.6, duration: 9000, delay: 400, amplitude: 20 },
  ],
};

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'home',
}) => {
  const orbs = ORB_CONFIGS[variant];

  const gradientColors: Record<
    NonNullable<AnimatedBackgroundProps['variant']>,
    [string, string, string]
  > = {
    home: [Colors.background.primary, Colors.gradient.heroStart, '#1A0840'],
    breathe: [Colors.background.primary, Colors.gradient.breatheStart, Colors.gradient.breatheEnd],
    mood: [Colors.background.primary, Colors.gradient.moodStart, Colors.gradient.moodEnd],
    journal: [Colors.background.primary, '#1E1040', '#0D1828'],
  };

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={gradientColors[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {orbs.map((orb, i) => (
        <FloatingOrb key={i} {...orb} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
  },
});
