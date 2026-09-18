# LuminaFlow

A calm, glassmorphism-styled wellness app built with **Expo SDK 55**, **React Native**, and **React Navigation**. Mood check-ins, journaling, guided breathing, streaks, and daily affirmations—with **Zustand** + **AsyncStorage** for on-device persistence and **React Native Reanimated** for fluid motion.

## Features

| Area | What you get |
|------|----------------|
| **Home** | Time-based greeting, daily affirmation, mood picker, streak card, quick links to Breathe & Journal |
| **Mood** | 7-day Reanimated bar chart, distribution pills, check-in log (virtualized list) |
| **Journal** | Entry list, slide-up compose sheet, full-screen read overlay |
| **Breathe** | Multiple patterns (e.g. 4-7-8, box), countdown + voice cues, session timer & orb |
| **Profile** | Avatar & name, journey stats, dark mode, optional daily notification reminders |
| **Onboarding** | Four intro slides; skipped on return visits |

All user data stays **local** on the device (no backend). Profile includes **Clear all data** when you need a fresh start.

## Tech stack

| Layer | Choices |
|-------|---------|
| Runtime | **Expo** ~55 · **React** 19 · **React Native** 0.83 |
| Navigation | React Navigation 7 — native stack + bottom tabs |
| State | **Zustand** slices, persisted via **AsyncStorage** (`lumina-flow-storage`) |
| Styling | **NativeWind v4** (Tailwind) on screens; `@theme` tokens for charts/gradients; shared UI components still use `StyleSheet` where needed |
| Motion | Reanimated 4 + Worklets, expo-blur, expo-linear-gradient, expo-haptics |
| Voice | expo-speech (breathing countdown & phase cues) |
| Notifications | expo-notifications (optional daily reminders on Profile) |

## Project structure

```
App.tsx                    Entry: global.css, splash, notification bootstrap
global.css / tailwind.config.js
docs/STYLING.md            NativeWind conventions & Reanimated notes

src/
├── domain/                Mood catalog, breathing types, shared models
├── data/                  Static content (e.g. breath patterns)
├── store/
│   ├── useAppStore.ts     Combined store + clearAllUserData()
│   └── slices/            mood, journal, meditation, profile, settings, streak
├── hooks/                 Breathing timer, tab-bar hide, haptics, color scheme
├── utils/                 Dates, IDs, notifications, breathing speech
├── theme/                 Colors, typography, spacing (programmatic styling)
├── components/            Liquid glass UI, orbs, streak, backgrounds
├── screens/
│   └── <screen>/
│       ├── *Screen.tsx
│       ├── *.tw.ts        Tailwind class groups (screens)
│       └── *.static.ts    Plain styles for Reanimated / dynamic layout (when needed)
└── navigation/            App stack, tab navigator, tab bar styles
```

Path aliases (`@components`, `@screens`, `@store`, `@theme`, `@hooks`, `@utils`, `@navigation`, `@/…`) are set in `tsconfig.json` and Metro.

## Getting started

**Requirements:** Node 18+, npm, and [Expo Go](https://expo.dev/go) or a local iOS/Android simulator.

```bash
git clone https://github.com/violinapopova/lumina-flow.git
cd lumina-flow
npm install
npx expo start
```

Press **`i`** (iOS simulator) or **`a`** (Android emulator), or scan the QR code in Expo Go.

After changing Tailwind or Babel config, clear the Metro cache:

```bash
npx expo start -c
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start Expo dev server |
| `npm run ios` | Start and open iOS |
| `npm run android` | Start and open Android |
| `npm run web` | Start web target |
| `npm run lint` | ESLint on `src/` (requires ESLint config in repo) |

## Styling

Screen layout uses **NativeWind** `className` strings collected in per-screen `*.tw.ts` files. See **[docs/STYLING.md](docs/STYLING.md)** for setup, tokens, and why `Animated.*` views use `*.static.ts` instead of `className`.

## Agent skills (optional)

Callstack-style skills for RN performance, React Navigation, and upgrades live under `.agents/skills/` (installed via the [agent-skills](https://github.com/callstackincubator/agent-skills) tooling). Handy for refactors and upgrade checklists—not required to run the app.

## License

Private / all rights reserved unless an explicit license file is added.
