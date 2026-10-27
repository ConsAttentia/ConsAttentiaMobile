import { theme } from '@/shared/theme';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AccessibleText as Text } from '@/features/accessibility/components/accessibility-text';
import { LinearGradient } from 'expo-linear-gradient';

import { getBrandGradientColors, MobileFrame, useAccessiblePalette } from '@/features/dashboard/components/mobile-shell';

export interface UtilityPageProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function UtilityPage({
  eyebrow,
  title,
  description,
  children,
}: UtilityPageProps) {
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);

  return (
    <MobileFrame>
      <View style={styles.content}>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.hero}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </LinearGradient>
        {children}
      </View>
    </MobileFrame>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.spacing[18] },
  hero: { marginHorizontal: -theme.spacing[20], marginTop: -theme.spacing[22], paddingHorizontal: theme.spacing[22], paddingTop: theme.spacing[24], paddingBottom: theme.spacing[22], gap: theme.spacing[6] },
  eyebrow: { color: theme.colors.whiteTint, fontSize: theme.typography.fontSize[10], fontWeight: '800' },
  title: { color: theme.colors.white, fontSize: theme.typography.fontSize[25], lineHeight: theme.typography.lineHeight[31], fontWeight: '700' },
  description: { color: theme.colors.whiteTint, fontSize: theme.typography.fontSize[13], lineHeight: theme.typography.lineHeight[19] },
});