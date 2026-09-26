import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MobileFrame, useAccessiblePalette } from '@/components/mobile-shell';
import { getAuthErrorMessage, getUserName, signOutUser } from '@/lib/auth';
import { auth } from '@/lib/firebase';

const benefits = [
  {
    number: '01',
    label: 'ROTINA',
    title: 'Atenção no cotidiano',
    text: 'Práticas para exercitar o foco e apoiar organização, memória e realização de tarefas.',
  },
  {
    number: '02',
    label: 'ACESSO',
    title: 'Acesso para todos',
    text: 'Atividades curtas e acessíveis, pensadas para diferentes ritmos e necessidades.',
  },
  {
    number: '03',
    label: 'EVOLUÇÃO',
    title: 'Desenvolvimento contínuo',
    text: 'Uma proposta de prática consistente para estimular habilidades cognitivas.',
  },
];

const team = [
  { name: 'Lucas', role: 'Pesquisa e conteúdo', image: require('../../assets/images/consattentia/lucasserio.jpg') },
  { name: 'Saymon', role: 'Desenvolvimento', image: require('../../assets/images/consattentia/eu.jpg') },
  { name: 'Giovani', role: 'Design e acessibilidade', image: require('../../assets/images/consattentia/giovanni.jpg') },
];

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [aboutOpen, setAboutOpen] = useState(false);
  const palette = useAccessiblePalette();

  useEffect(() => {
    if (!auth) {
      router.replace('/');
      return;
    }

    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) router.replace('/');
    });
  }, []);

  async function handleSignOut() {
    try {
      await signOutUser();
      router.replace('/');
    } catch (error) {
      Alert.alert('Não foi possível sair', getAuthErrorMessage(error));
    }
  }

  return (
    <MobileFrame onLogout={handleSignOut}>
      {loading ? <ActivityIndicator color={palette.primary} size="large" /> : null}
      <View style={[styles.hero, { backgroundColor: palette.primary }]}>
        <Text style={[styles.heroKicker, { letterSpacing: palette.wideLetters + 0.8 }]}>FOCO QUE ACOMPANHA VOCÊ</Text>
        <Text style={[styles.welcome, { letterSpacing: palette.wideLetters }]}>Bem-vindo{user ? `, ${getUserName(user)}` : ''}.</Text>
        <Text style={[styles.heroCopy, { letterSpacing: palette.wideLetters }]}>Exercite a atenção com atividades interativas e estruturadas.</Text>
        <Image
          accessibilityLabel="Pessoa participando de uma atividade de atenção"
          resizeMode="contain"
          source={require('../../assets/images/consattentia/personagem.png')}
          style={styles.heroImage}
        />
        <Pressable accessibilityRole="button" onPress={() => router.push('/selecao')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Iniciar experimento</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.kicker, { color: palette.primary }]}>A PROPOSTA</Text>
        <Text style={[styles.sectionTitle, { color: palette.text, letterSpacing: palette.wideLetters }]}>Conheça o ConsAttentia</Text>
      </View>

      {benefits.map((benefit) => (
        <View key={benefit.number} style={[styles.benefitRow, { borderColor: palette.border }]}>
          <View style={[styles.numberMark, { backgroundColor: palette.primary }]}>
            <Text style={styles.numberText}>{benefit.number}</Text>
          </View>
          <View style={styles.benefitCopy}>
            <Text style={[styles.benefitLabel, { color: palette.primary, letterSpacing: palette.wideLetters }]}>{benefit.label}</Text>
            <Text style={[styles.benefitTitle, { color: palette.text, letterSpacing: palette.wideLetters }]}>{benefit.title}</Text>
            <Text style={[styles.bodyText, { color: palette.muted, letterSpacing: palette.wideLetters }]}>{benefit.text}</Text>
          </View>
        </View>
      ))}

      <View style={[styles.teamSection, { backgroundColor: palette.surface }]}>
        <Text style={[styles.kicker, { color: palette.primary }]}>QUEM FAZ</Text>
        <Text style={[styles.sectionTitle, { color: palette.text, letterSpacing: palette.wideLetters }]}>Sobre nós</Text>
        <Text style={[styles.bodyText, { color: palette.muted, letterSpacing: palette.wideLetters }]}>
          Projeto de TCC desenvolvido por estudantes da Etec de Hortolândia, unindo tecnologia, pesquisa e acessibilidade.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => setAboutOpen(true)} style={[styles.aboutButton, { borderColor: palette.primary }]}>
          <Text style={[styles.aboutButtonText, { color: palette.primary }]}>Ler sobre o projeto</Text>
        </Pressable>
        {team.map((member) => (
          <View key={member.name} style={styles.teamMember}>
            <Image accessibilityLabel={`Foto de ${member.name}`} source={member.image} style={styles.teamImage} />
            <View style={styles.teamCopy}>
              <Text style={[styles.teamName, { color: palette.text }]}>{member.name}</Text>
              <Text style={[styles.teamRole, { color: palette.primary }]}>{member.role}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={[styles.footerNote, { color: palette.muted, letterSpacing: palette.wideLetters }]}>
        A atenção é uma habilidade que pode ser estimulada continuamente.
      </Text>
      <Modal animationType="fade" onRequestClose={() => setAboutOpen(false)} transparent visible={aboutOpen}>
        <View style={styles.aboutBackdrop}>
          <View style={[styles.aboutModal, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <View style={[styles.aboutModalHeader, { backgroundColor: palette.primary }]}>
              <Text style={styles.aboutModalTitle}>Sobre o projeto</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={() => setAboutOpen(false)} style={styles.aboutClose}>
                <Text style={styles.aboutCloseText}>×</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.aboutModalBody}>
              <Text style={[styles.aboutText, { color: palette.text, letterSpacing: palette.wideLetters }]}>
                O ConsAttentia é um projeto de conclusão de curso desenvolvido por Giovani Leon, Saymon Palermo e Lucas Ricardo, estudantes de Desenvolvimento de Sistemas Integrado ao Ensino Médio na Etec de Hortolândia.
              </Text>
              <Text style={[styles.aboutText, { color: palette.text, letterSpacing: palette.wideLetters }]}>
                O trabalho foi supervisionado pelas professoras Priscila Batista, na preparação do TCC e banco de dados, e Luzia Ivone, psicóloga e especialista em neuropsicologia, que apoiou as pesquisas sobre atenção.
              </Text>
              <Text style={[styles.aboutText, { color: palette.text, letterSpacing: palette.wideLetters }]}>
                A plataforma utiliza React, TypeScript, CSS, Firebase, Git e GitHub. As atividades apresentadas aqui têm propósito educativo e não substituem avaliação profissional.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </MobileFrame>
  );
}

const styles = StyleSheet.create({
  hero: { overflow: 'hidden', padding: 22, borderRadius: 10 },
  heroKicker: { color: '#F5D990', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  welcome: { marginTop: 12, color: '#FFFFFF', fontSize: 26, lineHeight: 32, fontWeight: '700' },
  heroCopy: { maxWidth: 290, marginTop: 8, color: '#F3F7F4', fontSize: 15, lineHeight: 22 },
  heroImage: { width: '100%', height: 190, marginTop: 10 },
  primaryButton: { minHeight: 48, marginTop: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#174D3A' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  sectionHeading: { gap: 5, paddingTop: 4 },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  sectionTitle: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 16, borderBottomWidth: 1 },
  numberMark: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  numberText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  benefitCopy: { flex: 1, gap: 4 },
  benefitLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  benefitTitle: { fontSize: 16, fontWeight: '700' },
  bodyText: { fontSize: 13, lineHeight: 20 },
  teamSection: { gap: 12, marginTop: 8, padding: 18, borderRadius: 10 },
  aboutButton: { alignSelf: 'flex-start', minHeight: 42, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8, justifyContent: 'center' },
  aboutButtonText: { fontSize: 13, fontWeight: '700' },
  teamMember: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  teamImage: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#D5E4E5' },
  teamCopy: { gap: 4 },
  teamName: { fontSize: 15, fontWeight: '700' },
  teamRole: { fontSize: 12, fontWeight: '600' },
  footerNote: { paddingVertical: 8, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  aboutBackdrop: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: 'rgba(10, 30, 33, 0.7)' },
  aboutModal: { maxHeight: '82%', borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  aboutModalHeader: { minHeight: 66, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aboutModalTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '700' },
  aboutClose: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  aboutCloseText: { color: '#FFFFFF', fontSize: 24, lineHeight: 27 },
  aboutModalBody: { padding: 18, gap: 14 },
  aboutText: { fontSize: 14, lineHeight: 22 },
});
