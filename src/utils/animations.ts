import {
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

/**
 * Standard spring configs for consistent Liquid Glass feel.
 */
export const Springs = {
  /** Gentle bouncy — UI elements appearing */
  gentle: { damping: 18, stiffness: 120, mass: 0.8 },
  /** Snappy response — button presses */
  snappy: { damping: 22, stiffness: 350 },
  /** Wobbly liquid drop — mood orbs */
  liquid: { damping: 10, stiffness: 100, mass: 0.9 },
  /** Slow settle — breathing orb */
  slow: { damping: 14, stiffness: 60, mass: 1.2 },
} as const;

/**
 * Stagger-pour animation: drives `progress` from 0→1 with a delay.
 * Use with `interpolate` in useAnimatedStyle to control translateY + opacity.
 */
export const pourIn = (sv: SharedValue<number>, delay = 0) => {
  sv.value = withDelay(
    delay,
    withSpring(1, Springs.gentle)
  );
};

/**
 * Liquid press feedback: squish down then bounce back.
 */
export const liquidPress = (sv: SharedValue<number>) => {
  sv.value = withSequence(
    withTiming(0.92, { duration: 80, easing: Easing.out(Easing.quad) }),
    withSpring(1, Springs.snappy)
  );
};

/**
 * Ripple outward from center: scale 0→2 with fade.
 */
export const rippleOut = (
  scale: SharedValue<number>,
  opacity: SharedValue<number>
) => {
  scale.value = 0;
  opacity.value = 0.25;
  scale.value = withSpring(2, { damping: 12, stiffness: 150 });
  opacity.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
};

/**
 * Fade + slide up entry.
 */
export const slideUpIn = (
  translateY: SharedValue<number>,
  opacity: SharedValue<number>,
  delay = 0,
  fromY = 30
) => {
  translateY.value = fromY;
  opacity.value = 0;
  translateY.value = withDelay(delay, withSpring(0, Springs.gentle));
  opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
};
