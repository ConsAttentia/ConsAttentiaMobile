import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { NearbyMapProps } from './nearby-map.types';

export default function NearbyMap({ latitude, longitude, psychologists, primaryColor }: NearbyMapProps) {
  const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`;

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Mapa disponível no celular</Text>
      <Text style={styles.copy}>{psychologists.length} psicologo(s) encontrado(s) perto da sua localizacao.</Text>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL(mapUrl)} style={[styles.button, { backgroundColor: primaryColor }]}>
        <Text style={styles.buttonText}>Abrir mapa</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#DDE8E8', gap: 8 },
  title: { color: '#203129', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  copy: { color: '#687A72', fontSize: 12, textAlign: 'center' },
  button: { minHeight: 38, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
