import { theme } from '@/shared/theme';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AccessibleText as Text } from '@/features/accessibility/components/accessibility-text';
import { useAccessiblePalette } from '@/features/dashboard/components/mobile-shell';
import type { NearbyMapProps } from '@/features/maps/types/nearby-map.types';

export default function NearbyMap({ latitude, longitude, psychologists, primaryColor }: NearbyMapProps) {
  const palette = useAccessiblePalette();
  const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`;

  return (
    <View style={[styles.panel, { backgroundColor: palette.surface }]}>
      <Text style={[styles.title, { color: palette.text }]}>Mapa disponível no celular</Text>
      <Text style={[styles.copy, { color: palette.muted }]}>{psychologists.length} psicologo(s) encontrado(s) perto da sua localizacao.</Text>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL(mapUrl)} style={[styles.button, { backgroundColor: palette.background === theme.colors.highContrast.background ? theme.colors.highContrast.gradient : primaryColor }]}>
        <Text style={styles.buttonText}>Abrir mapa</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { flex: 1, padding: theme.spacing[16], justifyContent: 'center', alignItems: 'center', gap: theme.spacing[8] },
  title: { fontSize: theme.typography.fontSize[15], fontWeight: '700', textAlign: 'center' },
  copy: { fontSize: theme.typography.fontSize[12], textAlign: 'center' },
  button: { minHeight: theme.sizes[38], paddingHorizontal: theme.spacing[16], borderRadius: theme.radii[8], justifyContent: 'center' },
  buttonText: { color: theme.colors.white, fontSize: theme.typography.fontSize[13], fontWeight: '700' },
});
