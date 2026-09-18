import { Colors, Radius, Shadow } from '@theme';
import type { ViewStyle } from 'react-native';

export const profileStatic = {
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    ...Shadow.glow,
  } satisfies ViewStyle,
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.border,
  } satisfies ViewStyle,
  statBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  } satisfies ViewStyle,
  bannerGradient: { borderRadius: Radius.md },
} as const;
