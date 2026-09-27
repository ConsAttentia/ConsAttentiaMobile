import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { getBrandGradientColors, MobileFrame, useAccessiblePalette } from '@/components/mobile-shell';

export function UtilityPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
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
  content: { gap: 18 },
  hero: { marginHorizontal: -20, marginTop: -22, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 22, gap: 6 },
  eyebrow: { color: '#E3F3F2', fontSize: 10, fontWeight: '800' },
  title: { color: '#FFFFFF', fontSize: 25, lineHeight: 31, fontWeight: '700' },
  description: { color: '#E3F3F2', fontSize: 13, lineHeight: 19 },
});