import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO, isToday, isYesterday, subDays } from 'date-fns';
import { LiquidGlassCard } from '@components/LiquidGlassCard';
import { AnimatedBackground } from '@components/AnimatedBackground';
import { Colors, Typography, Spacing, Radius } from '@theme';
import { useAppStore, type MoodEntry, type MoodLevel } from '@store/useAppStore';

const { width: W } = Dimensions.get('window');

const MOOD_META: Record<MoodLevel, { emoji: string; label: string; color: string; grad: [string, string] }> = {
  rad:   { emoji: '🤩', label: 'Rad',   color: Colors.mood.rad,   grad: ['#F472B6','#EC4899'] },
  good:  { emoji: '😊', label: 'Good',  color: Colors.mood.good,  grad: ['#34D399','#10B981'] },
  meh:   { emoji: '😐', label: 'Meh',   color: Colors.mood.meh,   grad: ['#FBBF24','#F59E0B'] },
  bad:   { emoji: '😔', label: 'Bad',   color: Colors.mood.bad,   grad: ['#60A5FA','#3B82F6'] },
  awful: { emoji: '😢', label: 'Awful', color: Colors.mood.awful, grad: ['#F87171','#EF4444'] },
};

const MOOD_VALUE: Record<MoodLevel, number> = { rad: 5, good: 4, meh: 3, bad: 2, awful: 1 };

// Simple custom chart using Reanimated
const MoodChart: React.FC<{ entries: MoodEntry[] }> = ({ entries }) => {
  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = entries.find((e) => e.createdAt.startsWith(dateStr));
      return {
        date,
        label: format(date, 'EEE'),
        value: entry ? MOOD_VALUE[entry.mood] : 0,
        mood: entry?.mood ?? null,
      };
    });
    return days;
  }, [entries]);

  const CHART_H = 100;
  const BAR_W = (W - Spacing.base * 2 - Spacing.xl * 2) / 7 - 6;

  return (
    <View style={chartStyles.container}>
      <Text style={chartStyles.title}>Last 7 Days</Text>
      <View style={chartStyles.chart}>
        {last7.map((day, i) => (
          <MoodBar
            key={i}
            day={day}
            barWidth={BAR_W}
            chartHeight={CHART_H}
            delay={i * 80}
          />
        ))}
      </View>
    </View>
  );
};

const MoodBar: React.FC<{
  day: { date: Date; label: string; value: number; mood: MoodLevel | null };
  barWidth: number;
  chartHeight: number;
  delay: number;
}> = ({ day, barWidth, chartHeight, delay }) => {
  const fillHeight = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fillHeight.value = withSpring(day.value / 5, { damping: 14, stiffness: 80 });
    }, delay);
    return () => clearTimeout(timer);
  }, [day.value, delay]);

  const barStyle = useAnimatedStyle(() => ({
    height: `${fillHeight.value * 100}%` as `${number}%`,
  }));

  const meta = day.mood ? MOOD_META[day.mood] : null;
  const today = isToday(day.date);

  return (
    <View style={[chartStyles.barWrapper, { width: barWidth }]}>
      <View style={[chartStyles.barTrack, { height: chartHeight }]}>
        <Animated.View style={[chartStyles.barFill, barStyle]}>
          {meta && (
            <LinearGradient
              colors={meta.grad}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}
          {!meta && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />}
          {/* Liquid shimmer top */}
          {meta && <View style={chartStyles.barShimmer} />}
        </Animated.View>
      </View>
      <Text style={[chartStyles.dayLabel, today && chartStyles.todayLabel]}>
        {today ? 'Now' : day.label}
      </Text>
      {meta && <Text style={{ fontSize: 14, textAlign: 'center' }}>{meta.emoji}</Text>}
    </View>
  );
};

const chartStyles = StyleSheet.create({
  container: { gap: Spacing.base },
  title: { ...Typography.label, color: Colors.text.secondary },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingBottom: 4 },
  barWrapper: { alignItems: 'center', gap: 4 },
  barTrack: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  barShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 3,
  },
  dayLabel: { ...Typography.caption, color: Colors.text.tertiary },
  todayLabel: { color: Colors.accent.secondary },
});

// Mood Entry Card
const MoodEntryCard: React.FC<{ entry: MoodEntry; index: number }> = ({ entry, index }) => {
  const meta = MOOD_META[entry.mood];
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { damping: 16, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 300 });
    }, index * 60);
    return () => clearTimeout(timer);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const date = parseISO(entry.createdAt);
  const dateLabel = isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMM d');
  const timeLabel = format(date, 'h:mm a');

  return (
    <Animated.View style={style}>
      <LiquidGlassCard style={styles.entryCard} intensity="light">
        <LinearGradient
          colors={[`${meta.color}20`, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
        />
        <View style={styles.entryRow}>
          <View style={[styles.moodBadge, { backgroundColor: `${meta.color}25` }]}>
            <Text style={styles.moodBadgeEmoji}>{meta.emoji}</Text>
          </View>
          <View style={styles.entryText}>
            <Text style={styles.moodLabel}>{meta.label}</Text>
            {entry.note && <Text style={styles.moodNote} numberOfLines={1}>{entry.note}</Text>}
          </View>
          <View style={styles.entryMeta}>
            <Text style={styles.entryDate}>{dateLabel}</Text>
            <Text style={styles.entryTime}>{timeLabel}</Text>
          </View>
        </View>
      </LiquidGlassCard>
    </Animated.View>
  );
};

export const MoodTrackerScreen: React.FC = () => {
  const moodEntries = useAppStore((s) => s.moodEntries);

  const moodCounts = useMemo(() => {
    const counts: Partial<Record<MoodLevel, number>> = {};
    moodEntries.forEach((e) => {
      counts[e.mood] = (counts[e.mood] ?? 0) + 1;
    });
    return counts;
  }, [moodEntries]);

  const dominantMood = useMemo(() => {
    const sorted = Object.entries(moodCounts).sort(([, a], [, b]) => b - a);
    return sorted[0]?.[0] as MoodLevel | undefined;
  }, [moodCounts]);

  return (
    <View style={styles.container}>
      <AnimatedBackground variant="mood" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Mood Tracker</Text>
            <Text style={styles.pageSubtitle}>{moodEntries.length} check-ins logged</Text>
          </View>

          {/* Chart Card */}
          <LiquidGlassCard style={styles.chartCard} intensity="medium">
            <MoodChart entries={moodEntries} />
          </LiquidGlassCard>

          {/* Summary pills */}
          {moodEntries.length > 0 && (
            <LiquidGlassCard style={styles.summaryCard} intensity="light">
              <Text style={styles.sectionLabel}>Mood Distribution</Text>
              <View style={styles.pillsRow}>
                {(Object.entries(moodCounts) as [MoodLevel, number][])
                  .sort(([, a], [, b]) => b - a)
                  .map(([mood, count]) => {
                    const meta = MOOD_META[mood];
                    return (
                      <View
                        key={mood}
                        style={[styles.pill, { backgroundColor: `${meta.color}22`, borderColor: `${meta.color}44` }]}
                      >
                        <Text style={styles.pillEmoji}>{meta.emoji}</Text>
                        <Text style={[styles.pillLabel, { color: meta.color }]}>
                          {count}x
                        </Text>
                      </View>
                    );
                  })}
              </View>
              {dominantMood && (
                <Text style={styles.insightText}>
                  You most often feel {MOOD_META[dominantMood].label.toLowerCase()} {MOOD_META[dominantMood].emoji}
                </Text>
              )}
            </LiquidGlassCard>
          )}

          {/* Entry Log */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Check-in Log</Text>
          </View>

          {moodEntries.length === 0 ? (
            <LiquidGlassCard style={styles.emptyCard} intensity="light">
              <Text style={styles.emptyEmoji}>🌸</Text>
              <Text style={styles.emptyTitle}>No check-ins yet</Text>
              <Text style={styles.emptySubtitle}>
                Head to the Home tab and log your first mood of the day.
              </Text>
            </LiquidGlassCard>
          ) : (
            <View style={styles.entryList}>
              {moodEntries.slice(0, 20).map((entry, i) => (
                <MoodEntryCard key={entry.id} entry={entry} index={i} />
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, gap: Spacing.base },
  pageHeader: { paddingVertical: Spacing.sm },
  pageTitle: { ...Typography.h1, color: Colors.text.primary },
  pageSubtitle: { ...Typography.body, color: Colors.text.secondary, marginTop: 2 },
  chartCard: { padding: Spacing.base },
  summaryCard: { padding: Spacing.base, gap: Spacing.base },
  sectionLabel: { ...Typography.label, color: Colors.text.secondary },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pillEmoji: { fontSize: 16 },
  pillLabel: { ...Typography.bodySm, fontWeight: '600' },
  insightText: { ...Typography.body, color: Colors.text.secondary },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...Typography.h3, color: Colors.text.primary },
  entryList: { gap: Spacing.sm },
  entryCard: { padding: Spacing.base, overflow: 'hidden' },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  moodBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBadgeEmoji: { fontSize: 26 },
  entryText: { flex: 1 },
  moodLabel: { ...Typography.h3, color: Colors.text.primary },
  moodNote: { ...Typography.caption, color: Colors.text.secondary },
  entryMeta: { alignItems: 'flex-end' },
  entryDate: { ...Typography.bodySm, color: Colors.text.secondary },
  entryTime: { ...Typography.caption, color: Colors.text.tertiary },
  emptyCard: { padding: Spacing['2xl'], alignItems: 'center', gap: Spacing.base },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...Typography.h3, color: Colors.text.primary },
  emptySubtitle: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center' },
});
