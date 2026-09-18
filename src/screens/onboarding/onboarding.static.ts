import { Dimensions } from 'react-native';
import { Radius, Spacing } from '@theme';
import type { TextStyle, ViewStyle } from 'react-native';

const { width: W } = Dimensions.get('window');

export const onboardingStatic = {
  slide: {
    width: W,
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  } satisfies ViewStyle,
  slideGradient: { borderRadius: Radius.lg },
  emoji: {
    fontSize: 72,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  } satisfies TextStyle,
};
