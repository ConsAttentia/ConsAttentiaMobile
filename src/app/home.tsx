import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { getBrandGradientColors, MobileFrame, useAccessiblePalette } from '@/components/mobile-shell';
import { getUserName } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { readActivityHistory, type ActivityHistory } from '@/lib/activity';

const tests = [
  { title: 'Tohe', description: 'Organize cenas e forme uma historia em sequencia.', image: require('../../assets/images/consattentia/pose.png'), available: true },
  { title: 'AATS', description: 'Aperte corretamente conforme as palavras citadas nos áudios.', image: require('../../assets/images/consattentia/fita.png'), available: false },
];

export default function HomeScreen() {
  const { openTests } = useLocalSearchParams<{ openTests?: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [testsOpen, setTestsOpen] = useState(false);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory>(Array(24).fill(0));
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);

  useEffect(() => {
    if (!auth) {
      router.replace('/');
      return;
    }
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) router.replace('/');
    });
  }, []);

  useEffect(() => {
    const refreshActivity = () => {
      readActivityHistory().then(setActivityHistory);
    };
    refreshActivity();
    const interval = setInterval(refreshActivity, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MobileFrame>
      <View style={styles.homeContent}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.dashboardHero}>
        <View style={styles.heroTop}>
          <View><Text style={styles.welcome}>Bem Vindo</Text><Text style={styles.userLabel}>{user ? getUserName(user) : 'Usuario'}</Text></View>
          <View style={styles.avatar}><View style={styles.avatarHead} /><View style={styles.avatarBody} /></View>
        </View>
        <Text style={styles.activityTitle}>Atividade recente</Text>
        <ActivityGraph history={activityHistory} barColor={palette.accent} />
      </LinearGradient>

      <View style={[styles.section, styles.aboutSection]}>
        <Text style={[styles.sectionTitle, { color: palette.accent }]}>Encontre psicólogos próximos</Text>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.sectionUnderline} />
        <View style={[styles.mapPlaceholder, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.placeholderTitle, { color: palette.text }]}>O mapa aparecerá aqui</Text>
          <Text style={[styles.placeholderCopy, { color: palette.muted }]}>Localização de psicólogos próximos</Text>
        </View>
      </View>

      <View style={styles.homeActions}>
        <Pressable accessibilityRole="button" onPress={() => setTestsOpen(true)}>
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.testsButton}>
            <Text style={styles.testsButtonText}>Explorar Testes</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.projectLink}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/sobre')} style={[styles.projectButton, { backgroundColor: palette.surface, borderColor: palette.accent }]}>
          <Text style={[styles.projectButtonText, { color: palette.accent }]}>Sobre nós</Text>
        </Pressable>
        <Text style={[styles.projectLinkCopy, { color: palette.muted }]}>Informações sobre os integrantes e o projeto</Text>
      </View>

      <TestsSheet
        visible={testsOpen || openTests === '1'}
        onClose={() => {
          setTestsOpen(false);
          if (openTests === '1') router.setParams({ openTests: undefined });
        }}
        palette={palette}
      />
      </View>
    </MobileFrame>
  );
}

function ActivityGraph({ history, barColor }: { history: ActivityHistory; barColor: string }) {
  const maxValue = Math.max(1, ...history);
  const barHeights = history.map((value) => Math.max(4, (value / maxValue) * 58));
  return <View style={styles.graph}>
    {[0, 1, 2, 3].map((line) => <View key={line} style={[styles.graphLine, { top: line * 17 }]} />)}
    <View style={styles.graphBars}>
      {barHeights.map((height, index) => <View key={`${index}-${height}`} style={[styles.graphBar, { height, backgroundColor: barColor }]} />)}
    </View>
    <View style={styles.graphLabels}>{['24h', '20h', '16h', '12h', '8h', '4h', 'agora'].map((label) => <Text key={label} style={styles.graphLabel}>{label}</Text>)}</View>
  </View>;
}

function TestsSheet({ visible, onClose, palette }: { visible: boolean; onClose: () => void; palette: ReturnType<typeof useAccessiblePalette> }) {
  return <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
    <View style={styles.sheetRoot}>
      <Pressable accessibilityLabel="Fechar testes" onPress={onClose} style={styles.sheetScrim} />
      <View style={[styles.testSheet, { backgroundColor: palette.background }]}>
        <View style={[styles.sheetHandle, { backgroundColor: palette.border }]} />
        <View style={styles.sheetHeading}>
          <View><Text style={[styles.sheetEyebrow, { color: palette.primary }]}>CONSATTENTIA</Text><Text style={[styles.sheetTitle, { color: palette.text }]}>Escolha seu teste</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} style={[styles.closeButton, { borderColor: palette.border }]}><Text style={[styles.closeText, { color: palette.text }]}>×</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.testList} showsVerticalScrollIndicator={false}>
          {tests.map((test) => <View key={test.title} style={[styles.testCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Image accessibilityLabel={test.title} resizeMode="contain" source={test.image} style={styles.testImage} />
            <View style={styles.testCopy}><Text style={[styles.testTitle, { color: palette.text }]}>{test.title}</Text><Text style={[styles.testDescription, { color: palette.muted }]}>{test.description}</Text>
              <Pressable accessibilityRole="button" disabled={!test.available} onPress={() => { onClose(); router.push('/tohe'); }} style={[styles.testAction, { backgroundColor: test.available ? palette.primary : palette.border }]}><Text style={[styles.testActionText, !test.available && { color: palette.muted }]}>{test.available ? 'Iniciar teste' : 'Em breve'}</Text></Pressable>
            </View>
          </View>)}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  homeContent: { gap: 12 },
  dashboardHero: { marginHorizontal: -20, marginTop: -22, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, welcome: { color: '#FFFFFF', fontSize: 24, lineHeight: 28, fontWeight: '400' }, userLabel: { color: '#E2F0ED', fontSize: 12 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#E5E7E5', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }, avatarHead: { position: 'absolute', top: 10, width: 16, height: 16, borderRadius: 8, backgroundColor: '#969996' }, avatarBody: { width: 34, height: 18, borderRadius: 18, backgroundColor: '#969996', marginBottom: 5 },
  activityTitle: { marginTop: 14, color: '#DFF1EB', fontSize: 12 }, graph: { height: 88, marginTop: 4, position: 'relative' }, graphLine: { position: 'absolute', left: 12, right: 4, height: 1, backgroundColor: 'rgba(255,255,255,0.55)' }, graphLabels: { position: 'absolute', left: 7, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between' }, graphLabel: { color: '#DFF1EB', fontSize: 8 },
  graphBars: { position: 'absolute', left: 12, right: 4, bottom: 20, height: 48, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', opacity: 0.9 }, graphBar: { width: 4, borderRadius: 3, backgroundColor: '#B7F23A' },
  section: { gap: 8 }, aboutSection: { alignItems: 'center', gap: 6 }, sectionTitle: { fontSize: 13, fontWeight: '500' }, sectionUnderline: { width: 56, height: 3, borderRadius: 2, marginTop: -2 }, mapPlaceholder: { width: '100%', height: 176, borderWidth: 1, borderRadius: 7, alignItems: 'center', justifyContent: 'center', gap: 4 }, placeholderTitle: { fontSize: 14, fontWeight: '600' }, placeholderCopy: { fontSize: 11, lineHeight: 15 },
  homeActions: { marginTop: 0 }, testsButton: { alignSelf: 'center', minWidth: 146, minHeight: 36, paddingHorizontal: 14, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, testsButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  projectLink: { alignItems: 'center', gap: 4 }, projectButton: { alignSelf: 'center', minWidth: 112, minHeight: 34, borderWidth: 1.5, borderRadius: 17, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }, projectButtonText: { fontSize: 13, fontWeight: '700' }, projectLinkCopy: { maxWidth: 270, fontSize: 11, lineHeight: 15, textAlign: 'center' },
  sheetRoot: { flex: 1, justifyContent: 'flex-end' }, sheetScrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(12,32,35,0.55)' }, testSheet: { maxHeight: '86%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, overflow: 'hidden' }, sheetHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, marginBottom: 8 }, sheetHeading: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sheetEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1 }, sheetTitle: { marginTop: 4, fontSize: 23, fontWeight: '700' }, closeButton: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, closeText: { fontSize: 24, lineHeight: 27 }, testList: { gap: 12, padding: 20, paddingTop: 4, paddingBottom: 32 }, testCard: { minHeight: 156, borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', gap: 12 }, testImage: { width: 116, height: 116, borderRadius: 8 }, testCopy: { flex: 1, justifyContent: 'center', gap: 6 }, testTitle: { fontSize: 20, fontWeight: '700' }, testDescription: { fontSize: 12, lineHeight: 17 }, testAction: { minHeight: 36, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }, testActionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
