import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AppNavigator } from '@navigation/AppNavigator';
import {
  configureNotificationHandler,
  refreshDailyReminder,
  addNotificationListeners,
} from '@utils/notifications';
import { useAppStore } from '@store/useAppStore';

// ─── Configure notification presentation (must run before any scheduling) ─────
configureNotificationHandler();

// ─── Splash fade overlay ──────────────────────────────────────────────────────

const SplashOverlay: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      setTimeout(onDone, 650);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, style, { backgroundColor: '#0D0A1E', zIndex: 999 }]}
      pointerEvents="none"
    />
  );
};

// ─── Notification bootstrapper ────────────────────────────────────────────────

const NotificationBootstrap: React.FC = () => {
  const { profile, currentStreak, checkAndUpdateStreak } = useAppStore();

  useEffect(() => {
    // Refresh the daily reminder on every app launch so the message pool rotates.
    // Only runs if the user has reminders enabled and permission was previously granted.
    if (profile.reminderEnabled && profile.notificationPermission === 'granted') {
      refreshDailyReminder(profile.reminderTime, currentStreak);
    }

    // Listen for taps on notifications (deep-link handling can be added here)
    const cleanup = addNotificationListeners(
      undefined,
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.type === 'daily-reminder') {
          // User tapped the daily reminder — mark them active for streak
          checkAndUpdateStreak();
        }
      }
    );

    return cleanup;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — intentionally runs once on mount

  return null;
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [splashDone, setSplashDone] = React.useState(false);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <AppNavigator />
      <NotificationBootstrap />
      {!splashDone && <SplashOverlay onDone={() => setSplashDone(true)} />}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
