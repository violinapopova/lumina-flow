import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeScreen } from '@screens/home/HomeScreen';
import { MoodTrackerScreen } from '@screens/mood/MoodTrackerScreen';
import { JournalScreen } from '@screens/journal/JournalScreen';
import { BreatheScreen } from '@screens/breathe/BreatheScreen';
import { ProfileScreen } from '@screens/profile/ProfileScreen';
import { Colors, Typography, Radius } from '@theme';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, string> = {
  Home:    '🏠',
  Mood:    '💭',
  Journal: '📖',
  Breathe: '🌬️',
  Profile: '🌸',
};

const TAB_LABELS: Record<keyof TabParamList, string> = {
  Home:    'Home',
  Mood:    'Moods',
  Journal: 'Journal',
  Breathe: 'Breathe',
  Profile: 'You',
};

const TabIcon: React.FC<{
  name: keyof TabParamList;
  focused: boolean;
}> = ({ name, focused }) => {
  const scale = useSharedValue(focused ? 1 : 0.9);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 0.9, { damping: 14, stiffness: 300 });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={tabStyles.iconWrapper}>
      {focused && <View style={tabStyles.activeIndicator} />}
      <Animated.Text style={[tabStyles.emoji, iconStyle]}>
        {TAB_ICONS[name]}
      </Animated.Text>
      <Text
        style={[
          tabStyles.label,
          focused ? tabStyles.labelActive : tabStyles.labelInactive,
        ]}
      >
        {TAB_LABELS[name]}
      </Text>
    </View>
  );
};

const tabStyles = StyleSheet.create({
  iconWrapper: { alignItems: 'center', gap: 3, paddingTop: 12, width: 50 },
  emoji: { fontSize: 22 },
  label: { ...Typography.caption, fontSize: 10 },
  labelActive: { color: Colors.accent.secondary, fontWeight: '600' },
  labelInactive: { color: Colors.text.tertiary },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent.secondary,
  },
});

export const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: {
        position: 'absolute',
        borderTopWidth: 0,
        backgroundColor: 'transparent',
        elevation: 0,
        height: Platform.OS === 'ios' ? 84 : 68,
      },
      tabBarBackground: () => (
        <View style={StyleSheet.absoluteFill}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(30,20,60,0.85)', 'rgba(13,10,30,0.95)']}
            style={StyleSheet.absoluteFill}
          />
          {/* Top border shimmer */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: Colors.glass.border,
            }}
          />
        </View>
      ),
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen as any}
      options={{ tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} /> }} />
    <Tab.Screen name="Mood" component={MoodTrackerScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon name="Mood" focused={focused} /> }} />
    <Tab.Screen name="Journal" component={JournalScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon name="Journal" focused={focused} /> }} />
    <Tab.Screen name="Breathe" component={BreatheScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon name="Breathe" focused={focused} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} /> }} />
  </Tab.Navigator>
);
