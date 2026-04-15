import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    thin: 'System',
    light: 'System',
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    heavy: 'System',
  },
  android: {
    thin: 'sans-serif-thin',
    light: 'sans-serif-light',
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    semiBold: 'sans-serif-medium',
    bold: 'sans-serif',
    heavy: 'sans-serif-black',
  },
  default: {
    thin: 'System',
    light: 'System',
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    heavy: 'System',
  },
})!;

export const Typography = {
  // Display — used for hero headings
  display: {
    fontFamily: fontFamily.bold,
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: -1.2,
    fontWeight: '700' as const,
  },
  displaySm: {
    fontFamily: fontFamily.bold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.8,
    fontWeight: '700' as const,
  },

  // Headings
  h1: {
    fontFamily: fontFamily.semiBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
    fontWeight: '600' as const,
  },
  h2: {
    fontFamily: fontFamily.semiBold,
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.3,
    fontWeight: '600' as const,
  },
  h3: {
    fontFamily: fontFamily.medium,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.2,
    fontWeight: '500' as const,
  },

  // Body
  bodyLg: {
    fontFamily: fontFamily.regular,
    fontSize: 17,
    lineHeight: 26,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0,
    fontWeight: '400' as const,
  },
  bodySm: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '400' as const,
  },

  // Labels
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.6,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
  },
  labelSm: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
  },

  // Caption
  caption: {
    fontFamily: fontFamily.light,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.2,
    fontWeight: '300' as const,
  },
} as const;
