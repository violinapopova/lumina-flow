import React, { useEffect } from "react";
import { Text, View, ScrollView, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { GlassCardInset } from "@components/GlassCardInset";
import { LiquidGlassCard } from "@components/LiquidGlassCard";
import { MoodOrb } from "@components/MoodOrb";
import { StreakCounter } from "@components/StreakCounter";
import { AnimatedBackground } from "@components/AnimatedBackground";
import { useAppStore } from "@store/useAppStore";
import { MOOD_PICKER_OPTIONS, type MoodLevel } from "@/domain/mood";
import { genId } from "@utils/id";
import type { TabParamList, RootStackParamList } from "@navigation/types";
import { homeAnimatedLayout } from "./home.static";
import { homeTw } from "./home.tw";

const AFFIRMATIONS = [
  "You are exactly where you need to be. 🌿",
  "Every breath is a new beginning. ✨",
  "Your feelings are valid. Be gentle with yourself. 💙",
  "Progress, not perfection. You are growing. 🌱",
  "Today, choose peace over worry. 🕊️",
  "You have survived every difficult day so far. 💜",
  "Small steps still move you forward. 🌊",
];

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return "Good morning ☀️";
  if (hour >= 12 && hour < 17) return "Good afternoon 🌤️";
  return "Good evening 🌙";
}

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

const RippleHeroCard: React.FC<{ affirmation: string }> = ({ affirmation }) => {
  const ripple1 = useSharedValue(0);
  const ripple2 = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    textOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    const startRipple = () => {
      ripple1.value = 0;
      ripple1.value = withTiming(1, {
        duration: 2500,
        easing: Easing.out(Easing.cubic),
      });
      setTimeout(() => {
        ripple2.value = 0;
        ripple2.value = withTiming(1, {
          duration: 2500,
          easing: Easing.out(Easing.cubic),
        });
      }, 600);
    };

    startRipple();
    const interval = setInterval(startRipple, 4000);
    return () => clearInterval(interval);
  }, []);

  const ripple1Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ripple1.value, [0, 1], [0.6, 1.6]) }],
    opacity: interpolate(ripple1.value, [0, 0.3, 1], [0.5, 0.3, 0]),
  }));

  const ripple2Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ripple2.value, [0, 1], [0.6, 1.6]) }],
    opacity: interpolate(ripple2.value, [0, 0.3, 1], [0.4, 0.2, 0]),
  }));

  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  return (
    <LiquidGlassCard
      className={homeTw.heroCard}
      intensity="strong"
      borderGlow={false}
      animated
    >
      <View className={homeTw.rippleContainer} pointerEvents="none">
        <Animated.View style={[homeAnimatedLayout.rippleRing, ripple1Style]} />
        <Animated.View style={[homeAnimatedLayout.rippleRing, ripple2Style]} />
      </View>

      <Animated.View style={textStyle}>
        <View className={homeTw.heroTextBlock}>
          <Text className={homeTw.heroLabel}>DAILY AFFIRMATION</Text>
          <Text className={homeTw.heroText}>{affirmation}</Text>
          <Text className={homeTw.heroDate}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </Animated.View>
    </LiquidGlassCard>
  );
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const affirmation = AFFIRMATIONS[new Date().getDay() % AFFIRMATIONS.length];
  const addMoodEntry = useAppStore((s) => s.addMoodEntry);
  const todayMood = useAppStore((s) => s.todayMood);
  const currentStreak = useAppStore((s) => s.currentStreak);
  const longestStreak = useAppStore((s) => s.longestStreak);
  const checkAndUpdateStreak = useAppStore((s) => s.checkAndUpdateStreak);
  const avatarEmoji = useAppStore((s) => s.profile.avatarEmoji);

  useEffect(() => {
    checkAndUpdateStreak();
  }, []);

  const handleMoodSelect = (mood: MoodLevel) => {
    addMoodEntry({
      id: genId(),
      mood,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <View className={homeTw.screen}>
      <AnimatedBackground variant="home" />
      <SafeAreaView className={homeTw.safe} edges={["top"]}>
        <ScrollView
          className={homeTw.scroll}
          contentContainerClassName={homeTw.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View className={homeTw.header}>
            <View>
              <Text className={homeTw.greeting}>{getTimeGreeting()}</Text>
              <Text className={homeTw.headerSubtitle}>
                How are you flowing today?
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate("Main", { screen: "Profile" })}
              className={homeTw.avatarButton}
            >
              <BlurView intensity={30} tint="dark" className="absolute inset-0" />
              <Text className={homeTw.avatarEmoji}>{avatarEmoji}</Text>
            </Pressable>
          </View>

          <RippleHeroCard affirmation={affirmation} />

          <LiquidGlassCard className={homeTw.moodCard} intensity="light">
            <Text className={homeTw.sectionLabel}>How are you feeling?</Text>
            {todayMood && (
              <Text className={homeTw.moodSetLabel}>
                Today you felt {todayMood} ✓
              </Text>
            )}
            <View className={homeTw.moodRow}>
              {MOOD_PICKER_OPTIONS.map((opt, i) => (
                <MoodOrb
                  key={opt.mood}
                  mood={opt.mood}
                  emoji={opt.emoji}
                  label={opt.label}
                  selected={todayMood === opt.mood}
                  onSelect={handleMoodSelect}
                  delay={i * 100}
                />
              ))}
            </View>
          </LiquidGlassCard>

          <StreakCounter current={currentStreak} longest={longestStreak} />

          <LiquidGlassCard
            intensity="medium"
            onPress={() => navigation.navigate("Main", { screen: "Breathe" })}
            borderGlow
          >
            <GlassCardInset
              gradientColors={[
                "rgba(96,165,250,0.20)",
                "rgba(110,231,183,0.10)",
              ]}
            >
              <View className={homeTw.quickLaunchRow}>
                <View className={homeTw.quickLaunchText}>
                  <Text className={homeTw.quickLaunchTitle}>Take a breath 🌬️</Text>
                  <Text className={homeTw.quickLaunchSubtitle}>
                    4-7-8 breathing • 5 min
                  </Text>
                </View>
                <View className={homeTw.quickLaunchArrowBreathe}>
                  <Text className={homeTw.quickLaunchArrowIcon}>→</Text>
                </View>
              </View>
            </GlassCardInset>
          </LiquidGlassCard>

          <LiquidGlassCard
            intensity="light"
            onPress={() => navigation.navigate("Main", { screen: "Journal" })}
          >
            <GlassCardInset
              gradientColors={[
                "rgba(249,168,212,0.15)",
                "rgba(244,114,182,0.06)",
              ]}
            >
              <View className={homeTw.quickLaunchRow}>
                <View className={homeTw.quickLaunchText}>
                  <Text className={homeTw.quickLaunchTitle}>
                    Write in your journal 📖
                  </Text>
                  <Text className={homeTw.quickLaunchSubtitle}>
                    Capture today's moments
                  </Text>
                </View>
                <View className={homeTw.quickLaunchArrowJournal}>
                  <Text className={homeTw.quickLaunchArrowIconJournal}>→</Text>
                </View>
              </View>
            </GlassCardInset>
          </LiquidGlassCard>

          <View className={homeTw.scrollFooter} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
