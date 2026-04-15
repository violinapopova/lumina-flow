# LuminaFlow

A calm, glassmorphism-styled wellness app built with **Expo SDK 55**, **React Native**, and **React Navigation**. Mood check-ins, journaling, guided breathing, streaks, and daily affirmations—with **Zustand** + **AsyncStorage** for local persistence and **React Native Reanimated** for fluid motion.
<img width="490" height="896" alt="Simulator Screenshot - iPhone 16 Plus - 2026-04-15 at 23 28 32" src="https://github.com/user-attachments/assets/59a6ed96-39b1-461a-a049-db8002b10e21" />



## Tech stack

- **Expo** ~55 · **React** 19 · **React Native** 0.83  
- **Navigation:** `@react-navigation/native`, native stack + bottom tabs  
- **State:** Zustand, persisted with AsyncStorage  
- **Motion / UI:** Reanimated, expo-blur, expo-linear-gradient, expo-haptics  
- **Notifications:** expo-notifications (optional daily reminders)

## Project structure

```
App.tsx                          ← GestureHandler root + splash fade
src/
├── theme/                       ← Colors, Typography, Spacing, Radius, Shadow
├── store/useAppStore.ts         ← Zustand + AsyncStorage (mood, journal, streak, profile)
├── components/
│   ├── LiquidGlassCard.tsx      ← Frosted blur + shimmer + inner glow + liquid ripple
│   ├── MoodOrb.tsx              ← Liquid drop entry + wiggle on select + glow ring
│   ├── BreathingOrb.tsx         ← Animated orb with rotating ring + phase-driven scale
│   ├── LiquidButton.tsx         ← Primary / ghost / danger variants with ripple press
│   ├── StreakCounter.tsx        ← Liquid fill progress bar with flame pulse
│   └── AnimatedBackground.tsx   ← Floating gradient orbs (per-screen configs)
├── screens/
│   ├── onboarding/              ← 4 stagger-poured glass cards + paginated scroll
│   ├── home/                    ← Ripple affirmation hero + mood picker + streak + breathe CTA
│   ├── mood/                    ← 7-day animated bar chart (Reanimated) + entry log
│   ├── journal/                 ← Entry list + slide-up compose modal + detail overlay
│   ├── breathe/                 ← 4 patterns (4-7-8, Box, Relax, Energize) + real timer
│   └── profile/                 ← Avatar picker + stats grid + settings toggles
└── navigation/
    ├── AppNavigator.tsx         ← Stack with fade transitions; skips onboarding if done
    └── TabNavigator.tsx         ← Glass blur tab bar with spring-animated icons
```

Root config also includes `app.json`, `babel.config.js` (Expo preset + Worklets for Reanimated 4), and `metro.config.js` (path aliases aligned with `tsconfig`).

## Getting started

```bash
npm install
npx expo start
```

Then open in **Expo Go** or run on a simulator (`i` / `a` in the CLI).

## Scripts

| Command        | Description        |
| -------------- | ------------------ |
| `npm run start` | Start Expo dev server |
| `npm run ios`   | Start + open iOS      |
| `npm run android` | Start + open Android |
| `npm run web`   | Start web (needs `react-native-web` if not installed) |
| `npm run lint`  | ESLint on `src/`      |

## License

Private / all rights reserved unless you add an explicit license file.
