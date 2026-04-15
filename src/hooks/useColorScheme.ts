import { useAppStore } from '@store/useAppStore';
import { Colors } from '@theme/colors';

/**
 * Returns the current theme colors based on dark/light mode preference.
 * LuminaFlow defaults to dark (Liquid Glass) mode.
 */
export const useColorScheme = () => {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  return { isDarkMode, colors: Colors };
};
