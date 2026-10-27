import { theme } from '@/shared/theme';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { router } from 'expo-router';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { AccessibleText as Text } from '@/features/accessibility/components/accessibility-text';
import { getBrandGradientColors, MobileFrame, useAccessiblePalette } from '@/features/dashboard/components/mobile-shell';
import { ShareResultButton } from '@/features/results/components/share-result-button';
import { useAccessibility } from '@/features/accessibility/context/accessibility-context';
import { recordActivity } from '@/features/activity/services/activity';
import { formatDuration } from '@/features/results/services/result-report';
import { useCompletedTestHistory } from '@/features/results/hooks/use-completed-test-history';

const levels = [
  {
    label: 'Fácil',
    instruction: 'Toque quando ouvir uma palavra que começa com a letra P.',
    audio: require('../../assets/Audios/ConsAttentia Áudio Letra P 2.0.mp3'),
    targetRatios: [0.08, 0.19, 0.3, 0.41, 0.52, 0.63, 0.74, 0.85, 0.95],
  },
  {
    label: 'Médio',
    instruction: 'Toque quando ouvir o nome de uma roupa ou acessório.',
    audio: require('../../assets/Audios/ConsAttentia Áudio Roupa 2.0.mp3'),
    targetRatios: [0.09, 0.21, 0.33, 0.45, 0.57, 0.69, 0.81, 0.93],
  },
] as const;

type LevelResult = {
  label: string;
  points: number;
  hits: number;
  targetCount: number;
  mistimedPresses: number;
  durationSeconds: number;
};

const emptyStats = () => ({ points: 0, hits: 0, mistimedPresses: 0 });
const subscribeClientReady = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function AatsScreen() {
  const palette = useAccessiblePalette();
  const clientReady = useSyncExternalStore(subscribeClientReady, getClientSnapshot, getServerSnapshot);

  if (!clientReady) {
    return (
      <MobileFrame>
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: palette.primary }]}>Preparando teste de áudio...</Text>
        </View>
      </MobileFrame>
    );
  }

  return <AatsTest />;
}

function AatsTest() {
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);
  const { shouldReduceMotion } = useAccessibility();
  const player = useAudioPlayer(levels[0].audio, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const [levelIndex, setLevelIndex] = useState(0);
  const [audioStarted, setAudioStarted] = useState(false);
  const [showNextLevel, setShowNextLevel] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<LevelResult[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loadError, setLoadError] = useState('');
  const stats = useRef(emptyStats());
  const hitTargets = useRef(new Set<number>());
  const completedLevel = useRef<number | null>(null);
  const level = levels[levelIndex];
  const audioError = status.error ? 'Não foi possível carregar o áudio local. Reinicie o teste e tente novamente.' : loadError;
  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;

  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', (playbackStatus) => {
      if (!playbackStatus.didJustFinish || completedLevel.current === levelIndex) return;
      completedLevel.current = levelIndex;
      player.pause();
      setAudioStarted(false);
      setFeedback('');

      const result: LevelResult = {
        label: level.label,
        points: stats.current.points,
        hits: stats.current.hits,
        targetCount: level.targetRatios.length,
        mistimedPresses: stats.current.mistimedPresses,
        durationSeconds: Math.floor(playbackStatus.duration || playbackStatus.currentTime),
      };
      setResults((current) => [...current, result]);

      if (levelIndex === 0) {
        setShowNextLevel(true);
      } else {
        setShowResults(true);
        void recordActivity();
      }
    });

    return () => subscription.remove();
  }, [levelIndex, level, player]);

  function startOrRespond() {
    if (!audioStarted) {
      if (!status.isLoaded) return;
      try {
        player.play();
        setAudioStarted(true);
        setFeedback('');
      } catch {
        setLoadError('Não foi possível iniciar o áudio local. Tente novamente.');
      }
      return;
    }

    if (!status.playing) {
      player.play();
      return;
    }

    const candidates = level.targetRatios
      .map((ratio, index) => ({ index, time: ratio * status.duration }))
      .filter((target) => !hitTargets.current.has(target.index));
    const closest = candidates.reduce<{ index: number; time: number; distance: number } | null>(
      (nearest, target) => {
        const distance = Math.abs(target.time - status.currentTime);
        return !nearest || distance < nearest.distance ? { ...target, distance } : nearest;
      },
      null
    );

    if (closest && closest.distance <= 1.1) {
      hitTargets.current.add(closest.index);
      stats.current = { ...stats.current, points: stats.current.points + 10, hits: stats.current.hits + 1 };
    } else {
      stats.current = { ...stats.current, mistimedPresses: stats.current.mistimedPresses + 1 };
    }
    setFeedback('Resposta registrada');
  }

  function startMediumLevel() {
    player.pause();
    try {
      player.replace(levels[1].audio);
      stats.current = emptyStats();
      hitTargets.current.clear();
      completedLevel.current = null;
      setLevelIndex(1);
      setAudioStarted(false);
      setShowNextLevel(false);
      setFeedback('');
      setLoadError('');
    } catch {
      setLoadError('Não foi possível carregar o áudio do nível médio. Tente novamente.');
    }
  }

  function restartTest() {
    router.replace('/aats');
  }

  const totalPoints = results.reduce((total, result) => total + result.points, 0);
  const totalDuration = results.reduce((total, result) => total + result.durationSeconds, 0);
  const totalAttempts = results.reduce((total, result) => total + result.hits + result.mistimedPresses, 0);
  const resultReport = {
    testName: 'AATS · Atenção sustentada',
    durationSeconds: totalDuration,
    attempts: totalAttempts,
    attemptsLabel: 'respostas',
    score: totalPoints,
    scoreLabel: 'pontos',
    details: [
      ...results.flatMap((result) => [
        { label: `Nível ${result.label} · Duração`, value: formatDuration(result.durationSeconds) },
        { label: `Nível ${result.label} · Palavras-alvo`, value: `${result.hits} de ${result.targetCount} acertos` },
        { label: `Nível ${result.label} · Respostas fora do tempo`, value: String(result.mistimedPresses) },
      ]),
      { label: 'Critério de pontuação', value: '10 pontos por acerto; respostas fora do tempo não descontam' },
    ],
  };
  const historySave = useCompletedTestHistory(resultReport, showResults);

  if (showResults) {
    return (
      <MobileFrame>
        <View style={styles.resultPage}>
          <Text style={[styles.kicker, { color: palette.primary }]}>CONSATTENTIA · AATS</Text>
          <Text style={[styles.title, { color: palette.text }]}>Teste concluído</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>Este é o resultado das duas etapas.</Text>
          {results.map((result) => (
            <View key={result.label} style={[styles.resultRow, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <View style={styles.resultCopy}>
                <Text style={[styles.resultLevel, { color: palette.text }]}>Nível {result.label}</Text>
                <Text style={[styles.resultDetail, { color: palette.muted }]}>{result.hits} acertos de {result.targetCount} alvos · {result.mistimedPresses} toques fora do tempo</Text>
              </View>
              <Text style={[styles.resultPoints, { color: palette.primary }]}>{result.points}</Text>
            </View>
          ))}
          <View style={[styles.totalPanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.totalLabel, { color: palette.muted }]}>Pontuação total</Text>
            <Text style={[styles.totalPoints, { color: palette.primary }]}>{totalPoints} pontos</Text>
          </View>
          {historySave.status === 'saving' ? <Text style={[styles.feedback, { color: palette.muted }]}>Salvando no histórico...</Text> : null}
          {historySave.status === 'saved' ? <Text style={[styles.feedback, { color: palette.primary }]}>Resultado salvo no histórico do perfil.</Text> : null}
          {historySave.status === 'error' ? (
            <View>
              <Text accessibilityRole="alert" style={[styles.errorText, { color: palette.danger }]}>{historySave.error}</Text>
              <Pressable accessibilityRole="button" onPress={historySave.retry} style={styles.retryButton}>
                <Text style={[styles.secondaryText, { color: palette.primary }]}>Tentar salvar novamente</Text>
              </Pressable>
            </View>
          ) : null}
          <Pressable accessibilityRole="button" onPress={restartTest} style={styles.actionButton}>
            <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.actionGradient}>
              <Text style={styles.actionText}>Fazer o teste novamente</Text>
            </LinearGradient>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: '/home', params: { openTests: '1' } })} style={styles.secondaryButton}>
            <Text style={[styles.secondaryText, { color: palette.primary }]}>Voltar aos testes</Text>
          </Pressable>
          <ShareResultButton report={resultReport} />
        </View>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <View style={styles.page}>
        <View style={styles.heading}>
          <Text style={[styles.kicker, { color: palette.primary }]}>CONSATTENTIA · AATS</Text>
          <Text style={[styles.title, { color: palette.text }]}>Atenção sustentada</Text>
          <Text style={[styles.levelLabel, { color: palette.accent }]}>Nível {level.label}</Text>
          <Text style={[styles.instructions, { color: palette.muted }]}>{level.instruction}</Text>
        </View>

        <View style={styles.progressTrack} accessibilityLabel={`Etapa ${levelIndex + 1} de ${levels.length}`}>
          {levels.map((item, index) => (
            <View key={item.label} style={[styles.progressStep, { backgroundColor: index <= levelIndex ? palette.primary : palette.border }]} />
          ))}
        </View>

        {showNextLevel ? (
          <View style={styles.nextLevelPanel}>
            <Text style={[styles.nextLevelTitle, { color: palette.text }]}>Nível fácil concluído</Text>
            <Text style={[styles.instructions, { color: palette.muted }]}>Agora começa o nível médio. A pontuação aparece somente ao final do teste.</Text>
            {loadError ? <Text accessibilityRole="alert" style={[styles.errorText, { color: palette.danger }]}>{loadError}</Text> : null}
            <Pressable accessibilityRole="button" onPress={startMediumLevel} style={styles.actionButton}>
              <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.actionGradient}>
                <Text style={styles.actionText}>Começar nível médio</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <View style={styles.gameArea}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={!audioStarted ? 'Iniciar áudio' : 'Marcar palavra-alvo'}
              accessibilityState={{ disabled: !status.isLoaded || Boolean(audioError) }}
              disabled={!status.isLoaded || Boolean(audioError)}
              onPress={startOrRespond}
              style={({ pressed }) => [styles.responseButton, pressed && !shouldReduceMotion && styles.responsePressed, (!status.isLoaded || Boolean(audioError)) && styles.responseDisabled]}
            >
              <LinearGradient colors={audioStarted ? gradientColors : [theme.colors.brand.green, theme.colors.brand.green]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.responseGradient}>
                <Text style={styles.responseTitle}>{!status.isLoaded ? 'CARREGANDO' : audioStarted ? 'OUVI O ALVO' : 'TOQUE PARA COMEÇAR'}</Text>
                <Text style={styles.responseCaption}>{audioStarted ? 'Toque no momento da palavra' : 'O áudio será reproduzido uma vez'}</Text>
              </LinearGradient>
            </Pressable>

            <View style={[styles.audioProgress, { backgroundColor: palette.border }]}>
              <View style={[styles.audioProgressFill, { width: `${progress * 100}%`, backgroundColor: palette.primary }]} />
            </View>
            <Text style={[styles.audioTime, { color: palette.muted }]}>
              {audioStarted && status.duration > 0 ? `${Math.floor(status.currentTime)} s / ${Math.floor(status.duration)} s` : ' '}
            </Text>
            <Text accessibilityLiveRegion="polite" style={[styles.feedback, { color: palette.muted }]}>{feedback || ' '}</Text>
            {audioError ? (
              <View style={styles.errorActions}>
                <Text accessibilityRole="alert" style={[styles.errorText, { color: palette.danger }]}>{audioError}</Text>
                <Pressable accessibilityRole="button" onPress={restartTest} style={styles.retryButton}>
                  <Text style={[styles.secondaryText, { color: palette.primary }]}>Recarregar áudio</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}

        <Text style={[styles.footerHint, { color: palette.muted }]}>
          {audioStarted ? 'Mantenha a atenção no áudio. A pontuação ficará oculta até o final.' : `Áudio ${levelIndex + 1} de ${levels.length}`}
        </Text>
      </View>
    </MobileFrame>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing[24] },
  loadingText: { fontSize: theme.typography.fontSize[14], textAlign: 'center' },
  page: { flex: 1, gap: theme.spacing[20] },
  heading: { gap: theme.spacing[7] },
  kicker: { fontSize: theme.typography.fontSize[10], fontWeight: '800' },
  title: { fontSize: theme.typography.fontSize[25], lineHeight: theme.typography.lineHeight[31], fontWeight: '700' },
  levelLabel: { fontSize: theme.typography.fontSize[15], fontWeight: '700' },
  instructions: { fontSize: theme.typography.fontSize[14], lineHeight: theme.typography.lineHeight[21] },
  progressTrack: { flexDirection: 'row', gap: theme.spacing[8] },
  progressStep: { flex: 1, height: theme.sizes[5], borderRadius: theme.radii[3] },
  gameArea: { flex: 1, minHeight: theme.sizes[340], alignItems: 'center', justifyContent: 'center', gap: theme.spacing[12] },
  responseButton: { width: '76%', maxWidth: theme.sizes[286], aspectRatio: 1, borderRadius: theme.radii[150], overflow: 'hidden' },
  responseGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing[24], gap: theme.spacing[12] },
  responsePressed: { transform: [{ scale: 0.97 }] },
  responseDisabled: { opacity: 0.65 },
  responseTitle: { color: theme.colors.white, fontSize: theme.typography.fontSize[17], lineHeight: theme.typography.lineHeight[23], fontWeight: '800', textAlign: 'center' },
  responseCaption: { maxWidth: theme.sizes[180], color: theme.colors.white, fontSize: theme.typography.fontSize[12], lineHeight: theme.typography.lineHeight[18], textAlign: 'center' },
  audioProgress: { width: '100%', height: theme.sizes[4], borderRadius: theme.radii[2], overflow: 'hidden' },
  audioProgressFill: { height: '100%' },
  audioTime: { minHeight: theme.sizes[18], fontSize: theme.typography.fontSize[11] },
  feedback: { minHeight: theme.sizes[20], fontSize: theme.typography.fontSize[13], textAlign: 'center' },
  errorText: { fontSize: theme.typography.fontSize[13], lineHeight: theme.typography.lineHeight[19], textAlign: 'center' },
  errorActions: { alignItems: 'center', gap: theme.spacing[8] },
  retryButton: { minHeight: theme.sizes[40], justifyContent: 'center', paddingHorizontal: theme.spacing[12] },
  footerHint: { fontSize: theme.typography.fontSize[12], lineHeight: theme.typography.lineHeight[18], textAlign: 'center' },
  nextLevelPanel: { flex: 1, minHeight: theme.sizes[280], justifyContent: 'center', gap: theme.spacing[18] },
  nextLevelTitle: { fontSize: theme.typography.fontSize[21], fontWeight: '700' },
  actionButton: { minHeight: theme.sizes[50], borderRadius: theme.radii[9], overflow: 'hidden' },
  actionGradient: { flex: 1, minHeight: theme.sizes[50], alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing[18] },
  actionText: { color: theme.colors.white, fontSize: theme.typography.fontSize[15], fontWeight: '700' },
  resultPage: { flex: 1, gap: theme.spacing[14] },
  subtitle: { fontSize: theme.typography.fontSize[14], lineHeight: theme.typography.lineHeight[20] },
  resultRow: { minHeight: theme.sizes[72], borderWidth: theme.sizes[1], borderRadius: theme.radii[8], padding: theme.spacing[12], flexDirection: 'row', alignItems: 'center', gap: theme.spacing[12] },
  resultCopy: { flex: 1, gap: theme.spacing[4] },
  resultLevel: { fontSize: theme.typography.fontSize[14], fontWeight: '700' },
  resultDetail: { fontSize: theme.typography.fontSize[11], lineHeight: theme.typography.lineHeight[16] },
  resultPoints: { fontSize: theme.typography.fontSize[20], fontWeight: '800' },
  totalPanel: { minHeight: theme.sizes[94], borderWidth: theme.sizes[1], borderRadius: theme.radii[8], alignItems: 'center', justifyContent: 'center', gap: theme.spacing[6] },
  totalLabel: { fontSize: theme.typography.fontSize[12] },
  totalPoints: { fontSize: theme.typography.fontSize[25], fontWeight: '800' },
  secondaryButton: { minHeight: theme.sizes[48], alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: theme.typography.fontSize[14], fontWeight: '700' },
});