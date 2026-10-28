import { theme } from '@/shared/theme';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { AccessibleText as Text } from '@/features/accessibility/components/accessibility-text';
import { LinearGradient } from 'expo-linear-gradient';

import { getBrandGradientColors, MobileFrame, useAccessiblePalette } from '@/features/dashboard/components/mobile-shell';
import { getUserName } from '@/features/auth/services/auth';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { readActivityHistory, type ActivityHistory } from '@/features/activity/services/activity';
import { useAccessibility } from '@/features/accessibility/context/accessibility-context';

const tests = [
  { title: 'Tohe', description: 'Organize cenas e forme uma historia em sequencia.', image: require('../../assets/images/consattentia/pose.png'), available: true, route: '/tohe' as const },
  { title: 'AATS', description: 'Aperte quando ouvir palavras-alvo durante os áudios.', image: require('../../assets/images/consattentia/fita.png'), available: true, route: '/aats' as const },
  { title: 'AATA', description: 'Alterne entre regras e responda a pares de letras conforme cada fase.', image: require('../../assets/images/attention/aata-card.png'), available: true, route: '/aata' as const },
  { title: 'ADAS', description: 'Compare recortes com uma grade de imagens em três níveis de dificuldade.', image: require('../../assets/images/attention/adas-card.png'), available: true, route: '/adaa' as const },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { openTests } = useLocalSearchParams<{ openTests?: string }>();
  const [testsOpen, setTestsOpen] = useState(false);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory>(Array(24).fill(0));
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);

  useEffect(() => {
    let active = true;
    const refreshActivity = () => {
      void readActivityHistory().then((history) => {
        if (active) setActivityHistory(history);
      });
    };
    refreshActivity();
    const interval = setInterval(refreshActivity, 60 * 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <MobileFrame compactContent>
      <View style={styles.homeContent}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.dashboardHero}>
        <View style={styles.heroTop}>
          <View><Text style={styles.welcome}>Bem Vindo</Text><Text style={styles.userLabel}>{user ? getUserName(user) : 'Usuario'}</Text></View>
          <View style={styles.avatar}>
            <SymbolView
              name={{ ios: 'person.fill', android: 'person', web: 'person' }}
              size={theme.sizes[36]}
              tintColor={theme.colors.avatarMuted}
            />
          </View>
        </View>
        <View style={styles.activityHeading}>
          <Text style={styles.activityTitle}>Atividade recente</Text>
          <Text style={styles.activityTotal}>{activityHistory.reduce((total, count) => total + count, 0)} eventos / 24h</Text>
        </View>
        <ActivityGraph history={activityHistory} barColor={theme.colors.white} />
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
          if (openTests === '1') router.replace('/home');
        }}
        palette={palette}
      />
      </View>
    </MobileFrame>
  );
}

interface ActivityGraphProps {
  history: ActivityHistory;
  barColor: string;
}

function ActivityGraph({ history, barColor }: ActivityGraphProps) {
  const maxValue = Math.max(1, ...history);
  const barHeights = history.map((value) => value === 0 ? 2 : Math.max(8, (value / maxValue) * 56));
  const total = history.reduce((sum, count) => sum + count, 0);
  return (
    <View accessibilityRole="image" accessibilityLabel={`Atividade nas últimas 24 horas: ${total} registros`} style={styles.graph}>
      {[0, 1, 2, 3].map((line) => <View key={line} style={[styles.graphLine, { top: line * 18 + 4 }]} />)}
      <View style={styles.graphBars}>
        {barHeights.map((height, index) => <View key={index} style={[styles.graphBar, { height, backgroundColor: barColor }]} />)}
      </View>
      <View style={styles.graphLabels}>{['24h', '20h', '16h', '12h', '8h', '4h', 'agora'].map((label) => <Text key={label} style={styles.graphLabel}>{label}</Text>)}</View>
    </View>
  );
}

interface TestsSheetProps {
  visible: boolean;
  onClose: () => void;
  palette: ReturnType<typeof useAccessiblePalette>;
}

function TestsSheet({ visible, onClose, palette }: TestsSheetProps) {
  const { shouldReduceMotion } = useAccessibility();
  return <Modal animationType={shouldReduceMotion ? 'none' : 'slide'} onRequestClose={onClose} transparent visible={visible}>
    <View style={styles.sheetRoot}>
      <Pressable accessibilityLabel="Fechar testes" onPress={onClose} style={styles.sheetScrim} />
      <View style={[styles.testSheet, { backgroundColor: palette.background }]}>
        <View style={[styles.sheetHandle, { backgroundColor: palette.border }]} />
        <View style={styles.sheetHeading}>
          <View><Text style={[styles.sheetEyebrow, { color: palette.primary }]}>CONSATTENTIA</Text><Text style={[styles.sheetTitle, { color: palette.text }]}>Escolha seu teste</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} style={[styles.closeButton, { borderColor: palette.border }]}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={theme.sizes[24]}
              tintColor={palette.text}
            />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.testList} showsVerticalScrollIndicator={false}>
          {tests.map((test) => <View key={test.title} style={[styles.testCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Image accessibilityLabel={test.title} resizeMode="contain" source={test.image} style={styles.testImage} />
            <View style={styles.testCopy}><Text style={[styles.testTitle, { color: palette.text }]}>{test.title}</Text><Text style={[styles.testDescription, { color: palette.muted }]}>{test.description}</Text>
              {test.available ? (
                <Pressable accessibilityRole="button" onPress={() => { onClose(); router.push(test.route); }} style={[styles.testAction, { backgroundColor: palette.primary }]}>
                  <Text style={[styles.testActionText, palette.background === theme.colors.highContrast.background && styles.highContrastActionText]}>Iniciar teste</Text>
                </Pressable>
              ) : (
                <Pressable accessibilityRole="button" disabled style={[styles.testAction, { backgroundColor: palette.border }]}>
                  <Text style={[styles.testActionText, { color: palette.muted }]}>Em breve</Text>
                </Pressable>
              )}
            </View>
          </View>)}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  homeContent: { gap: theme.spacing[12] },
  dashboardHero: {
    marginHorizontal: -theme.spacing[18],
    paddingHorizontal: theme.spacing[18],
    paddingTop: theme.spacing[16],
    paddingBottom: theme.spacing[14],
    borderRadius: theme.radii[18],
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  welcome: { color: theme.colors.white, fontSize: theme.typography.fontSize[24], lineHeight: theme.typography.lineHeight[28], fontWeight: '700' },
  userLabel: { color: theme.colors.heroText, fontSize: theme.typography.fontSize[12], marginTop: theme.spacing[2] },
  avatar: { width: theme.sizes[54], height: theme.sizes[54], borderRadius: theme.radii[27], backgroundColor: theme.colors.avatar, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  activityHeading: { marginTop: theme.spacing[12], flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: theme.spacing[8] },
  activityTitle: { color: theme.colors.white, fontSize: theme.typography.fontSize[14], fontWeight: '700' },
  activityTotal: { color: theme.colors.white, fontSize: theme.typography.fontSize[11], fontWeight: '600' },
  graph: { height: theme.sizes[96], marginTop: theme.spacing[4], position: 'relative' },
  graphLine: { position: 'absolute', left: theme.spacing[12], right: theme.spacing[4], height: theme.sizes[1], backgroundColor: theme.colors.graphLine },
  graphLabels: { position: 'absolute', left: theme.spacing[7], right: theme.spacing[0], bottom: theme.spacing[0], flexDirection: 'row', justifyContent: 'space-between' },
  graphLabel: { color: theme.colors.white, fontSize: theme.typography.fontSize[10], fontWeight: '500' },
  graphBars: { position: 'absolute', left: theme.spacing[12], right: theme.spacing[4], bottom: theme.spacing[22], height: theme.sizes[62], flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  graphBar: { width: theme.sizes[6], maxWidth: theme.sizes[8], borderRadius: theme.radii[4], backgroundColor: theme.colors.graph },
  section: { gap: theme.spacing[8] },
  aboutSection: { alignItems: 'center', gap: theme.spacing[6] },
  sectionTitle: { fontSize: theme.typography.fontSize[13], fontWeight: '700' },
  sectionUnderline: { width: theme.sizes[56], height: theme.sizes[3], borderRadius: theme.radii[2], marginTop: -theme.spacing[2] },
  mapPlaceholder: { width: '100%', height: theme.sizes[176], borderWidth: theme.sizes[1], borderRadius: theme.radii[12], alignItems: 'center', justifyContent: 'center', gap: theme.spacing[4] },
  placeholderTitle: { fontSize: theme.typography.fontSize[14], fontWeight: '600' },
  placeholderCopy: { fontSize: theme.typography.fontSize[11], lineHeight: theme.typography.lineHeight[15] },
  homeActions: { marginTop: theme.spacing[2] },
  testsButton: { alignSelf: 'center', minWidth: theme.sizes[180], minHeight: theme.sizes[50], paddingHorizontal: theme.spacing[16], borderRadius: theme.radii[24], alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: '#000000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  testsButtonText: { color: theme.colors.white, fontSize: theme.typography.fontSize[15], fontWeight: '700' },
  projectLink: { alignItems: 'center', gap: theme.spacing[4] },
  projectButton: { alignSelf: 'center', minWidth: theme.sizes[126], minHeight: theme.sizes[46], borderWidth: theme.sizes[1.5], borderRadius: theme.radii[22], paddingHorizontal: theme.spacing[16], alignItems: 'center', justifyContent: 'center' },
  projectButtonText: { fontSize: theme.typography.fontSize[13], fontWeight: '700' },
  projectLinkCopy: { maxWidth: theme.sizes[270], fontSize: theme.typography.fontSize[11], lineHeight: theme.typography.lineHeight[15], textAlign: 'center' },
  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  sheetScrim: { ...StyleSheet.absoluteFill, backgroundColor: theme.colors.scrim },
  testSheet: { maxHeight: '86%', borderTopLeftRadius: theme.radii[24], borderTopRightRadius: theme.radii[24], paddingTop: theme.spacing[10], overflow: 'hidden', shadowColor: '#000000', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: -8 }, elevation: 16 },
  sheetHandle: { alignSelf: 'center', width: theme.sizes[42], height: theme.sizes[4], borderRadius: theme.radii[2], marginBottom: theme.spacing[8] },
  sheetHeading: { paddingHorizontal: theme.spacing[20], paddingVertical: theme.spacing[12], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetEyebrow: { fontSize: theme.typography.fontSize[10], fontWeight: '800', letterSpacing: theme.sizes[1] },
  sheetTitle: { marginTop: theme.spacing[4], fontSize: theme.typography.fontSize[23], fontWeight: '700' },
  closeButton: { width: theme.sizes[44], height: theme.sizes[44], borderWidth: theme.sizes[1], borderRadius: theme.radii[22], alignItems: 'center', justifyContent: 'center' },
  testList: { gap: theme.spacing[12], padding: theme.spacing[20], paddingTop: theme.spacing[4], paddingBottom: theme.spacing[32] },
  testCard: { minHeight: theme.sizes[156], borderWidth: theme.sizes[1], borderRadius: theme.radii[12], padding: theme.spacing[12], flexDirection: 'row', gap: theme.spacing[12], shadowColor: '#000000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  testImage: { width: theme.sizes[112], height: theme.sizes[112], borderRadius: theme.radii[10], backgroundColor: theme.colors.photoPlaceholder },
  testCopy: { flex: 1, justifyContent: 'center', gap: theme.spacing[6] },
  testTitle: { fontSize: theme.typography.fontSize[20], fontWeight: '700' },
  testDescription: { fontSize: theme.typography.fontSize[12], lineHeight: theme.typography.lineHeight[17] },
  testAction: { minHeight: theme.sizes[44], paddingHorizontal: theme.spacing[12], borderRadius: theme.radii[8], alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  testActionText: { color: theme.colors.white, fontSize: theme.typography.fontSize[12], fontWeight: '700' },
  highContrastActionText: { color: theme.colors.black },
});
