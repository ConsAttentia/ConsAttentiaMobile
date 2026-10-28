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

import { BottomNavigation } from '@/features/dashboard/components/bottom-navigation';
import { useAccessibility, type ColorMode } from '@/features/accessibility/context/accessibility-context';
import { theme } from '@/shared/theme';

const colorModes: Record<ColorMode, { primary: string; accent: string; danger: string }> = {
  standard: { primary: theme.colors.brand.green, accent: theme.colors.brand.blue, danger: theme.colors.danger },
  protanopia: theme.colors.colorVision.protanopia,
  deuteranopia: theme.colors.colorVision.deuteranopia,
  tritanopia: theme.colors.colorVision.tritanopia,
};

export function useAccessiblePalette() {
  const { colorMode, highContrast } = useAccessibility();
  const modeColors = colorModes[colorMode];
  return {
    background: highContrast ? theme.colors.highContrast.background : theme.colors.background,
    surface: highContrast ? theme.colors.highContrast.surface : theme.colors.surface,
    text: highContrast ? theme.colors.highContrast.text : theme.colors.text,
    muted: highContrast ? theme.colors.highContrast.muted : theme.colors.muted,
    primary: highContrast ? theme.colors.highContrast.primary : modeColors.primary,
    accent: highContrast ? theme.colors.highContrast.accent : modeColors.accent,
    danger: highContrast ? theme.colors.highContrast.danger : modeColors.danger,
    dangerBackground: highContrast
      ? theme.colors.highContrast.dangerBackground
      : colorMode === 'standard'
        ? theme.colors.dangerBackground
        : `${modeColors.danger}1A`,
    border: highContrast ? theme.colors.highContrast.border : theme.colors.border,
  };
}

export function getBrandGradientColors(palette: ReturnType<typeof useAccessiblePalette>) {
  return palette.background === theme.colors.highContrast.background
    ? [theme.colors.highContrast.gradient, theme.colors.highContrast.gradient] as const
    : palette.primary !== theme.colors.brand.green
      ? [palette.primary, palette.primary] as const
      : [theme.colors.brand.blue, theme.colors.brand.green] as const;
}

export interface MobileFrameProps {
  children: ReactNode;
  scroll?: boolean;
  compactContent?: boolean;
}

export function MobileFrame({
  children,
  scroll = true,
  compactContent = false,
}: MobileFrameProps) {
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
      <StatusBar style={palette.background === theme.colors.highContrast.background ? 'light' : 'dark'} />
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.header}>
        <Image
          accessibilityLabel="ConsAttentia"
          resizeMode="contain"
          source={require('../../../../assets/images/consattentia/logo-claro.png')}
          style={styles.logo}
        />
      </LinearGradient>
      {content}
      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    minHeight: theme.sizes[68],
    paddingHorizontal: theme.spacing[18],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: theme.radii[18],
    borderBottomRightRadius: theme.radii[18],
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  logo: { width: theme.sizes[180], height: theme.sizes[48] },
  content: { width: '100%', maxWidth: theme.layout.contentMaxWidth, alignSelf: 'center', flexGrow: 1, paddingHorizontal: theme.spacing[18], paddingTop: theme.spacing[18], paddingBottom: theme.spacing[28], gap: theme.spacing[16] },
  compactContent: { paddingTop: theme.spacing[0], paddingBottom: theme.spacing[16], gap: theme.spacing[12] },
  flexContent: { flex: 1 },
});
