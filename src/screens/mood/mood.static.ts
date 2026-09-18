import { StyleSheet } from 'react-native';

/** Non–className fills for chart bars (inside Reanimated views). */
export const moodChartStatic = {
  barEmptyFill: StyleSheet.absoluteFill,
  barEmptyBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
};
