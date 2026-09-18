import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  type ListRenderItemInfo,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHideTabBarWhen } from '@hooks/useHideTabBarWhen';
import { format, parseISO } from 'date-fns';
import { formatRecentDayLabel } from '@utils/date';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GlassCardInset } from '@components/GlassCardInset';
import { LiquidGlassCard } from '@components/LiquidGlassCard';
import { LiquidButton } from '@components/LiquidButton';
import { AnimatedBackground } from '@components/AnimatedBackground';
import { Colors, Spacing } from '@theme';
import { journalTw } from './journal.tw';
import { journalGradientLayers } from './journal.static';
import { useAppStore } from '@store/useAppStore';
import type { JournalEntry } from '@/domain/models';
import { genId } from '@utils/id';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'JournalDetail'> & {
  navigation: any;
};

const JournalEntryCard = React.memo(function JournalEntryCard({
  entry,
  index,
  onPress,
}: {
  entry: JournalEntry;
  index: number;
  onPress: () => void;
}) {
  const date = parseISO(entry.createdAt);
  const dateLabel = formatRecentDayLabel(date, 'MMM d, yyyy');

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <LiquidGlassCard
        className={journalTw.entryCard}
        intensity="light"
        onPress={onPress}
        ripple
      >
        <GlassCardInset
          gradientColors={['rgba(124,95,244,0.10)', 'transparent']}
        >
          <View className={journalTw.entryHeader}>
            <Text className={journalTw.entryTitle} numberOfLines={1}>
              {entry.title || 'Untitled entry'}
            </Text>
            <Text className={journalTw.entryDate}>{dateLabel}</Text>
          </View>
          <Text className={journalTw.entryPreview} numberOfLines={2}>
            {entry.body || 'No content yet...'}
          </Text>
          <View className={journalTw.entryFooter}>
            <Text className={journalTw.entryTime}>{format(date, 'h:mm a')}</Text>
            <Text className={journalTw.entryWords}>
              {entry.body.split(' ').filter(Boolean).length} words
            </Text>
          </View>
        </GlassCardInset>
      </LiquidGlassCard>
    </Animated.View>
  );
});

const NewEntryModal: React.FC<{
  onSave: (title: string, body: string) => void;
  onDismiss: () => void;
}> = ({ onSave, onDismiss }) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const translateY = useSharedValue(200);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withSpring(0, { damping: 22, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const dismiss = () => {
    translateY.value = withSpring(300, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(0, { duration: 250 });
    setTimeout(onDismiss, 280);
  };

  const trimmedBody = body.trim();
  const trimmedTitle = title.trim();
  const canSave = trimmedBody.length > 0 || trimmedTitle.length > 0;

  const save = () => {
    if (!canSave) return;
    Keyboard.dismiss();
    const entryTitle = trimmedTitle || format(new Date(), 'MMMM d, yyyy');
    const entryBody = trimmedBody || trimmedTitle;
    onSave(entryTitle, entryBody);
    dismiss();
  };

  return (
    <View className={journalTw.modalOverlay}>
      <Pressable className={journalTw.modalBackdrop} onPress={dismiss} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className={journalTw.modalKeyboard}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <Animated.View className={journalTw.modalSheet} style={modalStyle}>
          <BlurView
            intensity={60}
            tint="dark"
            className="absolute inset-0"
            pointerEvents="none"
          />
          <LinearGradient
            colors={['rgba(124,95,244,0.20)', 'rgba(90,60,220,0.08)']}
            style={[StyleSheet.absoluteFill, journalGradientLayers.modalGradient]}
            pointerEvents="none"
          />
          <View className={journalTw.modalBorderOverlay} pointerEvents="none" />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerClassName={journalTw.modalScroll}
            contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.lg }}
          >
            <View className={journalTw.modalHandle} />

            <Text className={journalTw.modalTitle}>New Entry ✍️</Text>

            <TextInput
              className={journalTw.titleInput}
              placeholder="Title (optional)"
              placeholderTextColor={Colors.text.tertiary}
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              returnKeyType="next"
            />

            <TextInput
              className={journalTw.bodyInput}
              placeholder="What's on your mind today? Express freely..."
              placeholderTextColor={Colors.text.tertiary}
              value={body}
              onChangeText={setBody}
              multiline
              autoFocus
              textAlignVertical="top"
            />

            {!canSave && (
              <Text className={journalTw.saveHint}>Add a title or a few words to save.</Text>
            )}

            <View className={journalTw.modalActions}>
              <View className={journalTw.modalActionBtn}>
                <LiquidButton
                  label="Cancel"
                  variant="ghost"
                  size="md"
                  onPress={dismiss}
                  style={{ width: '100%' }}
                />
              </View>
              <View className={journalTw.modalActionBtn}>
                <LiquidButton
                  label="Save Entry"
                  variant="primary"
                  size="md"
                  onPress={save}
                  disabled={!canSave}
                  style={{ width: '100%' }}
                />
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

export const JournalScreen: React.FC = () => {
  const journalEntries = useAppStore((s) => s.journalEntries);
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useHideTabBarWhen(showNewEntry || selectedEntry != null);

  const handleSave = (title: string, body: string) => {
    const now = new Date().toISOString();
    addJournalEntry({
      id: genId(),
      title,
      body,
      createdAt: now,
      updatedAt: now,
    });
  };

  const openNewEntry = useCallback(() => setShowNewEntry(true), []);

  const renderEntry = useCallback(
    ({ item, index }: ListRenderItemInfo<JournalEntry>) => (
      <JournalEntryCard
        entry={item}
        index={index}
        onPress={() => setSelectedEntry(item)}
      />
    ),
    [],
  );

  const listHeader = useMemo(
    () => (
      <View className={journalTw.listHeader}>
        <View className={journalTw.header}>
          <View>
            <Text className={journalTw.pageTitle}>Journal</Text>
            <Text className={journalTw.pageSubtitle}>
              {journalEntries.length}{' '}
              {journalEntries.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
          <Pressable className={journalTw.newBtn} onPress={openNewEntry}>
            <BlurView intensity={30} tint="dark" className="absolute inset-0" />
            <LinearGradient
              colors={[Colors.accent.primary, '#5B3FD9']}
              style={[StyleSheet.absoluteFill, journalGradientLayers.newBtnGradient]}
            />
            <Text className={journalTw.newBtnText}>+ New</Text>
          </Pressable>
        </View>

        <LiquidGlassCard className={journalTw.promptCard} intensity="light">
          <GlassCardInset gradientColors={['rgba(249,168,212,0.15)', 'transparent']}>
            <View className={journalTw.promptRow}>
              <Text className={journalTw.promptEmoji}>💭</Text>
              <Text className={journalTw.promptText}>
                "{format(new Date(), 'EEEE')} writing prompt: What made you smile today?"
              </Text>
            </View>
          </GlassCardInset>
        </LiquidGlassCard>

        {journalEntries.length === 0 && (
          <LiquidGlassCard className={journalTw.emptyCard} intensity="light">
            <GlassCardInset gradientColors={['rgba(124,95,244,0.12)', 'transparent']}>
              <View className={journalTw.emptyCardContent}>
              <Text className={journalTw.emptyEmoji}>📖</Text>
              <Text className={journalTw.emptyTitle}>Your journal awaits</Text>
              <Text className={journalTw.emptySubtitle}>
                Tap "+ New" to write your first entry. No rules, just you.
              </Text>
              <View className={journalTw.emptyCta}>
                <LiquidButton
                  label="Write your first entry"
                  variant="secondary"
                  size="md"
                  onPress={openNewEntry}
                  style={{ width: '100%' }}
                />
              </View>
              </View>
            </GlassCardInset>
          </LiquidGlassCard>
        )}
      </View>
    ),
    [journalEntries.length, openNewEntry],
  );

  return (
    <View className={journalTw.screen}>
      <AnimatedBackground variant="journal" />
      <SafeAreaView className={journalTw.safe} edges={['top']}>
        <FlatList
          className={journalTw.list}
          data={journalEntries}
          keyExtractor={(item) => item.id}
          renderItem={renderEntry}
          ListHeaderComponent={listHeader}
          contentContainerClassName={journalTw.scrollContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={JournalEntrySeparator}
          ListFooterComponent={JournalListFooter}
        />
      </SafeAreaView>

      {/* Journal Detail Overlay */}
      {selectedEntry && (
        <JournalDetailOverlay
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      {/* New Entry Modal */}
      {showNewEntry && (
        <NewEntryModal
          onSave={handleSave}
          onDismiss={() => setShowNewEntry(false)}
        />
      )}
    </View>
  );
};

const JournalEntrySeparator = () => <View className={journalTw.entrySeparator} />;

const JournalListFooter = () => <View className={journalTw.listFooter} />;

const JournalDetailOverlay: React.FC<{
  entry: JournalEntry;
  onClose: () => void;
}> = ({ entry, onClose }) => {
  const translateY = useSharedValue(60);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withSpring(0, { damping: 22, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const close = () => {
    translateY.value = withSpring(60, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(0, { duration: 250 });
    setTimeout(onClose, 270);
  };

  return (
    <Animated.View className={journalTw.detailOverlay} style={overlayStyle}>
      <BlurView intensity={60} tint="dark" className="absolute inset-0" />
      <LinearGradient
        colors={[Colors.background.primary, Colors.background.secondary]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView className={journalTw.detailSafe} edges={['top', 'bottom']}>
        <View className={journalTw.detailHeader}>
          <Pressable onPress={close}>
            <Text className={journalTw.detailCloseText}>✕ Close</Text>
          </Pressable>
          <Text className={journalTw.detailMeta}>
            {format(parseISO(entry.createdAt), 'MMMM d, yyyy · h:mm a')}
          </Text>
        </View>
        <ScrollView className={journalTw.detailScroll} showsVerticalScrollIndicator={false}>
          <Text className={journalTw.detailTitle}>{entry.title}</Text>
          <Text className={journalTw.detailBody}>{entry.body}</Text>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
};
