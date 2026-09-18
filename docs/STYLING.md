# Styling (NativeWind)

LuminaFlow uses **[NativeWind v4](https://www.nativewind.dev/)** (Tailwind CSS for React Native).

## Setup

- `global.css` — Tailwind directives (imported from `App.tsx`)
- `tailwind.config.js` — design tokens (`void`, `accent`, `ink`, spacing, typography scales)
- `src/nativewindSetup.ts` — `cssInterop` for Reanimated, BlurView, LinearGradient
- Metro: `withNativeWind` in `metro.config.js`
- Babel: `nativewind/babel` + `jsxImportSource: 'nativewind'`

## Conventions

| Layer | Use |
|--------|-----|
| **Screens** | Tailwind classes via `className`; group strings in `*.tw.ts` next to the screen (see `home/home.tw.ts`) |
| **`@theme`** | `Colors`, `Typography`, etc. for programmatic values (charts, gradients) and legacy components until migrated |
| **Components** | Migrate incrementally; `StyleSheet` is fine until a component moves to `className` |

All tab/stack screens under `src/screens/*` use `*.tw.ts` (+ `*.static.ts` where Reanimated or tokens need plain `style`).

## Migrating a screen

1. Add class strings to `screens/<name>/<name>.tw.ts` (or inline `className` for small screens).
2. Replace `StyleSheet` / `screenStyles` usage in the screen `.tsx`.
3. Remove unused `styles.ts` for that screen.
4. Extend `tailwind.config.js` when you need new semantic tokens.

Run with a clean cache after config changes: `npx expo start -c`.

### Reanimated

Do **not** put `className` on `Animated.View` / `Animated.Text` (or wrap them with NativeWind `cssInterop`). Use plain `style` (or a small `*.static.ts` map) for anything that also uses `useAnimatedStyle`. `LiquidGlassCard` applies `className` / `contentClassName` on the **inner content** `View` (inside blur), not outside the glass shell.
