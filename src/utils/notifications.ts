import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ─── Notification channel ID ──────────────────────────────────────────────────

const CHANNEL_ID = 'lumina-daily-reminder';
const NOTIFICATION_ID_KEY = 'lumina-daily-notif-id';

// ─── Message pool ─────────────────────────────────────────────────────────────
// 14 messages — rotated by day-of-week so each week has variety.

const DAILY_MESSAGES: Array<{ title: string; body: string }> = [
  {
    title: 'Good morning ☀️',
    body: "A few mindful minutes can change your whole day. LuminaFlow is ready when you are.",
  },
  {
    title: 'Check in with yourself 💭',
    body: "How are you flowing today? Log your mood and keep your streak alive 🔥",
  },
  {
    title: 'Breathe with us 🌬️',
    body: "Even one 4-7-8 session melts tension away. Tap to start your daily practice.",
  },
  {
    title: 'Your journal awaits 📖',
    body: "Something happened today worth remembering. Write it down before it fades.",
  },
  {
    title: 'You showed up yesterday ✨',
    body: "Keep that streak going! A quick mood check-in takes 5 seconds.",
  },
  {
    title: 'Midday reset 🌿',
    body: "Step away from the noise. One mindful breath is all it takes to reset.",
  },
  {
    title: 'Evening reflection 🌙',
    body: "Before the day closes, how did it feel? Your journal is a safe space.",
  },
  {
    title: 'Tiny habits, big change 🌱',
    body: "Your {streak}-day streak is proof that small steps truly add up. Keep going.",
  },
  {
    title: 'Be gentle with yourself 💙',
    body: "Whatever today brings, LuminaFlow is here — no pressure, just presence.",
  },
  {
    title: 'Your daily sanctuary 🏡',
    body: "Take 3 minutes for you. Breathe, check in, or just write one sentence.",
  },
  {
    title: 'Mood check-in time 💜',
    body: "Naming how you feel is the first step to understanding it. How are you?",
  },
  {
    title: 'Time to flow 🌊',
    body: "Your mind deserves the same care as your body. Open LuminaFlow and practice.",
  },
  {
    title: 'Morning intention 🌸',
    body: "Set one gentle intention for today — then breathe it into being.",
  },
  {
    title: 'Gratitude unlocks peace 🙏',
    body: "Write one thing you're grateful for today. It only takes a moment.",
  },
];

function pickMessage(streak: number): { title: string; body: string } {
  const idx = new Date().getDay() % DAILY_MESSAGES.length;
  const msg = DAILY_MESSAGES[idx];
  return {
    title: msg.title,
    body: msg.body.replace('{streak}', String(streak || 1)),
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

/**
 * Configure how notifications are presented while the app is in the foreground.
 * Call once at app startup.
 */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Create the Android notification channel. No-op on iOS.
 */
async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Daily Mindfulness Reminder',
    description: 'Gentle daily nudges to practice mindfulness with LuminaFlow.',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 200, 100, 200],
    lightColor: '#7C5FF4',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
    enableVibrate: true,
  });
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

/**
 * Request notification permissions. Returns the final status.
 */
export async function requestNotificationPermission(): Promise<PermissionStatus> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return 'granted';

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return status as PermissionStatus;
}

/**
 * Check current permission status without prompting.
 */
export async function getNotificationPermission(): Promise<PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as PermissionStatus;
}

// ─── Scheduling ───────────────────────────────────────────────────────────────

/**
 * Parse "HH:mm" string into { hour, minute }.
 */
function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map(Number);
  return { hour: h ?? 8, minute: m ?? 0 };
}

/**
 * Cancel all previously scheduled daily reminders.
 */
export async function cancelDailyReminder(): Promise<void> {
  // Cancel all scheduled notifications (we only ever have one daily reminder)
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule a repeating daily notification at the given "HH:mm" time.
 * Cancels any existing reminder first to avoid duplicates.
 *
 * @param time     - "HH:mm" string, e.g. "08:30"
 * @param streak   - current streak count to personalise the message
 * @returns        - the scheduled notification identifier
 */
export async function scheduleDailyReminder(
  time: string,
  streak = 0
): Promise<string> {
  await ensureAndroidChannel();
  await cancelDailyReminder();

  const { hour, minute } = parseTime(time);
  const { title, body } = pickMessage(streak);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      badge: 1,
      data: { type: 'daily-reminder' },
      ...(Platform.OS === 'android' && {
        channelId: CHANNEL_ID,
        color: '#7C5FF4',
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return id;
}

/**
 * Re-schedule the reminder with a fresh message (call at app launch when
 * reminders are enabled, so the message pool rotates daily).
 */
export async function refreshDailyReminder(
  time: string,
  streak: number
): Promise<void> {
  const permission = await getNotificationPermission();
  if (permission !== 'granted') return;
  await scheduleDailyReminder(time, streak);
}

/**
 * Send an immediate local notification (used for testing or after enabling reminders).
 */
export async function sendTestNotification(name: string): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Reminders are on! 🎉`,
      body: `Hey ${name}, you'll hear from us daily. See you tomorrow! 🌸`,
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
    },
    trigger: null, // fire immediately
  });
}

// ─── Notification response handling ──────────────────────────────────────────

export type NotificationHandler = (
  notification: Notifications.Notification
) => void;

export type ResponseHandler = (
  response: Notifications.NotificationResponse
) => void;

/**
 * Add listeners for incoming notifications and user taps.
 * Returns a cleanup function — call it in a useEffect return.
 */
export function addNotificationListeners(
  onNotification?: NotificationHandler,
  onResponse?: ResponseHandler
): () => void {
  const receivedSub = onNotification
    ? Notifications.addNotificationReceivedListener(onNotification)
    : null;

  const responseSub = onResponse
    ? Notifications.addNotificationResponseReceivedListener(onResponse)
    : null;

  return () => {
    receivedSub?.remove();
    responseSub?.remove();
  };
}
