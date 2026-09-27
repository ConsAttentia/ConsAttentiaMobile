import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { getBrandGradientColors, MobileFrame, useAccessiblePalette } from '@/components/mobile-shell';

const members = [
  {
    name: 'Giovani Leon de Melo',
    role: 'Designer',
    image: require('../../assets/images/consattentia/giovanni.jpg'),
  },
  {
    name: 'Lucas Ricardo do Nascimento',
    role: 'Pesquisa e conteúdo',
    image: require('../../assets/images/consattentia/lucasserio.jpg'),
  },
  {
    name: 'Saymon Palermo Martins',
    role: 'Programador e desenvolvedor',
    image: require('../../assets/images/consattentia/eu.jpg'),
  },
];

export default function AboutScreen() {
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);

  return (
    <MobileFrame>
      <View style={styles.content}>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.hero}>
          <Text style={styles.eyebrow}>CONSATTENTIA</Text>
          <Text style={styles.title}>Integrantes e projeto</Text>
          <Text style={styles.subtitle}>Conheça as pessoas que desenvolveram esta iniciativa.</Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Nossa equipe</Text>
          {members.map((member) => (
            <View key={member.name} style={[styles.member, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Image accessibilityLabel={`Foto de ${member.name}`} source={member.image} style={styles.avatar} />
              <View style={styles.memberCopy}>
                <Text style={[styles.memberName, { color: palette.text }]}>{member.name}</Text>
                <Text style={[styles.memberRole, { color: palette.accent }]}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Sobre o projeto</Text>
          <Text style={[styles.projectCopy, { color: palette.muted }]}>
            O ConsAttentia reúne atividades educativas de atenção e organização de histórias. O TOHE é uma atividade demonstrativa e não substitui avaliação profissional.
          </Text>
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.replace('/home')} style={styles.backButton}>
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.backGradient}>
            <Text style={styles.backText}>Voltar à página inicial</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </MobileFrame>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20 },
  hero: { gap: 7, marginHorizontal: -20, marginTop: -22, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 24 },
  eyebrow: { color: '#E3F3F2', fontSize: 10, fontWeight: '800' },
  title: { color: '#FFFFFF', fontSize: 25, lineHeight: 31, fontWeight: '700' },
  subtitle: { color: '#E3F3F2', fontSize: 13, lineHeight: 19 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  member: { minHeight: 82, borderWidth: 1, borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 54, height: 54, borderRadius: 8, backgroundColor: '#C7D2D3' },
  memberCopy: { flex: 1, gap: 4 },
  memberName: { fontSize: 14, lineHeight: 19, fontWeight: '700' },
  memberRole: { fontSize: 12, lineHeight: 17, fontWeight: '600' },
  projectCopy: { fontSize: 13, lineHeight: 20 },
  backButton: { minHeight: 48, borderRadius: 8, overflow: 'hidden' },
  backGradient: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});