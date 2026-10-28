import { theme } from '@/shared/theme';
import { router, usePathname } from 'expo-router';
import { useEffect, useState, type ComponentProps } from 'react';
import { Animated, Platform, Pressable, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAccessibility } from '@/features/accessibility/context/accessibility-context';
import { useAccessiblePalette } from '@/features/dashboard/components/mobile-shell';

interface TabDefinition {
  label: string;
  route: '/home' | '/configuracoes' | '/perfil';
  symbol: ComponentProps<typeof SymbolView>['name'];
}

const tabs = [
  { label: 'Home', route: '/home', symbol: { ios: 'house.fill', android: 'home', web: 'home' } },
  { label: 'Info', route: '/configuracoes', symbol: { ios: 'info.circle.fill', android: 'info', web: 'info' } },
  { label: 'Perfil', route: '/perfil', symbol: { ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' } },
] satisfies readonly TabDefinition[];

export function BottomNavigation() {
  const pathname = usePathname();
  const { highContrast, shouldReduceMotion } = useAccessibility();
  const palette = useAccessiblePalette();
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [indicator] = useState(() => new Animated.Value(-theme.sizes[48]));
  const activeIndex = pathname === '/' || pathname === '/register'
    ? null
    : pathname === '/perfil'
      ? 2
      : pathname === '/configuracoes'
        ? 1
        : 0;
  const highlightIndex = hoveredIndex ?? activeIndex;
  const barColors = highContrast
    ? [theme.colors.highContrast.gradient, theme.colors.highContrast.gradient] as const
    : [palette.primary, palette.accent] as const;

  useEffect(() => {
    if (barWidth === 0) return;
    const itemWidth = barWidth / tabs.length;
    const target = highlightIndex === null
      ? -theme.sizes[48]
      : itemWidth * highlightIndex + (itemWidth - theme.sizes[34]) / 2;
    if (shouldReduceMotion) {
      indicator.setValue(target);
      return;
    }

    Animated.spring(indicator, {
      toValue: target,
      speed: 24,
      bounciness: 6,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [barWidth, highlightIndex, indicator, shouldReduceMotion]);

  return (
    <LinearGradient
      colors={barColors}
      onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.bar, { height: theme.sizes[48] + insets.bottom, paddingBottom: insets.bottom }]}>
      <Animated.View
        style={[
          styles.highlight,
          { backgroundColor: highContrast ? theme.colors.highContrast.primary : theme.colors.white },
          { transform: [{ translateX: indicator }] },
        ]}
      />
      {tabs.map(({ label, route, symbol }, index) => {
        const selected = activeIndex === index;
        const iconColor = highContrast
          ? (selected ? theme.colors.black : theme.colors.white)
          : (selected ? palette.primary : theme.colors.navy);
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={label === 'Info' ? 'Informações e configurações' : label}
            accessibilityState={{ selected }}
            key={route}
            onHoverIn={() => setHoveredIndex(index)}
            onHoverOut={() => setHoveredIndex((current) => current === index ? null : current)}
            onPress={() => router.replace(route)}
            style={styles.tab}>
            <SymbolView name={symbol} size={theme.sizes[24]} tintColor={iconColor} />
          </Pressable>
        );
      })}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: theme.radii[18],
    borderTopRightRadius: theme.radii[18],
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  highlight: { position: 'absolute', top: theme.spacing[7], left: theme.spacing[0], width: theme.sizes[34], height: theme.sizes[34], borderRadius: theme.radii[17], pointerEvents: 'none' },
  tab: { flex: 1, height: theme.sizes[48], alignItems: 'center', justifyContent: 'center', zIndex: 1 },
});