import { useState } from 'react';
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

const projectDescription =
  'O site ConsAttentia é um projeto web de TCC feito para pessoas que possuem problemas com atenção como TDAH, algo que pode gerar dificuldades desnecessárias no dia a dia. O site tem como objetivo ajudar esse público oferecendo atividades que treinam e aperfeiçoam suas habilidades focadas e atenção, atividades essas que foram feitas baseando-se em conhecimentos e testes psicológicos. Seu progresso ao realizar as atividades pode ser registrado para ser apresentado a um profissional psicológico, se for da sua vontade. Além disso, o site possui um pequeno sistema de acessibilidade para abranger ainda mais pessoas que buscam esse tipo de auxilio.\n\nO projeto foi desenvolvido por alunos Giovani Leon, Saymon Palermo e Lucas Ricardo da escola Etec de Hortolândia do curso de Desenvolvimento de Sistemas Integrado ao Ensino Médio. O trabalho foi supervisionado pela professora Priscila Batista e Luzia Ivone, a Priscila foi responsável pela matéria de preparação do TCC e profissional em informática voltada a banco de dados, enquanto Luzia, uma psicóloga formada e especialista em neuropsicologia, se responsabilizou em ajudar nosso time com pesquisas sobre a area da psicologia, principalmente sobre atenção e outros assunto relacionados. O site foi feito utilizando react e typescript para o desenvolvimento do backend (parte interna do site), css para frontend (desing), google firebase para o desenvolvimento do banco de dados, git e github para o desenvolvimento e aplicação de versões novas do site.';
const collapsedDescriptionLength = 260;

export default function AboutScreen() {
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const previewEnd = projectDescription.lastIndexOf(' ', collapsedDescriptionLength);
  const visibleDescription = descriptionExpanded
    ? projectDescription
    : `${projectDescription.slice(0, previewEnd).trimEnd()}...`;

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
          <Text style={[styles.projectCopy, { color: palette.muted }]}>{visibleDescription}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: descriptionExpanded }}
            onPress={() => setDescriptionExpanded((expanded) => !expanded)}
            style={styles.readMoreButton}
          >
            <Text style={[styles.readMoreText, { color: palette.accent }]}>
              {descriptionExpanded ? 'Ler menos' : 'Ler mais'}
            </Text>
            <Text style={[styles.readMoreArrow, { color: palette.accent }]}>
              {descriptionExpanded ? '⌃' : '⌄'}
            </Text>
          </Pressable>
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
  readMoreButton: { alignSelf: 'flex-start', minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 2 },
  readMoreText: { fontSize: 12, fontWeight: '600' },
  readMoreArrow: { fontSize: 16, lineHeight: 18, fontWeight: '600' },
  backButton: { minHeight: 48, borderRadius: 8, overflow: 'hidden' },
  backGradient: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});