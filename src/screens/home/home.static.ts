import { Colors } from '@theme';
import type { ViewStyle } from 'react-native';

/** Layout for Reanimated views — do not use `className` on `Animated.*` (breaks worklets). */
export const homeAnimatedLayout = {
  rippleRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: Colors.accent.secondary,
  } satisfies ViewStyle,
};
