import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { MobileFrame, useAccessiblePalette } from '@/components/mobile-shell';

export default function ExplicacaoScreen() {
  const palette = useAccessiblePalette();

  return (
    <MobileFrame>
      <View style={[styles.artPanel, { backgroundColor: palette.primary }]}>
        <Image
          accessibilityLabel="Ilustração sobre habilidades cognitivas"
          resizeMode="contain"
          source={require('../../assets/images/consattentia/fundoc.png')}
          style={styles.art}
        />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.kicker, { color: palette.primary }]}>EXPERIMENTO 01</Text>
        <Text style={[styles.title, { color: palette.text }]}>TOHE</Text>
        <Text style={[styles.subtitle, { color: palette.text }]}>Teste de Organização de Histórias Emocionais</Text>
        <Text style={[styles.body, { color: palette.muted }]}>
          Nesta atividade demonstrativa, observe quatro cenas e coloque-as na ordem que forma uma sequência coerente. A tarefa trabalha observação visual, atenção aos detalhes e organização de acontecimentos.
        </Text>
        <View style={[styles.note, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.noteTitle, { color: palette.text }]}>Antes de começar</Text>
          <Text style={[styles.noteText, { color: palette.muted }]}>
            Esta atividade é apenas um exercício educativo e não fornece diagnóstico ou avaliação psicológica.
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/tohe')} style={[styles.startButton, { backgroundColor: palette.primary }]}>
          <Text style={styles.startButtonText}>Iniciar atividade</Text>
        </Pressable>
      </View>
    </MobileFrame>
  );
}

const styles = StyleSheet.create({
  artPanel: { minHeight: 190, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  art: { width: '100%', height: 190 },
  copy: { gap: 11 },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 30, fontWeight: '800' },
  subtitle: { marginTop: -8, fontSize: 15, lineHeight: 21, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 22 },
  note: { marginTop: 4, padding: 14, borderWidth: 1, borderRadius: 8, gap: 5 },
  noteTitle: { fontSize: 13, fontWeight: '700' },
  noteText: { fontSize: 12, lineHeight: 18 },
  startButton: { minHeight: 50, marginTop: 4, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  startButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
