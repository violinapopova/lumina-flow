import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Shadow } from '@theme';
import type { MoodLevel } from '@store/useAppStore';

interface MoodOrbProps {
  mood: MoodLevel;
  emoji: string;
  label: string;
  selected?: boolean;
  onSelect: (mood: MoodLevel) => void;
  delay?: number;
  style?: ViewStyle;
}

const MOOD_COLORS: Record<MoodLevel, [string, string]> = {
  rad: ['#F472B6', '#EC4899'],
  good: ['#34D399', '#10B981'],
  meh: ['#FBBF24', '#F59E0B'],
  bad: ['#60A5FA', '#3B82F6'],
  awful: ['#F87171', '#EF4444'],
};

const MOOD_GLOW: Record<MoodLevel, string> = {
  rad: 'rgba(244, 114, 182, 0.6)',
  good: 'rgba(52, 211, 153, 0.6)',
  meh: 'rgba(251, 191, 36, 0.6)',
  bad: 'rgba(96, 165, 250, 0.6)',
  awful: 'rgba(248, 113, 113, 0.6)',
};

export const MoodOrb: React.FC<MoodOrbProps> = ({
  mood,
  emoji,
  label,
  selected = false,
  onSelect,
  delay = 0,
  style,
}) => {
  const scale = useSharedValue(0);
  const selected$ = useSharedValue(selected ? 1 : 0);
  const pressAnim = useSharedValue(0);
  const wiggle = useSharedValue(0);

  // Entry: liquid drop falls in
  React.useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 120, mass: 0.8 });
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  // Selection state
  React.useEffect(() => {
    selected$.value = withSpring(selected ? 1 : 0, { damping: 14, stiffness: 200 });
    if (selected) {
      // Liquid drop impact wiggle
      wiggle.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-4, { duration: 60 }),
        withTiming(4, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    }
  }, [selected]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(selected$.value, [0, 1], [1, 1.18]) * scale.value * interpolate(pressAnim.value, [0, 1], [1, 0.88]) },
      { translateX: wiggle.value },
    ],
    shadowOpacity: interpolate(selected$.value, [0, 1], [0, 1.0]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(selected$.value, [0, 1], [0.55, 1]),
    transform: [{ scale: interpolate(selected$.value, [0, 1], [0.9, 1]) }],
  }));

  const handlePress = () => {
    pressAnim.value = withSequence(
      withTiming(1, { duration: 100 }),
      withSpring(0, { damping: 8, stiffness: 300 })
    );
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    runOnJS(onSelect)(mood);
  };

  const colors = MOOD_COLORS[mood];
  const glowColor = MOOD_GLOW[mood];

  return (
    <Pressable onPress={handlePress} style={[styles.wrapper, style]}>
      <Animated.View
        style={[
          styles.orbContainer,
          orbStyle,
          {
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 20,
            shadowOpacity: selected ? 1 : 0,
            elevation: selected ? 20 : 4,
          },
        ]}
      >
        <LinearGradient
          colors={selected ? colors : [`${colors[0]}88`, `${colors[1]}88`]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.orb}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </LinearGradient>
        {/* Liquid highlight */}
        <Animated.View style={styles.highlight} />
      </Animated.View>
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 8,
  },
  orbContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'relative',
  },
  orb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 6,
    left: 10,
    width: 20,
    height: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  emoji: {
    fontSize: 26,
  },
  label: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
