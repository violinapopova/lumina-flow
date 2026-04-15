export const Colors = {
  // Deep background palette
  background: {
    primary: '#0D0A1E',    // Deep void indigo
    secondary: '#120D2B',  // Elevated panel
    tertiary: '#1A1035',   // Card background
    overlay: 'rgba(13, 10, 30, 0.85)',
  },

  // Liquid Glass surfaces
  glass: {
    light: 'rgba(255, 255, 255, 0.06)',
    medium: 'rgba(255, 255, 255, 0.10)',
    strong: 'rgba(255, 255, 255, 0.15)',
    border: 'rgba(255, 255, 255, 0.18)',
    borderLight: 'rgba(255, 255, 255, 0.08)',
    shimmer: 'rgba(255, 255, 255, 0.25)',
    innerGlow: 'rgba(167, 139, 250, 0.12)',
  },

  // Brand accent — indigo/violet core
  accent: {
    primary: '#7C5FF4',     // Luminous indigo
    secondary: '#A78BFA',   // Soft violet
    tertiary: '#C4B5FD',    // Pale lavender
    glow: 'rgba(124, 95, 244, 0.45)',
    glowSoft: 'rgba(124, 95, 244, 0.20)',
  },

  // Mood palette — each maps to a mood state
  mood: {
    rad: '#F472B6',        // Hot pink — radiant joy
    good: '#34D399',       // Mint green — calm content
    meh: '#FBBF24',        // Warm amber — neutral
    bad: '#60A5FA',        // Sky blue — melancholy
    awful: '#F87171',      // Soft coral — distress
  },

  // Gradient stops
  gradient: {
    heroStart: '#1E1040',
    heroEnd: '#2D1B69',
    breatheStart: '#0F1F3D',
    breatheEnd: '#1A3A5C',
    moodStart: '#1F0E3A',
    moodEnd: '#0E1F2E',
    sunriseStart: '#2D1B69',
    sunriseEnd: '#7C5FF4',
  },

  // Orb / liquid element accents
  orbs: {
    indigo: '#818CF8',
    lavender: '#C084FC',
    mint: '#6EE7B7',
    coral: '#FDA4AF',
    amber: '#FCD34D',
    blue: '#93C5FD',
    rose: '#F9A8D4',
  },

  // Text
  text: {
    primary: '#F0EEFF',
    secondary: 'rgba(240, 238, 255, 0.65)',
    tertiary: 'rgba(255, 255, 255, 0.82)',
    accent: '#A78BFA',
    inverse: '#0D0A1E',
  },

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#6366F1',

  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;
