import React, { useRef } from 'react';
import {
  StyleSheet,
  ViewStyle,
  Pressable,
  View,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Shadow } from '@theme';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  intensity?: 'light' | 'medium' | 'strong';
  glowColor?: string;
  borderGlow?: boolean;
  ripple?: boolean;
  disabled?: boolean;
  animated?: boolean;
  /** Entry animation: card pours in with gravity */
  enterDelay?: number;
}

const BLUR_INTENSITY = { light: 20, medium: 40, strong: 60 } as const;
const BG_OPACITY = { light: 0.06, medium: 0.10, strong: 0.16 } as const;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedView = Animated.View;

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  style,
  onPress,
  intensity = 'medium',
  glowColor = Colors.accent.glow,
  borderGlow = true,
  ripple = true,
  disabled = false,
  animated = false,
  enterDelay = 0,
}) => {
  const pressed = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const entryProgress = useSharedValue(animated ? 0 : 1);

  // Entry animation
  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        entryProgress.value = withSpring(1, { damping: 18, stiffness: 100 });
      }, enterDelay);
      return () => clearTimeout(timer);
    }
  }, [animated, enterDelay]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(pressed.value ? 0.97 : 1, { damping: 20, stiffness: 300 }) },
      { translateY: withSpring(pressed.value ? 2 : 0, { damping: 20, stiffness: 300 }) },
      // Entry: pour in from above
      {
        translateY: interpolate(entryProgress.value, [0, 1], [-40, 0]) + (pressed.value ? 2 : 0),
      },
    ],
    opacity: interpolate(entryProgress.value, [0, 0.6, 1], [0, 0.7, 1]),
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: withTiming(pressed.value ? 0.5 : 0.18, { duration: 200 }),
  }));

  const handlePressIn = () => {
    pressed.value = 1;
    if (ripple) {
      rippleScale.value = 0;
      rippleOpacity.value = 0.15;
      rippleScale.value = withSpring(1.5, { damping: 15, stiffness: 200 });
      rippleOpacity.value = withTiming(0, { duration: 600 });
    }
  };

  const handlePressOut = () => {
    pressed.value = 0;
  };

  const handlePress = () => {
    runOnJS(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light))();
    onPress?.();
  };

  const blurIntensity = BLUR_INTENSITY[intensity];
  const bgOpacity = BG_OPACITY[intensity];

  const content = (
    <AnimatedView style={[styles.container, cardStyle, style]}>
      {/* Frosted glass base */}
      <BlurView intensity={blurIntensity} tint="dark" style={StyleSheet.absoluteFill} />

      {/* Translucent tinted surface */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: `rgba(130, 100, 255, ${bgOpacity})` },
        ]}
      />

      {/* Top shimmer gradient */}
      <LinearGradient
        colors={[Colors.glass.shimmer, Colors.glass.borderLight, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.3 }}
        style={[StyleSheet.absoluteFill, styles.shimmer]}
        pointerEvents="none"
      />

      {/* Inner glow */}
      {borderGlow && (
        <LinearGradient
          colors={[Colors.glass.innerGlow, 'transparent', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.innerGlow]}
          pointerEvents="none"
        />
      )}

      {/* Liquid border */}
      <AnimatedView
        style={[StyleSheet.absoluteFill, styles.border, borderStyle]}
        pointerEvents="none"
      />

      {/* Ripple effect */}
      {ripple && (
        <AnimatedView style={[styles.ripple, rippleStyle]} pointerEvents="none" />
      )}

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </AnimatedView>
  );

  if (onPress) {
    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        style={styles.pressable}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  pressable: {
    borderRadius: Radius.lg,
  },
  container: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.card,
  },
  shimmer: {
    borderRadius: Radius.lg,
    opacity: 0.6,
  },
  innerGlow: {
    borderRadius: Radius.lg,
  },
  border: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  ripple: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.glass.shimmer,
    borderRadius: Radius.lg,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
