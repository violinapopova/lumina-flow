import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TextInput,
  Pressable,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { LiquidGlassCard } from '@components/LiquidGlassCard';
import { LiquidButton } from '@components/LiquidButton';
import { AnimatedBackground } from '@components/AnimatedBackground';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme';
import { useAppStore } from '@store/useAppStore';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
  sendTestNotification,
} from '@utils/notifications';

// ─── Avatar options ───────────────────────────────────────────────────────────

const AVATAR_EMOJIS = ['🌸', '🌿', '🌊', '✨', '🦋', '🌙', '🌺', '🍃', '💫', '🌻'];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SettingRow: React.FC<{
  icon: string;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  highlight?: boolean;
}> = ({ icon, label, sublabel, right, onPress, highlight }) => (
  <Pressable onPress={onPress} style={styles.settingRow}>
    <View style={[styles.settingIcon, highlight && styles.settingIconHighlight]}>
      <Text style={styles.settingIconText}>{icon}</Text>
    </View>
    <View style={styles.settingTextGroup}>
      <Text style={styles.settingLabel}>{label}</Text>
      {sublabel !== undefined && (
        <Text style={styles.settingSublabel}>{sublabel}</Text>
      )}
    </View>
    {right !== undefined && <View style={styles.settingRight}>{right}</View>}
  </Pressable>
);

const StatCard: React.FC<{
  value: string | number;
  label: string;
  emoji: string;
  delay: number;
}> = ({ value, label, emoji, delay }) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.statCard}>
    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
    <LinearGradient
      colors={['rgba(124,95,244,0.15)', 'rgba(90,60,220,0.06)']}
      style={StyleSheet.absoluteFill}
    />
    <View style={styles.statBorder} />
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Animated.View>
);

// ─── Time Picker ──────────────────────────────────────────────────────────────

interface TimePickerProps {
  value: string; // "HH:mm"
  onChange: (time: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [h, m] = value.split(':').map(Number);

  const nudge = (field: 'h' | 'm', delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (field === 'h') {
      const next = ((h + delta + 24) % 24).toString().padStart(2, '0');
      onChange(`${next}:${m.toString().padStart(2, '0')}`);
    } else {
      // snap to 5-minute intervals
      const steps = Math.round(m / 5);
      const next = (((steps + delta) * 5 + 60) % 60).toString().padStart(2, '0');
      onChange(`${h.toString().padStart(2, '0')}:${next}`);
    }
  };

  const hourLabel = h === 0 ? '12' : h > 12 ? String(h - 12) : String(h);
  const period = h < 12 ? 'AM' : 'PM';
  const minLabel = m.toString().padStart(2, '0');

  return (
    <Animated.View entering={FadeIn.duration(300)} style={timeStyles.container}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(124,95,244,0.18)', 'rgba(90,60,220,0.08)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={timeStyles.border} />

      <Text style={timeStyles.heading}>Set reminder time</Text>

      <View style={timeStyles.pickerRow}>
        {/* Hour column */}
        <View style={timeStyles.column}>
          <Pressable onPress={() => nudge('h', 1)} style={timeStyles.arrow} hitSlop={8}>
            <Text style={timeStyles.arrowText}>▲</Text>
          </Pressable>
          <View style={timeStyles.valueBox}>
            <Text style={timeStyles.valueText}>{hourLabel}</Text>
          </View>
          <Pressable onPress={() => nudge('h', -1)} style={timeStyles.arrow} hitSlop={8}>
            <Text style={timeStyles.arrowText}>▼</Text>
          </Pressable>
        </View>

        <Text style={timeStyles.colon}>:</Text>

        {/* Minute column */}
        <View style={timeStyles.column}>
          <Pressable onPress={() => nudge('m', 1)} style={timeStyles.arrow} hitSlop={8}>
            <Text style={timeStyles.arrowText}>▲</Text>
          </Pressable>
          <View style={timeStyles.valueBox}>
            <Text style={timeStyles.valueText}>{minLabel}</Text>
          </View>
          <Pressable onPress={() => nudge('m', -1)} style={timeStyles.arrow} hitSlop={8}>
            <Text style={timeStyles.arrowText}>▼</Text>
          </Pressable>
        </View>

        {/* AM / PM */}
        <View style={timeStyles.periodColumn}>
          <Pressable
            onPress={() => nudge('h', h < 12 ? 12 : -12)}
            style={[timeStyles.periodBtn, h < 12 && timeStyles.periodBtnActive]}
          >
            <Text style={[timeStyles.periodText, h < 12 && timeStyles.periodTextActive]}>AM</Text>
          </Pressable>
          <Pressable
            onPress={() => nudge('h', h >= 12 ? -12 : 12)}
            style={[timeStyles.periodBtn, h >= 12 && timeStyles.periodBtnActive]}
          >
            <Text style={[timeStyles.periodText, h >= 12 && timeStyles.periodTextActive]}>PM</Text>
          </Pressable>
        </View>
      </View>

      <Text style={timeStyles.hint}>Tap ▲ ▼ to adjust · minutes snap to 5-min intervals</Text>
    </Animated.View>
  );
};

const timeStyles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    padding: Spacing.base,
    gap: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  heading: { ...Typography.label, color: Colors.text.secondary },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  column: { alignItems: 'center', gap: 6 },
  arrow: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(124,95,244,0.15)',
  },
  arrowText: { color: Colors.accent.secondary, fontSize: 13, fontWeight: '600' },
  valueBox: {
    width: 64,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,95,244,0.20)',
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  valueText: { ...Typography.h1, color: Colors.text.primary },
  colon: { ...Typography.h1, color: Colors.text.tertiary, marginTop: 4 },
  periodColumn: { gap: 8, marginLeft: 8 },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  periodBtnActive: {
    backgroundColor: 'rgba(124,95,244,0.3)',
    borderColor: Colors.accent.secondary,
  },
  periodText: { ...Typography.bodySm, color: Colors.text.tertiary, fontWeight: '600' },
  periodTextActive: { color: Colors.accent.secondary },
  hint: { ...Typography.caption, color: Colors.text.tertiary, textAlign: 'center' },
});

// ─── Permission denied banner ─────────────────────────────────────────────────

const PermissionDeniedBanner: React.FC = () => (
  <Animated.View entering={FadeIn.duration(300)}>
    <LiquidGlassCard style={bannerStyles.card} intensity="light">
      <LinearGradient
        colors={['rgba(239,68,68,0.18)', 'rgba(239,68,68,0.06)']}
        style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
      />
      <Text style={bannerStyles.icon}>🔕</Text>
      <View style={bannerStyles.text}>
        <Text style={bannerStyles.title}>Notifications blocked</Text>
        <Text style={bannerStyles.body}>
          Enable them in your device Settings to receive daily mindfulness reminders.
        </Text>
      </View>
      <Pressable
        onPress={() => Linking.openSettings()}
        style={bannerStyles.btn}
      >
        <Text style={bannerStyles.btnText}>Open Settings</Text>
      </Pressable>
    </LiquidGlassCard>
  </Animated.View>
);

const bannerStyles = StyleSheet.create({
  card: { padding: Spacing.base, gap: Spacing.sm, overflow: 'hidden' },
  icon: { fontSize: 28 },
  text: { flex: 1, gap: 2 },
  title: { ...Typography.h3, color: Colors.text.primary },
  body: { ...Typography.caption, color: Colors.text.secondary },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent.primary,
  },
  btnText: { ...Typography.bodySm, color: Colors.white, fontWeight: '600' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export const ProfileScreen: React.FC = () => {
  const {
    profile, updateProfile,
    isDarkMode, toggleDarkMode,
    moodEntries, journalEntries, meditationSessions,
    currentStreak,
  } = useAppStore();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);

  const avatarScale = useSharedValue(1);
  const avatarStyle = useAnimatedStyle(() => ({ transform: [{ scale: avatarScale.value }] }));

  const totalMeditationMinutes = Math.round(
    meditationSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60
  );

  // ── Avatar ──────────────────────────────────────────────────────────────────

  const handleAvatarPress = () => {
    avatarScale.value = withSpring(1.15, { damping: 10, stiffness: 300 }, () => {
      avatarScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    });
    setShowAvatarPicker(true);
  };

  const handleNameSave = () => {
    if (nameInput.trim()) updateProfile({ name: nameInput.trim() });
    setEditingName(false);
  };

  // ── Notifications ────────────────────────────────────────────────────────────

  const handleReminderToggle = useCallback(async (enabled: boolean) => {
    setReminderLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (!enabled) {
        // Turn off
        await cancelDailyReminder();
        updateProfile({ reminderEnabled: false });
        setShowTimePicker(false);
      } else {
        // Request permission first
        const status = await requestNotificationPermission();
        updateProfile({ notificationPermission: status });

        if (status === 'granted') {
          await scheduleDailyReminder(profile.reminderTime, currentStreak);
          await sendTestNotification(profile.name);
          updateProfile({ reminderEnabled: true });
          setShowTimePicker(true); // open the time picker so they can tweak it
        } else if (status === 'denied') {
          // Already denied — show the settings banner
          updateProfile({ reminderEnabled: false });
        } else {
          // undetermined and still undetermined after prompt — do nothing
          updateProfile({ reminderEnabled: false });
        }
      }
    } catch (e) {
      console.warn('[LuminaFlow] Notification toggle error:', e);
    } finally {
      setReminderLoading(false);
    }
  }, [profile.reminderTime, profile.name, currentStreak, updateProfile]);

  const handleTimeChange = useCallback(async (newTime: string) => {
    updateProfile({ reminderTime: newTime });
    // Reschedule with the new time immediately if enabled
    if (profile.reminderEnabled && profile.notificationPermission === 'granted') {
      await scheduleDailyReminder(newTime, currentStreak);
    }
  }, [profile.reminderEnabled, profile.notificationPermission, currentStreak, updateProfile]);

  const formatReminderSublabel = () => {
    if (!profile.reminderEnabled) return 'Tap to turn on daily reminders';
    const [h, m] = profile.reminderTime.split(':').map(Number);
    const period = h < 12 ? 'AM' : 'PM';
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `Every day at ${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const showDeniedBanner =
    profile.reminderEnabled === false &&
    profile.notificationPermission === 'denied';

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <AnimatedBackground variant="home" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Profile Hero ── */}
          <LiquidGlassCard style={styles.heroCard} intensity="strong">
            <LinearGradient
              colors={['rgba(124,95,244,0.25)', 'rgba(90,60,220,0.10)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
            />

            <Pressable onPress={handleAvatarPress} style={styles.avatarWrapper}>
              <Animated.View style={[styles.avatarContainer, avatarStyle]}>
                <LinearGradient
                  colors={[Colors.accent.primary, '#5B3FD9', Colors.orbs.lavender]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarEmoji}>{profile.avatarEmoji}</Text>
                </LinearGradient>
                <View style={styles.avatarHighlight} />
              </Animated.View>
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>✏️</Text>
              </View>
            </Pressable>

            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                  onSubmitEditing={handleNameSave}
                  returnKeyType="done"
                />
                <Pressable onPress={handleNameSave} style={styles.nameSaveBtn}>
                  <Text style={styles.nameSaveBtnText}>Save</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setEditingName(true)} style={styles.nameRow}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.editHint}>Tap to edit</Text>
              </Pressable>
            )}

            <Text style={styles.joinedText}>
              Member since {format(parseISO(profile.joinedAt), 'MMMM yyyy')}
            </Text>
          </LiquidGlassCard>

          {/* ── Avatar picker ── */}
          {showAvatarPicker && (
            <LiquidGlassCard style={styles.avatarPickerCard} intensity="medium">
              <Text style={styles.pickerTitle}>Choose your avatar</Text>
              <View style={styles.pickerGrid}>
                {AVATAR_EMOJIS.map((emoji) => (
                  <Pressable
                    key={emoji}
                    style={[
                      styles.pickerItem,
                      emoji === profile.avatarEmoji && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      updateProfile({ avatarEmoji: emoji });
                      setShowAvatarPicker(false);
                    }}
                  >
                    <Text style={styles.pickerEmoji}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </LiquidGlassCard>
          )}

          {/* ── Stats ── */}
          <Text style={styles.sectionTitle}>Your Journey</Text>
          <View style={styles.statsGrid}>
            <StatCard value={currentStreak} label="Day Streak" emoji="🔥" delay={0} />
            <StatCard value={moodEntries.length} label="Check-ins" emoji="💭" delay={80} />
            <StatCard value={journalEntries.length} label="Entries" emoji="📖" delay={160} />
            <StatCard value={`${totalMeditationMinutes}m`} label="Breathed" emoji="🌬️" delay={240} />
          </View>

          {/* ── Settings ── */}
          <Text style={styles.sectionTitle}>Settings</Text>
          <LiquidGlassCard style={styles.settingsCard} intensity="light">
            {/* Dark mode */}
            <SettingRow
              icon="🌙"
              label="Dark Mode"
              sublabel="Liquid Glass dark theme"
              right={
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: 'rgba(255,255,255,0.15)', true: Colors.accent.primary }}
                  thumbColor={Colors.white}
                />
              }
            />

            <View style={styles.divider} />

            {/* Daily reminder toggle */}
            <SettingRow
              icon="🔔"
              label="Daily Reminder"
              sublabel={formatReminderSublabel()}
              highlight={profile.reminderEnabled}
              right={
                <Switch
                  value={profile.reminderEnabled}
                  onValueChange={handleReminderToggle}
                  disabled={reminderLoading}
                  trackColor={{ false: 'rgba(255,255,255,0.15)', true: Colors.accent.primary }}
                  thumbColor={Colors.white}
                />
              }
            />

            {/* Time picker (shown inline when reminder is on) */}
            {profile.reminderEnabled && profile.notificationPermission === 'granted' && (
              <>
                <View style={styles.timePickerWrapper}>
                  <TimePicker
                    value={profile.reminderTime}
                    onChange={handleTimeChange}
                  />
                </View>
                <Pressable
                  style={styles.testNotifBtn}
                  onPress={() => sendTestNotification(profile.name)}
                >
                  <Text style={styles.testNotifText}>Send test notification →</Text>
                </Pressable>
              </>
            )}

            <View style={styles.divider} />
            <SettingRow
              icon="📊"
              label="Data & Privacy"
              sublabel="All data stored locally on device"
              right={<Text style={styles.chevron}>›</Text>}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="ℹ️"
              label="About LuminaFlow"
              sublabel="Version 1.0.0"
              right={<Text style={styles.chevron}>›</Text>}
            />
          </LiquidGlassCard>

          {/* ── Permission denied banner ── */}
          {showDeniedBanner && <PermissionDeniedBanner />}

          {/* ── Danger zone ── */}
          <LiquidButton
            label="Clear All Data"
            variant="danger"
            size="md"
            style={styles.dangerBtn}
            onPress={() =>
              Alert.alert(
                'Clear all data?',
                'This will permanently delete all your moods, journal entries, and streak data.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear everything',
                    style: 'destructive',
                    onPress: () => {
                      useAppStore.setState({
                        moodEntries: [],
                        journalEntries: [],
                        meditationSessions: [],
                        currentStreak: 0,
                        longestStreak: 0,
                        lastActiveDate: null,
                        todayMood: null,
                      });
                    },
                  },
                ]
              )
            }
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, gap: Spacing.base },

  heroCard: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, overflow: 'hidden' },
  avatarWrapper: { position: 'relative' },
  avatarContainer: { width: 88, height: 88, borderRadius: 44, overflow: 'hidden', ...Shadow.glow },
  avatarGradient: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 44 },
  avatarHighlight: {
    position: 'absolute', top: 8, left: 14,
    width: 30, height: 18, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.background.primary,
  },
  editBadgeText: { fontSize: 12 },
  nameRow: { alignItems: 'center', gap: 2 },
  profileName: { ...Typography.h1, color: Colors.text.primary },
  editHint: { ...Typography.caption, color: Colors.text.tertiary },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  nameInput: {
    ...Typography.h2, color: Colors.text.primary,
    borderBottomWidth: 1, borderBottomColor: Colors.accent.secondary,
    minWidth: 140, textAlign: 'center',
  },
  nameSaveBtn: {
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full,
  },
  nameSaveBtnText: { ...Typography.bodySm, color: Colors.white, fontWeight: '600' },
  joinedText: { ...Typography.caption, color: Colors.text.tertiary },

  avatarPickerCard: { padding: Spacing.base, gap: Spacing.base },
  pickerTitle: { ...Typography.h3, color: Colors.text.primary },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pickerItem: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: Colors.glass.borderLight,
  },
  pickerItemSelected: {
    borderColor: Colors.accent.secondary, backgroundColor: 'rgba(124,95,244,0.2)',
  },
  pickerEmoji: { fontSize: 26 },

  sectionTitle: { ...Typography.h3, color: Colors.text.primary, paddingHorizontal: 2 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: {
    flex: 1, minWidth: '45%', borderRadius: Radius.lg, padding: Spacing.base,
    alignItems: 'center', gap: 4, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.glass.border,
  },
  statBorder: {
    ...StyleSheet.absoluteFillObject, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.glass.borderLight,
  },
  statEmoji: { fontSize: 24 },
  statValue: { ...Typography.h1, color: Colors.text.primary },
  statLabel: { ...Typography.caption, color: Colors.text.secondary, textAlign: 'center' },

  settingsCard: { overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, gap: Spacing.base },
  settingIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(124,95,244,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  settingIconHighlight: { backgroundColor: 'rgba(124,95,244,0.35)' },
  settingIconText: { fontSize: 18 },
  settingTextGroup: { flex: 1 },
  settingLabel: { ...Typography.body, color: Colors.text.primary, fontWeight: '500' },
  settingSublabel: { ...Typography.caption, color: Colors.text.secondary },
  settingRight: {},
  chevron: { ...Typography.h2, color: Colors.text.tertiary },
  divider: { height: 1, backgroundColor: Colors.glass.borderLight, marginLeft: 64 },

  timePickerWrapper: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  testNotifBtn: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    paddingVertical: 8,
    alignItems: 'center',
  },
  testNotifText: { ...Typography.bodySm, color: Colors.accent.secondary },

  dangerBtn: { marginTop: Spacing.sm },
});
