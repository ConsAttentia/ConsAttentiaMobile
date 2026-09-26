import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { MobileFrame, useAccessiblePalette } from '@/components/mobile-shell';

const experiments = [
  {
    title: 'TOHE',
    image: require('../../assets/images/consattentia/pose.png'),
    description: 'Organize as cenas e forme uma história em sequência.',
    available: true,
  },
  {
    title: 'Em breve',
    image: require('../../assets/images/consattentia/fita.png'),
    description: 'Novos experimentos de atenção poderão ser adicionados futuramente.',
    available: false,
  },
];

export default function SelecaoScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const palette = useAccessiblePalette();
  const experiment = experiments[activeIndex];

  function changeExperiment(direction: -1 | 1) {
    setActiveIndex((current) => (current + direction + experiments.length) % experiments.length);
  }

  return (
    <MobileFrame>
      <View style={styles.heading}>
        <Text style={[styles.kicker, { color: palette.primary }]}>ESCOLHA UMA ATIVIDADE</Text>
        <Text style={[styles.title, { color: palette.text }]}>Experimentos</Text>
      </View>
      <View style={[styles.carousel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <View style={styles.carouselControls}>
          <Pressable accessibilityRole="button" accessibilityLabel="Experimento anterior" onPress={() => changeExperiment(-1)} style={[styles.arrow, { backgroundColor: palette.primary }]}>
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
          <View style={styles.counter}>
            <Text style={[styles.counterText, { color: palette.muted }]}>{activeIndex + 1} / {experiments.length}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Próximo experimento" onPress={() => changeExperiment(1)} style={[styles.arrow, { backgroundColor: palette.primary }]}>
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>
        <Image accessibilityLabel={experiment.title} resizeMode="contain" source={experiment.image} style={styles.experimentImage} />
        <Text style={[styles.experimentTitle, { color: palette.text }]}>{experiment.title}</Text>
        <Text style={[styles.description, { color: palette.muted }]}>{experiment.description}</Text>
        {experiment.available ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/explicacao')} style={[styles.openButton, { backgroundColor: palette.primary }]}>
            <Text style={styles.openButtonText}>Conhecer o TOHE</Text>
          </Pressable>
        ) : (
          <View style={[styles.comingSoon, { borderColor: palette.border }]}>
            <Text style={[styles.comingSoonText, { color: palette.muted }]}>Disponível em breve</Text>
          </View>
        )}
      </View>
      <View style={styles.pagination}>
        {experiments.map((item, index) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Mostrar ${item.title}`}
            key={item.title}
            onPress={() => setActiveIndex(index)}
            style={[styles.paginationDot, { backgroundColor: activeIndex === index ? palette.primary : palette.border }]}
          />
        ))}
      </View>
    </MobileFrame>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 5 },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 27, lineHeight: 33, fontWeight: '700' },
  carousel: { borderWidth: 1, borderRadius: 10, padding: 16 },
  carouselControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#FFFFFF', fontSize: 34, lineHeight: 38, fontWeight: '400' },
  counter: { flex: 1, alignItems: 'center' },
  counterText: { fontSize: 12, fontWeight: '700' },
  experimentImage: { width: '100%', height: 250, marginTop: 10, borderRadius: 8 },
  experimentTitle: { marginTop: 14, fontSize: 23, fontWeight: '700', textAlign: 'center' },
  description: { marginTop: 8, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  openButton: { minHeight: 48, marginTop: 18, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  openButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  comingSoon: { minHeight: 48, marginTop: 18, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  comingSoonText: { fontSize: 14, fontWeight: '600' },
  pagination: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  paginationDot: { width: 10, height: 10, borderRadius: 5 },
});
