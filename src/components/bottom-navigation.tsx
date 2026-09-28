import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAccessibility } from '@/context/accessibility-context';

const tabs = [
  { label: 'Home', route: '/home' as const, icon: 'home' as const },
  { label: 'Info', route: '/configuracoes' as const, icon: 'info' as const },
  { label: 'Perfil', route: '/perfil' as const, icon: 'profile' as const },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { highContrast } = useAccessibility();
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [indicator] = useState(() => new Animated.Value(-48));
  const activeIndex = pathname === '/' || pathname === '/register'
    ? null
    : pathname === '/perfil'
      ? 2
      : pathname === '/configuracoes'
        ? 1
        : 0;
  const highlightIndex = hoveredIndex ?? activeIndex;
  const barColors = highContrast ? ['#101010', '#101010'] as const : ['#218F73', '#397BC2'] as const;

  useEffect(() => {
    if (barWidth === 0) return;
    const itemWidth = barWidth / tabs.length;
    const target = highlightIndex === null ? -48 : itemWidth * highlightIndex + (itemWidth - 34) / 2;
    Animated.spring(indicator, {
      toValue: target,
      speed: 24,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  }, [barWidth, highlightIndex, indicator]);

  return (
    <LinearGradient
      colors={barColors}
      onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.bar, { height: 48 + insets.bottom, paddingBottom: insets.bottom }]}>
      <Animated.View
        style={[
          styles.highlight,
          { backgroundColor: highContrast ? '#FFE66D' : '#FFFFFF' },
          { transform: [{ translateX: indicator }] },
        ]}
      />
      {tabs.map(({ label, route, icon }, index) => {
        const selected = activeIndex === index;
        const iconColor = highContrast && selected ? '#101010' : '#16333C';
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
            <TabIcon kind={icon} color={iconColor} />
          </Pressable>
        );
      })}
    </LinearGradient>
  );
}

function TabIcon({ kind, color }: { kind: 'home' | 'info' | 'profile'; color: string }) {
  if (kind === 'info') {
    return (
      <View style={[styles.infoCircle, { backgroundColor: color }]}>
        <Text style={styles.infoText}>i</Text>
      </View>
    );
  }

  if (kind === 'profile') {
    return (
      <View style={styles.profileIcon}>
        <View style={[styles.profileHead, { backgroundColor: color }]} />
        <View style={[styles.profileBody, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View style={styles.homeIcon}>
      <View style={[styles.roofLeft, { backgroundColor: color }]} />
      <View style={[styles.roofRight, { backgroundColor: color }]} />
      <View style={[styles.house, { borderColor: color }]} />
      <View style={[styles.houseDoor, { borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { width: '100%', flexDirection: 'row', position: 'relative', overflow: 'hidden' },
  highlight: { position: 'absolute', top: 7, left: 0, width: 34, height: 34, borderRadius: 17, pointerEvents: 'none' },
  tab: { flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  homeIcon: { width: 26, height: 26 },
  roofLeft: { position: 'absolute', left: 2, top: 8, width: 15, height: 3, borderRadius: 2, transform: [{ rotate: '-45deg' }] },
  roofRight: { position: 'absolute', left: 9, top: 8, width: 15, height: 3, borderRadius: 2, transform: [{ rotate: '45deg' }] },
  house: { position: 'absolute', left: 4, top: 11, width: 17, height: 12, borderWidth: 2, borderTopWidth: 0, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
  houseDoor: { position: 'absolute', left: 10, top: 16, width: 6, height: 7, borderWidth: 1.5, borderBottomWidth: 0, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  infoCircle: { width: 21, height: 21, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  infoText: { color: '#FFFFFF', fontSize: 15, lineHeight: 19, fontWeight: '800' },
  profileIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  profileHead: { width: 10, height: 10, borderRadius: 5 },
  profileBody: { width: 19, height: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
});