import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

export type ScreenStyle = ViewStyle | TextStyle | ImageStyle;

/**
 * Typed style maps for screens. Plain objects at module scope are the default RN pattern
 * (no StyleSheet.create required); keeps styles in dedicated files with full TS checking.
 */
export function screenStyles<T extends Record<string, ScreenStyle>>(styles: T): T {
  return styles;
}

/** Same layout as `StyleSheet.absoluteFill` / `absoluteFillObject`. */
export const absoluteFill: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};
