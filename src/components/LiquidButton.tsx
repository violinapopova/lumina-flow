import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Radius, Shadow } from '@theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface LiquidButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

const GRADIENT_COLORS: Record<Variant, [string, string]> = {
  primary: [Colors.accent.primary, '#5B3FD9'],
  secondary: ['rgba(124,95,244,0.25)', 'rgba(90,60,220,0.15)'],
  ghost: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'],
  danger: ['#EF4444', '#DC2626'],
};

const TEXT_COLORS: Record<Variant, string> = {
  primary: Colors.white,
  secondary: Colors.accent.tertiary,
  ghost: Colors.text.secondary,
  danger: Colors.white,
};

const SIZE_CONFIG: Record<Size, { height: number; px: number; fontSize: number }> = {
  sm: { height: 40, px: 18, fontSize: 13 },
  md: { height: 52, px: 24, fontSize: 15 },
  lg: { height: 60, px: 32, fontSize: 17 },
};

export const LiquidButton: React.FC<LiquidButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  icon,
}) => {
  const pressed = useSharedValue(0);
  const ripple = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const cfg = SIZE_CONFIG[size];

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(pressed.value ? 0.95 : 1, { damping: 20, stiffness: 400 }) },
    ],
    opacity: withTiming(disabled ? 0.45 : 1, { duration: 200 }),
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ripple.value }],
    opacity: rippleOpacity.value,
  }));

  const handlePressIn = () => {
    pressed.value = 1;
    ripple.value = 0;
    rippleOpacity.value = 0.3;
    ripple.value = withSpring(1.8, { damping: 12, stiffness: 180 });
    rippleOpacity.value = withTiming(0, { duration: 500 });
  };

  const handlePressOut = () => {
    pressed.value = 0;
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress?.();
    }
  };

  const isGhost = variant === 'ghost' || variant === 'secondary';

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      <Animated.View style={[containerStyle, style]}>
        {isGhost ? (
          <>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={GRADIENT_COLORS[variant]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.full }]}
            />
          </>
        ) : (
          <LinearGradient
            colors={GRADIENT_COLORS[variant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: Radius.full }]}
          />
        )}

        {/* Border */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.border,
            { borderColor: isGhost ? Colors.glass.border : 'rgba(255,255,255,0.2)' },
          ]}
        />

        {/* Ripple */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.rippleOverlay,
            rippleStyle,
          ]}
          pointerEvents="none"
        />

        {/* Content */}
        <Animated.View
          style={[styles.content, { height: cfg.height, paddingHorizontal: cfg.px }]}
        >
          {loading ? (
            <ActivityIndicator color={TEXT_COLORS[variant]} size="small" />
          ) : (
            <>
              {icon}
              <Text
                style={[
                  styles.label,
                  { fontSize: cfg.fontSize, color: TEXT_COLORS[variant] },
                ]}
              >
                {label}
              </Text>
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  border: {
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  rippleOverlay: {
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
