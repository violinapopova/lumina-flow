import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LiquidGlassCard } from '@components/LiquidGlassCard';
import { LiquidButton } from '@components/LiquidButton';
import { AnimatedBackground } from '@components/AnimatedBackground';
import { Colors, Typography, Spacing, Radius } from '@theme';
import { useAppStore, genId, type JournalEntry } from '@store/useAppStore';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'JournalDetail'> & {
  navigation: any;
};

const JournalEntryCard: React.FC<{
  entry: JournalEntry;
  index: number;
  onPress: () => void;
}> = ({ entry, index, onPress }) => {
  const date = parseISO(entry.createdAt);
  const dateLabel = isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMM d, yyyy');

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <LiquidGlassCard
        style={styles.entryCard}
        intensity="light"
        onPress={onPress}
        ripple
      >
        <LinearGradient
          colors={['rgba(124,95,244,0.10)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
        />
        <View style={styles.entryHeader}>
          <Text style={styles.entryTitle} numberOfLines={1}>
            {entry.title || 'Untitled entry'}
          </Text>
          <Text style={styles.entryDate}>{dateLabel}</Text>
        </View>
        <Text style={styles.entryPreview} numberOfLines={2}>
          {entry.body || 'No content yet...'}
        </Text>
        <View style={styles.entryFooter}>
          <Text style={styles.entryTime}>{format(date, 'h:mm a')}</Text>
          <Text style={styles.entryWords}>
            {entry.body.split(' ').filter(Boolean).length} words
          </Text>
        </View>
      </LiquidGlassCard>
    </Animated.View>
  );
};

const NewEntryModal: React.FC<{
  onSave: (title: string, body: string) => void;
  onDismiss: () => void;
}> = ({ onSave, onDismiss }) => {
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

  const save = () => {
    if (!body.trim()) return;
    onSave(title.trim() || format(new Date(), 'MMMM d, yyyy'), body.trim());
    dismiss();
  };

  return (
    <View style={modalStyles.overlay}>
      <Pressable style={modalStyles.backdrop} onPress={dismiss} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={modalStyles.keyboardView}
      >
        <Animated.View style={[modalStyles.modal, modalStyle]}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(124,95,244,0.20)', 'rgba(90,60,220,0.08)']}
            style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
          />
          <View style={modalStyles.borderOverlay} />

          <View style={modalStyles.handle} />

          <Text style={modalStyles.modalTitle}>New Entry ✍️</Text>

          <TextInput
            style={modalStyles.titleInput}
            placeholder="Title (optional)"
            placeholderTextColor={Colors.text.tertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />

          <TextInput
            style={modalStyles.bodyInput}
            placeholder="What's on your mind today? Express freely..."
            placeholderTextColor={Colors.text.tertiary}
            value={body}
            onChangeText={setBody}
            multiline
            autoFocus
            textAlignVertical="top"
          />

          <View style={modalStyles.actions}>
            <LiquidButton label="Cancel" variant="ghost" size="md" onPress={dismiss} style={{ flex: 1 }} />
            <LiquidButton label="Save Entry" variant="primary" size="md" onPress={save} style={{ flex: 1 }} />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const modalStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  keyboardView: { justifyContent: 'flex-end' },
  modal: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.base,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.border,
    borderBottomWidth: 0,
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    borderBottomWidth: 0,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.glass.border,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: { ...Typography.h2, color: Colors.text.primary },
  titleInput: {
    ...Typography.h3,
    color: Colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
    paddingVertical: Spacing.sm,
  },
  bodyInput: {
    ...Typography.bodyLg,
    color: Colors.text.primary,
    minHeight: 140,
    maxHeight: 240,
    paddingVertical: Spacing.sm,
  },
  actions: { flexDirection: 'row', gap: Spacing.base },
});

export const JournalScreen: React.FC = () => {
  const { journalEntries, addJournalEntry } = useAppStore();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

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

  return (
    <View style={styles.container}>
      <AnimatedBackground variant="journal" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.pageTitle}>Journal</Text>
              <Text style={styles.pageSubtitle}>
                {journalEntries.length} {journalEntries.length === 1 ? 'entry' : 'entries'}
              </Text>
            </View>
            <Pressable
              style={styles.newBtn}
              onPress={() => setShowNewEntry(true)}
            >
              <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={[Colors.accent.primary, '#5B3FD9']}
                style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
              />
              <Text style={styles.newBtnText}>+ New</Text>
            </Pressable>
          </View>

          {/* Quote prompt */}
          <LiquidGlassCard style={styles.promptCard} intensity="light">
            <LinearGradient
              colors={['rgba(249,168,212,0.15)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
            />
            <Text style={styles.promptEmoji}>💭</Text>
            <Text style={styles.promptText}>
              "{format(new Date(), 'EEEE')} writing prompt: What made you smile today?"
            </Text>
          </LiquidGlassCard>

          {/* Entry list */}
          {journalEntries.length === 0 ? (
            <LiquidGlassCard style={styles.emptyCard} intensity="light">
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={styles.emptyTitle}>Your journal awaits</Text>
              <Text style={styles.emptySubtitle}>
                Tap "+ New" to write your first entry. No rules, just you.
              </Text>
              <LiquidButton
                label="Write your first entry"
                variant="secondary"
                size="md"
                onPress={() => setShowNewEntry(true)}
              />
            </LiquidGlassCard>
          ) : (
            <View style={styles.entriesList}>
              {journalEntries.map((entry, i) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  index={i}
                  onPress={() => setSelectedEntry(entry)}
                />
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
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
    <Animated.View style={[detailStyles.overlay, overlayStyle]}>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[Colors.background.primary, Colors.background.secondary]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={detailStyles.safeArea} edges={['top', 'bottom']}>
        <View style={detailStyles.header}>
          <Pressable onPress={close} style={detailStyles.closeBtn}>
            <Text style={detailStyles.closeBtnText}>✕ Close</Text>
          </Pressable>
          <Text style={detailStyles.meta}>
            {format(parseISO(entry.createdAt), 'MMMM d, yyyy · h:mm a')}
          </Text>
        </View>
        <ScrollView style={detailStyles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={detailStyles.title}>{entry.title}</Text>
          <Text style={detailStyles.body}>{entry.body}</Text>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
};

const detailStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 200 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  closeBtn: {},
  closeBtnText: { ...Typography.body, color: Colors.accent.secondary },
  meta: { ...Typography.caption, color: Colors.text.tertiary },
  scroll: { flex: 1, paddingHorizontal: Spacing.xl },
  title: { ...Typography.h1, color: Colors.text.primary, marginTop: Spacing.xl, marginBottom: Spacing.lg },
  body: { ...Typography.bodyLg, color: Colors.text.secondary, lineHeight: 30 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, gap: Spacing.base },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  pageTitle: { ...Typography.h1, color: Colors.text.primary },
  pageSubtitle: { ...Typography.body, color: Colors.text.secondary, marginTop: 2 },
  newBtn: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  newBtnText: { ...Typography.body, color: Colors.white, fontWeight: '600' },
  promptCard: { padding: Spacing.base, flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', overflow: 'hidden' },
  promptEmoji: { fontSize: 22, marginTop: 2 },
  promptText: { ...Typography.body, color: Colors.text.secondary, flex: 1, fontStyle: 'italic' },
  entriesList: { gap: Spacing.sm },
  entryCard: { padding: Spacing.base, overflow: 'hidden' },
  entryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  entryTitle: { ...Typography.h3, color: Colors.text.primary, flex: 1 },
  entryDate: { ...Typography.caption, color: Colors.accent.secondary },
  entryPreview: { ...Typography.body, color: Colors.text.secondary, lineHeight: 22 },
  entryFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  entryTime: { ...Typography.caption, color: Colors.text.tertiary },
  entryWords: { ...Typography.caption, color: Colors.text.tertiary },
  emptyCard: { padding: Spacing['3xl'], alignItems: 'center', gap: Spacing.base },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { ...Typography.h3, color: Colors.text.primary },
  emptySubtitle: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center' },
});
