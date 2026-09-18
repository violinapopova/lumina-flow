import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Radius, Spacing } from '@theme';

interface GlassCardInsetProps {
  children: React.ReactNode;
  gradientColors: readonly [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Tinted inner region for `LiquidGlassCard` — full width, shared across screens. */
export const GlassCardInset: React.FC<GlassCardInsetProps> = ({
  children,
  gradientColors,
  style,
  contentStyle,
}) => (
  <View style={[styles.inner, style]}>
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, { borderRadius: Radius.md }]}
    />
    <View style={[styles.content, contentStyle]}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  inner: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: Radius.md,
  },
  content: {
    padding: Spacing.base,
    width: '100%',
  },
});
