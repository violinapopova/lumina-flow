import React, { useMemo, useCallback } from 'react';
import {
  Text,
  View,
  FlatList,
  type ListRenderItemInfo,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO, isToday, subDays } from 'date-fns';
import { formatRecentDayLabel } from '@utils/date';
import { GlassCardInset } from '@components/GlassCardInset';
import { LiquidGlassCard } from '@components/LiquidGlassCard';
import { AnimatedBackground } from '@components/AnimatedBackground';
import { Spacing } from '@theme';
import { useAppStore } from '@store/useAppStore';
import type { MoodEntry } from '@/domain/models';
import { MOOD_CATALOG, type MoodLevel } from '@/domain/mood';
import { moodTw } from './mood.tw';
import { moodChartStatic } from './mood.static';

const { width: W } = Dimensions.get('window');

function moodChartValue(level: MoodLevel): number {
  return MOOD_CATALOG[level].chartValue;
}

const MoodChart: React.FC<{ entries: MoodEntry[] }> = ({ entries }) => {
  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = entries.find((e) => e.createdAt.startsWith(dateStr));
      return {
        date,
        label: format(date, 'EEE'),
        value: entry ? moodChartValue(entry.mood) : 0,
        mood: entry?.mood ?? null,
      };
    });
    return days;
  }, [entries]);

  const CHART_H = 100;
  const BAR_W = (W - Spacing.base * 2 - Spacing.xl * 2) / 7 - 6;

  return (
    <View className={moodTw.chartContainer}>
      <Text className={moodTw.chartTitle}>Last 7 Days</Text>
      <View className={moodTw.chartRow}>
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

  const meta = day.mood ? MOOD_CATALOG[day.mood] : null;
  const today = isToday(day.date);

  return (
    <View className={moodTw.barWrapper} style={{ width: barWidth }}>
      <View className={moodTw.barTrack} style={{ height: chartHeight }}>
        <Animated.View className={moodTw.barFill} style={barStyle}>
          {meta && (
            <LinearGradient
              colors={meta.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={moodChartStatic.barEmptyFill}
            />
          )}
          {!meta && <View style={moodChartStatic.barEmptyBg} />}
          {meta && <View className={moodTw.barShimmer} />}
        </Animated.View>
      </View>
      <Text className={today ? moodTw.dayLabelToday : moodTw.dayLabel}>
        {today ? 'Now' : day.label}
      </Text>
      {meta && <Text className={moodTw.barEmoji}>{meta.emoji}</Text>}
    </View>
  );
};

const LOG_LIST_MAX = 20;

const MoodEntryCard = React.memo(function MoodEntryCard({
  entry,
  index,
}: {
  entry: MoodEntry;
  index: number;
}) {
  const meta = MOOD_CATALOG[entry.mood];
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
  const dateLabel = formatRecentDayLabel(date);
  const timeLabel = format(date, 'h:mm a');

  return (
    <Animated.View style={style}>
      <LiquidGlassCard className={moodTw.entryCard} intensity="light">
        <GlassCardInset gradientColors={[`${meta.color}20`, 'transparent']}>
          <View className={moodTw.entryRow}>
            <View
              className={moodTw.moodBadge}
              style={{ backgroundColor: `${meta.color}25` }}
            >
              <Text className={moodTw.moodBadgeEmoji}>{meta.emoji}</Text>
            </View>
            <View className={moodTw.entryText}>
              <Text className={moodTw.moodLabel}>{meta.label}</Text>
              {entry.note && (
                <Text className={moodTw.moodNote} numberOfLines={1}>
                  {entry.note}
                </Text>
              )}
            </View>
            <View className={moodTw.entryMeta}>
              <Text className={moodTw.entryDate}>{dateLabel}</Text>
              <Text className={moodTw.entryTime}>{timeLabel}</Text>
            </View>
          </View>
        </GlassCardInset>
      </LiquidGlassCard>
    </Animated.View>
  );
});

export const MoodTrackerScreen: React.FC = () => {
  const moodEntries = useAppStore((s) => s.moodEntries);

  const logEntries = useMemo(
    () => moodEntries.slice(0, LOG_LIST_MAX),
    [moodEntries],
  );

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

  const renderLogItem = useCallback(
    ({ item, index }: ListRenderItemInfo<MoodEntry>) => (
      <MoodEntryCard entry={item} index={index} />
    ),
    [],
  );

  const listHeader = useMemo(
    () => (
      <View className={moodTw.listHeader}>
        <View className={moodTw.pageHeader}>
          <Text className={moodTw.pageTitle}>Mood Tracker</Text>
          <Text className={moodTw.pageSubtitle}>
            {moodEntries.length} check-ins logged
          </Text>
        </View>

        <LiquidGlassCard className={moodTw.chartCard} intensity="medium">
          <MoodChart entries={moodEntries} />
        </LiquidGlassCard>

        {moodEntries.length > 0 && (
          <LiquidGlassCard className={moodTw.summaryCard} intensity="light">
            <Text className={moodTw.sectionLabel}>Mood Distribution</Text>
            <View className={moodTw.pillsRow}>
              {(Object.entries(moodCounts) as [MoodLevel, number][])
                .sort(([, a], [, b]) => b - a)
                .map(([mood, count]) => {
                  const meta = MOOD_CATALOG[mood];
                  return (
                    <View
                      key={mood}
                      className={moodTw.pill}
                      style={{
                        backgroundColor: `${meta.color}22`,
                        borderColor: `${meta.color}44`,
                      }}
                    >
                      <Text className={moodTw.pillEmoji}>{meta.emoji}</Text>
                      <Text
                        className={moodTw.pillLabel}
                        style={{ color: meta.color }}
                      >
                        {count}x
                      </Text>
                    </View>
                  );
                })}
            </View>
            {dominantMood && (
              <Text className={moodTw.insightText}>
                You most often feel {MOOD_CATALOG[dominantMood].label.toLowerCase()}{' '}
                {MOOD_CATALOG[dominantMood].emoji}
              </Text>
            )}
          </LiquidGlassCard>
        )}

        <View className={moodTw.sectionHeader}>
          <Text className={moodTw.sectionTitle}>Check-in Log</Text>
        </View>

        {moodEntries.length === 0 && (
          <LiquidGlassCard className={moodTw.emptyCard} intensity="light">
            <Text className={moodTw.emptyEmoji}>🌸</Text>
            <Text className={moodTw.emptyTitle}>No check-ins yet</Text>
            <Text className={moodTw.emptySubtitle}>
              Head to the Home tab and log your first mood of the day.
            </Text>
          </LiquidGlassCard>
        )}
      </View>
    ),
    [moodEntries, moodCounts, dominantMood],
  );

  return (
    <View className={moodTw.screen}>
      <AnimatedBackground variant="mood" />
      <SafeAreaView className={moodTw.safe} edges={['top']}>
        <FlatList
          className={moodTw.list}
          data={logEntries}
          keyExtractor={(item) => item.id}
          renderItem={renderLogItem}
          ListHeaderComponent={listHeader}
          contentContainerClassName={moodTw.scrollContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={LogSeparator}
          ListFooterComponent={ListFooterSpacer}
        />
      </SafeAreaView>
    </View>
  );
};

const LogSeparator = () => <View className={moodTw.logSeparator} />;

const ListFooterSpacer = () => <View className={moodTw.listFooter} />;
