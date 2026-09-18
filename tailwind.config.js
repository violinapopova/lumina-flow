/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#0D0A1E',
          panel: '#120D2B',
          card: '#1A1035',
        },
        accent: {
          DEFAULT: '#7C5FF4',
          primary: '#7C5FF4',
          secondary: '#A78BFA',
          tertiary: '#C4B5FD',
        },
        ink: {
          primary: '#F0EEFF',
          secondary: 'rgba(240, 238, 255, 0.65)',
          tertiary: 'rgba(255, 255, 255, 0.82)',
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.18)',
        },
        mood: {
          rad: '#F472B6',
          good: '#34D399',
          meh: '#FBBF24',
          bad: '#60A5FA',
          awful: '#F87171',
        },
        orb: {
          blue: '#93C5FD',
          rose: '#F9A8D4',
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        base: 16,
        lg: 20,
        xl: 24,
        '2xl': 32,
        '3xl': 40,
      },
      borderRadius: {
        md: 16,
        lg: 24,
      },
      fontSize: {
        'display-sm': ['32px', { lineHeight: '40px', letterSpacing: -0.8 }],
        h1: ['28px', { lineHeight: '34px', letterSpacing: -0.5, fontWeight: '700' }],
        h2: ['22px', { lineHeight: '28px', letterSpacing: -0.3, fontWeight: '600' }],
        h3: ['18px', { lineHeight: '24px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px' }],
        'body-lg': ['18px', { lineHeight: '28px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        caption: ['12px', { lineHeight: '16px' }],
        label: ['11px', { lineHeight: '14px', letterSpacing: 0.6, fontWeight: '600' }],
        'label-sm': ['10px', { lineHeight: '12px', letterSpacing: 0.5, fontWeight: '600' }],
      },
    },
  },
  plugins: [],
};
