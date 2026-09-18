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
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
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
import { Colors } from '@theme';
import { profileTw } from './profile.tw';
import { profileStatic } from './profile.static';
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
  <Pressable onPress={onPress} className={profileTw.settingRow}>
    <View className={`${profileTw.settingIcon}${highlight ? ` ${profileTw.settingIconHighlight}` : ''}`}>
      <Text className={profileTw.settingIconText}>{icon}</Text>
    </View>
    <View className={profileTw.settingTextGroup}>
      <Text className={profileTw.settingLabel}>{label}</Text>
      {sublabel !== undefined && (
        <Text className={profileTw.settingSublabel}>{sublabel}</Text>
      )}
    </View>
    {right !== undefined && <View>{right}</View>}
  </Pressable>
);

const StatCard: React.FC<{
  value: string | number;
  label: string;
  emoji: string;
  delay: number;
}> = ({ value, label, emoji, delay }) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={profileStatic.statCard}>
    <BlurView intensity={30} tint="dark" className="absolute inset-0" />
    <LinearGradient
      colors={['rgba(124,95,244,0.15)', 'rgba(90,60,220,0.06)']}
      style={StyleSheet.absoluteFill}
    />
    <View style={profileStatic.statBorder} />
    <Text className={profileTw.statEmoji}>{emoji}</Text>
    <Text className={profileTw.statValue}>{value}</Text>
    <Text className={profileTw.statLabel}>{label}</Text>
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
    <Animated.View entering={FadeIn.duration(300)} className={profileTw.timeContainer}>
      <BlurView intensity={40} tint="dark" className="absolute inset-0" />
      <LinearGradient
        colors={['rgba(124,95,244,0.18)', 'rgba(90,60,220,0.08)']}
        style={StyleSheet.absoluteFill}
      />
      <View className={profileTw.timeBorder} />

      <Text className={profileTw.timeHeading}>Set reminder time</Text>

      <View className={profileTw.timePickerRow}>
        <View className={profileTw.timeColumn}>
          <Pressable onPress={() => nudge('h', 1)} className={profileTw.timeArrow} hitSlop={8}>
            <Text className={profileTw.timeArrowText}>▲</Text>
          </Pressable>
          <View className={profileTw.timeValueBox}>
            <Text className={profileTw.timeValueText}>{hourLabel}</Text>
          </View>
          <Pressable onPress={() => nudge('h', -1)} className={profileTw.timeArrow} hitSlop={8}>
            <Text className={profileTw.timeArrowText}>▼</Text>
          </Pressable>
        </View>

        <Text className={profileTw.timeColon}>:</Text>

        <View className={profileTw.timeColumn}>
          <Pressable onPress={() => nudge('m', 1)} className={profileTw.timeArrow} hitSlop={8}>
            <Text className={profileTw.timeArrowText}>▲</Text>
          </Pressable>
          <View className={profileTw.timeValueBox}>
            <Text className={profileTw.timeValueText}>{minLabel}</Text>
          </View>
          <Pressable onPress={() => nudge('m', -1)} className={profileTw.timeArrow} hitSlop={8}>
            <Text className={profileTw.timeArrowText}>▼</Text>
          </Pressable>
        </View>

        <View className={profileTw.timePeriodColumn}>
          <Pressable
            onPress={() => nudge('h', h < 12 ? 12 : -12)}
            className={`${profileTw.timePeriodBtn}${h < 12 ? ` ${profileTw.timePeriodBtnActive}` : ''}`}
          >
            <Text className={`${profileTw.timePeriodText}${h < 12 ? ` ${profileTw.timePeriodTextActive}` : ''}`}>AM</Text>
          </Pressable>
          <Pressable
            onPress={() => nudge('h', h >= 12 ? -12 : 12)}
            className={`${profileTw.timePeriodBtn}${h >= 12 ? ` ${profileTw.timePeriodBtnActive}` : ''}`}
          >
            <Text className={`${profileTw.timePeriodText}${h >= 12 ? ` ${profileTw.timePeriodTextActive}` : ''}`}>PM</Text>
          </Pressable>
        </View>
      </View>

      <Text className={profileTw.timeHint}>Tap ▲ ▼ to adjust · minutes snap to 5-min intervals</Text>
    </Animated.View>
  );
};

// ─── Permission denied banner ─────────────────────────────────────────────────

const PermissionDeniedBanner: React.FC = () => (
  <Animated.View entering={FadeIn.duration(300)}>
    <LiquidGlassCard className={profileTw.bannerCard} intensity="light">
      <LinearGradient
        colors={['rgba(239,68,68,0.18)', 'rgba(239,68,68,0.06)']}
        style={[StyleSheet.absoluteFill, profileStatic.bannerGradient]}
      />
      <Text className={profileTw.bannerIcon}>🔕</Text>
      <View className={profileTw.bannerText}>
        <Text className={profileTw.bannerTitle}>Notifications blocked</Text>
        <Text className={profileTw.bannerBody}>
          Enable them in your device Settings to receive daily mindfulness reminders.
        </Text>
      </View>
      <Pressable
        onPress={() => Linking.openSettings()}
        className={profileTw.bannerBtn}
      >
        <Text className={profileTw.bannerBtnText}>Open Settings</Text>
      </Pressable>
    </LiquidGlassCard>
  </Animated.View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

export const ProfileScreen: React.FC = () => {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const moodEntries = useAppStore((s) => s.moodEntries);
  const journalEntries = useAppStore((s) => s.journalEntries);
  const meditationSessions = useAppStore((s) => s.meditationSessions);
  const currentStreak = useAppStore((s) => s.currentStreak);

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
    <View className={profileTw.screen}>
      <AnimatedBackground variant="home" />
      <SafeAreaView className={profileTw.safe} edges={['top']}>
        <ScrollView
          className={profileTw.scroll}
          contentContainerClassName={profileTw.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Profile Hero ── */}
          <LiquidGlassCard className={profileTw.heroCard} intensity="strong" borderGlow={false}>
            <Pressable onPress={handleAvatarPress} className={profileTw.avatarWrapper}>
              <Animated.View style={[profileStatic.avatarContainer, avatarStyle]}>
                <LinearGradient
                  colors={[Colors.accent.primary, '#5B3FD9', Colors.orbs.lavender]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className={profileTw.avatarGradient}
                >
                  <Text className={profileTw.avatarEmoji}>{profile.avatarEmoji}</Text>
                </LinearGradient>
              </Animated.View>
              <View className={profileTw.editBadge}>
                <Text className={profileTw.editBadgeText}>✏️</Text>
              </View>
            </Pressable>

            {editingName ? (
              <View className={profileTw.nameEditRow}>
                <TextInput
                  className={profileTw.nameInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                  onSubmitEditing={handleNameSave}
                  returnKeyType="done"
                />
                <Pressable onPress={handleNameSave} className={profileTw.nameSaveBtn}>
                  <Text className={profileTw.nameSaveBtnText}>Save</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setEditingName(true)} className={profileTw.nameRow}>
                <Text className={profileTw.profileName}>{profile.name}</Text>
                <Text className={profileTw.editHint}>Tap to edit</Text>
              </Pressable>
            )}

            <Text className={profileTw.joinedText}>
              Member since {format(parseISO(profile.joinedAt), 'MMMM yyyy')}
            </Text>
          </LiquidGlassCard>

          {/* ── Avatar picker ── */}
          {showAvatarPicker && (
            <LiquidGlassCard className={profileTw.avatarPickerCard} intensity="medium">
              <Text className={profileTw.pickerTitle}>Choose your avatar</Text>
              <View className={profileTw.pickerGrid}>
                {AVATAR_EMOJIS.map((emoji) => (
                  <Pressable
                    key={emoji}
                    className={`${profileTw.pickerItem}${emoji === profile.avatarEmoji ? ` ${profileTw.pickerItemSelected}` : ''}`}
                    onPress={() => {
                      updateProfile({ avatarEmoji: emoji });
                      setShowAvatarPicker(false);
                    }}
                  >
                    <Text className={profileTw.pickerEmoji}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </LiquidGlassCard>
          )}

          {/* ── Stats ── */}
          <Text className={profileTw.sectionTitle}>Your Journey</Text>
          <View className={profileTw.statsGrid}>
            <StatCard value={currentStreak} label="Day Streak" emoji="🔥" delay={0} />
            <StatCard value={moodEntries.length} label="Check-ins" emoji="💭" delay={80} />
            <StatCard value={journalEntries.length} label="Entries" emoji="📖" delay={160} />
            <StatCard value={`${totalMeditationMinutes}m`} label="Breathed" emoji="🌬️" delay={240} />
          </View>

          {/* ── Settings ── */}
          <Text className={profileTw.sectionTitle}>Settings</Text>
          <LiquidGlassCard className={profileTw.settingsCard} intensity="light">
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

            <View className={profileTw.divider} />

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
                <View className={profileTw.timePickerWrapper}>
                  <TimePicker
                    value={profile.reminderTime}
                    onChange={handleTimeChange}
                  />
                </View>
                <Pressable
                  className={profileTw.testNotifBtn}
                  onPress={() => sendTestNotification(profile.name)}
                >
                  <Text className={profileTw.testNotifText}>Send test notification →</Text>
                </Pressable>
              </>
            )}

            <View className={profileTw.divider} />
            <SettingRow
              icon="📊"
              label="Data & Privacy"
              sublabel="All data stored locally on device"
              right={<Text className={profileTw.chevron}>›</Text>}
            />
            <View className={profileTw.divider} />
            <SettingRow
              icon="ℹ️"
              label="About LuminaFlow"
              sublabel="Version 1.0.0"
              right={<Text className={profileTw.chevron}>›</Text>}
            />
          </LiquidGlassCard>

          {/* ── Permission denied banner ── */}
          {showDeniedBanner && <PermissionDeniedBanner />}

          {/* ── Danger zone ── */}
          <View className={profileTw.dangerBtn}>
          <LiquidButton
            label="Clear All Data"
            variant="danger"
            size="md"
            style={{ width: '100%' }}
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
                      useAppStore.getState().clearAllUserData();
                    },
                  },
                ]
              )
            }
          />
          </View>

          <View className={profileTw.scrollFooter} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
