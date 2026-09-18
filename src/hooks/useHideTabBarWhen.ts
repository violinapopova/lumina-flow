import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TAB_BAR_HIDDEN_STYLE, TAB_BAR_STYLE } from '@navigation/tabBarStyle';
import type { TabParamList } from '@navigation/types';

/** Hides the bottom tab bar while `visible` is true (e.g. modals / full-screen overlays). */
export function useHideTabBarWhen(visible: boolean): void {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: visible ? TAB_BAR_HIDDEN_STYLE : TAB_BAR_STYLE,
    });
    return () => {
      navigation.setOptions({ tabBarStyle: TAB_BAR_STYLE });
    };
  }, [visible, navigation]);
}
