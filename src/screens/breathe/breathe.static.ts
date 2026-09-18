import { Radius } from '@theme';
import type { ViewStyle } from 'react-native';

export const breatheStatic = {
  patternCardWrap: { width: '100%', alignSelf: 'stretch' } satisfies ViewStyle,
  doneGradient: { borderRadius: Radius.lg },
  detailGradient: { borderRadius: Radius.md },
  startBtnGradient: { borderRadius: 22 },
} as const;
