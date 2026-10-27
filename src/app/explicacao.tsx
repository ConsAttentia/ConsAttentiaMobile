import { theme } from '@/shared/theme';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AccessibleText as Text } from '@/features/accessibility/components/accessibility-text';
import { LinearGradient } from 'expo-linear-gradient';

import { getBrandGradientColors, MobileFrame, useAccessiblePalette } from '@/features/dashboard/components/mobile-shell';

export default function ExplicacaoScreen() {
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);

  return (
    <MobileFrame>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.artPanel}>
        <Image
          accessibilityLabel="Ilustração sobre habilidades cognitivas"
          resizeMode="contain"
          source={require('../../assets/images/consattentia/fundoc.png')}
          style={styles.art}
        />
      </LinearGradient>
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
        <Pressable accessibilityRole="button" onPress={() => router.push('/tohe')} style={styles.startButton}>
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.startGradient}>
            <Text style={styles.startButtonText}>Iniciar atividade</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </MobileFrame>
  );
}

const styles = StyleSheet.create({
  artPanel: { minHeight: theme.sizes[190], borderRadius: theme.radii[10], overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  art: { width: '100%', height: theme.sizes[190] },
  copy: { gap: theme.spacing[11] },
  kicker: { fontSize: theme.typography.fontSize[10], fontWeight: '800', letterSpacing: theme.sizes[1] },
  title: { fontSize: theme.typography.fontSize[30], fontWeight: '800' },
  subtitle: { marginTop: -theme.spacing[8], fontSize: theme.typography.fontSize[15], lineHeight: theme.typography.lineHeight[21], fontWeight: '600' },
  body: { fontSize: theme.typography.fontSize[14], lineHeight: theme.typography.lineHeight[22] },
  note: { marginTop: theme.spacing[4], padding: theme.spacing[14], borderWidth: theme.sizes[1], borderRadius: theme.radii[8], gap: theme.spacing[5] },
  noteTitle: { fontSize: theme.typography.fontSize[13], fontWeight: '700' },
  noteText: { fontSize: theme.typography.fontSize[12], lineHeight: theme.typography.lineHeight[18] },
  startButton: { minHeight: theme.sizes[50], marginTop: theme.spacing[4], borderRadius: theme.radii[8], overflow: 'hidden' },
  startGradient: { minHeight: theme.sizes[50], alignItems: 'center', justifyContent: 'center' },
  startButtonText: { color: theme.colors.white, fontSize: theme.typography.fontSize[16], fontWeight: '700' },
});
