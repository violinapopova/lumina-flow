import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Radius } from '@theme';

interface StreakCounterProps {
  current: number;
  longest: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ current, longest }) => {
  const fillProgress = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const flameScale = useSharedValue(1);

  useEffect(() => {
    const target = longest > 0 ? Math.min(current / longest, 1) : 0.1;
    fillProgress.value = withTiming(target, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withSpring(1, { damping: 14, stiffness: 120 });

    // Flame pulse
    const interval = setInterval(() => {
      flameScale.value = withSpring(1.2, { damping: 8, stiffness: 200 }, () => {
        flameScale.value = withSpring(1, { damping: 12, stiffness: 200 });
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [current, longest]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${interpolate(fillProgress.value, [0, 1], [0, 100])}%` as `${number}%`,
  }));

  const containerStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const flameStyle = useAnimatedStyle(() => ({ transform: [{ scale: flameScale.value }] }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(124, 95, 244, 0.15)', 'rgba(90, 60, 180, 0.08)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.borderOverlay} />

      <View style={styles.row}>
        <Animated.Text style={[styles.flame, flameStyle]}>🔥</Animated.Text>
        <View style={styles.textGroup}>
          <Text style={styles.count}>{current}</Text>
          <Text style={styles.label}>day streak</Text>
        </View>
        <View style={styles.rightGroup}>
          <Text style={styles.bestLabel}>best</Text>
          <Text style={styles.bestCount}>{longest}</Text>
        </View>
      </View>

      {/* Liquid fill bar */}
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, fillStyle]}>
          <LinearGradient
            colors={[Colors.accent.primary, Colors.orbs.lavender, Colors.orbs.mint]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Liquid surface shimmer */}
          <View style={styles.barShimmer} />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flame: {
    fontSize: 32,
  },
  textGroup: {
    flex: 1,
  },
  count: {
    ...Typography.h1,
    color: Colors.text.primary,
  },
  label: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  rightGroup: {
    alignItems: 'flex-end',
  },
  bestLabel: {
    ...Typography.labelSm,
    color: Colors.text.tertiary,
  },
  bestCount: {
    ...Typography.h3,
    color: Colors.accent.secondary,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  barShimmer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 3,
  },
});
