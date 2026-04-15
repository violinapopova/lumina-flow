import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Typography } from '@theme';

const { width: W } = Dimensions.get('window');
const ORB_SIZE = W * 0.65;

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'pause';

interface BreathingOrbProps {
  isActive: boolean;
  phase: Phase;
  progress: number; // 0–1
  label: string;
  secondsLeft: number;
}

const PHASE_COLORS: Record<Phase, [string, string, string]> = {
  idle:    ['rgba(124,95,244,0.6)', 'rgba(167,139,250,0.4)', 'rgba(196,181,253,0.2)'],
  inhale:  ['rgba(96,165,250,0.7)', 'rgba(110,231,183,0.5)', 'rgba(167,139,250,0.3)'],
  hold:    ['rgba(251,191,36,0.6)', 'rgba(249,168,212,0.4)', 'rgba(196,181,253,0.3)'],
  exhale:  ['rgba(110,231,183,0.6)', 'rgba(96,165,250,0.4)', 'rgba(167,139,250,0.2)'],
  pause:   ['rgba(124,95,244,0.4)', 'rgba(167,139,250,0.3)', 'rgba(196,181,253,0.15)'],
};

const PHASE_SCALE: Record<Phase, number> = {
  idle: 0.75,
  inhale: 1.0,
  hold: 1.0,
  exhale: 0.65,
  pause: 0.65,
};

export const BreathingOrb: React.FC<BreathingOrbProps> = ({
  isActive, phase, progress, label, secondsLeft,
}) => {
  const scale = useSharedValue(0.75);
  const opacity = useSharedValue(0.7);
  const rotateAnim = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (isActive) {
      // Continuous slow rotation
      rotateAnim.value = withRepeat(
        withTiming(360, { duration: 12000, easing: Easing.linear }),
        -1,
        false
      );
      // Outer glow pulse
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(rotateAnim);
      cancelAnimation(glowOpacity);
      glowOpacity.value = withTiming(0.3, { duration: 400 });
    }
  }, [isActive]);

  useEffect(() => {
    const targetScale = PHASE_SCALE[phase];
    const duration = phase === 'inhale' ? 4000 : phase === 'exhale' ? 6000 : 1000;
    scale.value = withTiming(targetScale, {
      duration,
      easing: phase === 'inhale'
        ? Easing.out(Easing.cubic)
        : Easing.inOut(Easing.sin),
    });
  }, [phase]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(scale.value, [0.65, 1.0], [1.1, 1.35]) }],
  }));

  const colors = PHASE_COLORS[phase];

  return (
    <View style={styles.container}>
      {/* Outer glow ring */}
      <Animated.View style={[styles.glowRing, glowStyle]}>
        <LinearGradient
          colors={[`${colors[0]}44`, `${colors[1]}22`, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Rotating liquid ring */}
      <Animated.View style={[styles.rotatingRing, rotateStyle]}>
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <View
            key={angle}
            style={[
              styles.ringDot,
              {
                transform: [
                  { rotate: `${angle}deg` },
                  { translateY: -(ORB_SIZE / 2 + 16) },
                ],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Main orb */}
      <Animated.View style={[styles.orbWrapper, orbStyle]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.8, y: 0.9 }}
          style={styles.orb}
        >
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          {/* Inner highlight */}
          <View style={styles.highlight} />
          {/* Progress ring */}
          <View style={styles.centerContent}>
            <Text style={styles.seconds}>{secondsLeft}</Text>
            <Text style={styles.phaseLabel}>{label}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ORB_SIZE + 80,
    height: ORB_SIZE + 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: (ORB_SIZE + 80) / 2,
    backgroundColor: 'rgba(124,95,244,0.08)',
  },
  rotatingRing: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(196,181,253,0.5)',
  },
  orbWrapper: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    overflow: 'hidden',
  },
  orb: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlight: {
    position: 'absolute',
    top: ORB_SIZE * 0.1,
    left: ORB_SIZE * 0.2,
    width: ORB_SIZE * 0.35,
    height: ORB_SIZE * 0.2,
    borderRadius: ORB_SIZE * 0.15,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  centerContent: {
    alignItems: 'center',
    gap: 4,
  },
  seconds: {
    ...Typography.display,
    color: Colors.text.primary,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  phaseLabel: {
    ...Typography.h3,
    color: Colors.text.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
