import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '@screens/onboarding/OnboardingScreen';
import { TabNavigator } from './TabNavigator';
import { useAppStore } from '@store/useAppStore';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={hasOnboarded ? 'Main' : 'Onboarding'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
          animationDuration: 350,
          // Full-screen gesture for liquid transitions
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            animation: 'fade_from_bottom',
            animationDuration: 500,
          }}
        />
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{
            animation: 'fade',
            animationDuration: 400,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
