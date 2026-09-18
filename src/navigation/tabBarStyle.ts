import { Platform } from 'react-native';

export const TAB_BAR_STYLE = {
  position: 'absolute' as const,
  borderTopWidth: 0,
  backgroundColor: 'transparent',
  elevation: 0,
  height: Platform.OS === 'ios' ? 84 : 68,
};

export const TAB_BAR_HIDDEN_STYLE = {
  display: 'none' as const,
};
