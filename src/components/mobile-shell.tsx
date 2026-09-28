import type { ReactNode } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { BottomNavigation } from '@/components/bottom-navigation';
import { useAccessibility, type ColorMode } from '@/context/accessibility-context';

const colorModes: Record<ColorMode, { primary: string; accent: string; danger: string }> = {
  standard: { primary: '#176E55', accent: '#3F87BD', danger: '#A13434' },
  protanopia: { primary: '#0072B2', accent: '#E69F00', danger: '#D55E00' },
  deuteranopia: { primary: '#3B5B92', accent: '#D55E00', danger: '#B84A00' },
  tritanopia: { primary: '#A23B72', accent: '#007A5E', danger: '#A23B72' },
};

export function useAccessiblePalette() {
  const { colorMode, highContrast, widerLetters } = useAccessibility();
  const modeColors = colorModes[colorMode];
  return {
    background: highContrast ? '#000000' : '#EDF2F1',
    surface: highContrast ? '#101010' : '#FFFFFF',
    text: highContrast ? '#FFFFFF' : '#203129',
    muted: highContrast ? '#E2E2E2' : '#687A72',
    primary: highContrast ? '#FFE66D' : modeColors.primary,
    accent: highContrast ? '#77DDFF' : modeColors.accent,
    danger: highContrast ? '#FF8A80' : modeColors.danger,
    dangerBackground: highContrast ? '#2A1414' : colorMode === 'standard' ? '#FCE9E7' : `${modeColors.danger}1A`,
    border: highContrast ? '#FFFFFF' : '#D8E4E1',
    wideLetters: widerLetters ? 1.1 : 0,
  };
}

export function getBrandGradientColors(palette: ReturnType<typeof useAccessiblePalette>) {
  return palette.background === '#000000' || palette.primary !== '#176E55'
    ? [palette.primary, palette.primary] as const
    : ['#3F87BD', '#176E55'] as const;
}

export function MobileFrame({
  children,
  scroll = true,
  compactContent = false,
}: {
  children: ReactNode;
  scroll?: boolean;
  compactContent?: boolean;
}) {
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);
  const content = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, compactContent && styles.compactContent]} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, compactContent && styles.compactContent, styles.flexContent]}>{children}</View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <StatusBar style={palette.background === '#000000' ? 'light' : 'light'} />
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.header}>
        <Image
          accessibilityLabel="ConsAttentia"
          resizeMode="contain"
          source={require('../../assets/images/consattentia/logo-claro.png')}
          style={styles.logo}
        />
      </LinearGradient>
      {content}
      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    minHeight: 72,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: { width: 230, height: 62 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 36, gap: 20 },
  compactContent: { paddingTop: 0, paddingBottom: 16, gap: 12 },
  flexContent: { flex: 1 },
});
