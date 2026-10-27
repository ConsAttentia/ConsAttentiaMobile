import { theme } from '@/shared/theme';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { AccessibleText as Text } from '@/features/accessibility/components/accessibility-text';
import { getBrandGradientColors, MobileFrame, useAccessiblePalette } from '@/features/dashboard/components/mobile-shell';
import { ShareResultButton } from '@/features/results/components/share-result-button';
import { recordActivity } from '@/features/activity/services/activity';
import { formatDuration } from '@/features/results/services/result-report';
import { useCompletedTestHistory } from '@/features/results/hooks/use-completed-test-history';

type Letter = 'A' | 'B' | 'C' | 'D';
type Rule = 'equal' | 'different';
type Phase = 'intro' | 'playing-blue' | 'ready-yellow' | 'playing-yellow' | 'results';
type Trial = { rule: Rule; first: Letter; second: Letter; target: boolean };

const trialsPerPhase = 16;
const targetsPerPhase = trialsPerPhase / 2;
const trialDuration = 1800;
const letters: Letter[] = ['A', 'B', 'C', 'D'];
const letterImages: Record<Rule, Record<Letter, ImageSourcePropType>> = {
  equal: {
    A: require('../../assets/images/attention/letter-a-blue.png'),
    B: require('../../assets/images/attention/letter-b-blue.png'),
    C: require('../../assets/images/attention/letter-c-blue.png'),
    D: require('../../assets/images/attention/letter-d-blue.png'),
  },
  different: {
    A: require('../../assets/images/attention/letter-a-yellow.png'),
    B: require('../../assets/images/attention/letter-b-yellow.png'),
    C: require('../../assets/images/attention/letter-c-yellow.png'),
    D: require('../../assets/images/attention/letter-d-yellow.png'),
  },
};

function createTrials(rule: Rule): Trial[] {
  const targets = Array.from({ length: trialsPerPhase }, (_, index) => index < targetsPerPhase);
  for (let index = targets.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [targets[index], targets[swapIndex]] = [targets[swapIndex], targets[index]];
  }

  return targets.map((target) => {
    const firstIndex = Math.floor(Math.random() * letters.length);
    const secondIndex = target === (rule === 'equal')
      ? firstIndex
      : (firstIndex + 1 + Math.floor(Math.random() * (letters.length - 1))) % letters.length;
    return { rule, first: letters[firstIndex], second: letters[secondIndex], target };
  });
}

export default function AataScreen() {
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);
  const [phase, setPhase] = useState<Phase>('intro');
  const [blueTrials, setBlueTrials] = useState<Trial[]>([]);
  const [yellowTrials, setYellowTrials] = useState<Trial[]>([]);
  const [trialIndex, setTrialIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [blueCorrect, setBlueCorrect] = useState(0);
  const [yellowCorrect, setYellowCorrect] = useState(0);
  const [blueMisses, setBlueMisses] = useState(0);
  const [yellowMisses, setYellowMisses] = useState(0);
  const [blueFalseAlarms, setBlueFalseAlarms] = useState(0);
  const [yellowFalseAlarms, setYellowFalseAlarms] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [feedback, setFeedback] = useState('');
  const startTime = useRef<number | null>(null);
  const answeredThisTrial = useRef(false);
  const isBluePhase = phase === 'playing-blue';
  const activeTrials = isBluePhase ? blueTrials : yellowTrials;
  const currentTrial = activeTrials[trialIndex];
  const isPlaying = phase === 'playing-blue' || phase === 'playing-yellow';
  const report = {
    testName: 'AATA · Atenção alternada',
    durationSeconds: Math.floor(elapsed / 1000),
    attempts,
    attemptsLabel: 'respostas',
    score,
    scoreLabel: 'pontos',
    details: [
      { label: 'Pontuação total', value: `${score} de ${targetsPerPhase * 2 * 10} pontos` },
      { label: 'Fase azul · Letras iguais', value: `${blueCorrect} de ${targetsPerPhase} acertos` },
      { label: 'Fase amarela · Letras diferentes', value: `${yellowCorrect} de ${targetsPerPhase} acertos` },
      { label: 'Omissões na fase azul', value: String(blueMisses) },
      { label: 'Omissões na fase amarela', value: String(yellowMisses) },
      { label: 'Respostas fora da regra na fase azul', value: String(blueFalseAlarms) },
      { label: 'Respostas fora da regra na fase amarela', value: String(yellowFalseAlarms) },
      { label: 'Omissões de alvos', value: String(misses) },
      { label: 'Respostas fora da regra', value: String(falseAlarms) },
      { label: 'Duração', value: formatDuration(Math.floor(elapsed / 1000)) },
    ],
  };
  const historySave = useCompletedTestHistory(report, phase === 'results');

  useEffect(() => {
    if (!isPlaying || startTime.current === null) return;
    const intervalId = setInterval(() => {
      if (startTime.current !== null) setElapsed(Date.now() - startTime.current);
    }, 250);
    return () => clearInterval(intervalId);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || !currentTrial) return;
    answeredThisTrial.current = false;
    const timeoutId = setTimeout(() => {
      if (!answeredThisTrial.current && currentTrial.target) {
        setMisses((count) => count + 1);
        if (isBluePhase) setBlueMisses((count) => count + 1);
        else setYellowMisses((count) => count + 1);
      }
      if (trialIndex === activeTrials.length - 1) {
        if (isBluePhase) {
          setTrialIndex(0);
          setFeedback('');
          setPhase('ready-yellow');
        } else {
          if (startTime.current !== null) setElapsed(Date.now() - startTime.current);
          setPhase('results');
          void recordActivity();
        }
      } else {
        setTrialIndex((index) => index + 1);
      }
    }, trialDuration);
    return () => clearTimeout(timeoutId);
  }, [activeTrials.length, currentTrial, isBluePhase, isPlaying, trialIndex]);

  function beginTest() {
    startTime.current = Date.now();
    setBlueTrials(createTrials('equal'));
    setYellowTrials(createTrials('different'));
    setTrialIndex(0);
    setScore(0);
    setAttempts(0);
    setCorrect(0);
    setBlueCorrect(0);
    setYellowCorrect(0);
    setBlueMisses(0);
    setYellowMisses(0);
    setBlueFalseAlarms(0);
    setYellowFalseAlarms(0);
    setMisses(0);
    setFalseAlarms(0);
    setElapsed(0);
    setFeedback('');
    answeredThisTrial.current = false;
    setPhase('playing-blue');
  }

  function answerTrial() {
    if (!currentTrial || answeredThisTrial.current) return;
    answeredThisTrial.current = true;
    setAttempts((count) => count + 1);
    if (currentTrial.target) {
      setScore((count) => count + 10);
      setCorrect((count) => count + 1);
      if (isBluePhase) setBlueCorrect((count) => count + 1);
      else setYellowCorrect((count) => count + 1);
      setFeedback('Acerto! +10 pontos');
    } else {
      setFalseAlarms((count) => count + 1);
      if (isBluePhase) setBlueFalseAlarms((count) => count + 1);
      else setYellowFalseAlarms((count) => count + 1);
      setFeedback('Resposta fora da regra.');
    }
  }

  function startYellowPhase() {
    setTrialIndex(0);
    setFeedback('');
    answeredThisTrial.current = false;
    setPhase('playing-yellow');
  }

  return (
    <MobileFrame>
      {phase === 'intro' ? (
        <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.kicker, { color: palette.primary }]}>ATENÇÃO ALTERNADA</Text>
          <Text style={[styles.title, { color: palette.text }]}>AATA</Text>
          <Text style={[styles.body, { color: palette.muted }]}>
            Complete duas fases. Na fase azul, responda somente quando as letras forem iguais. Na fase amarela, responda somente quando forem diferentes. Cada estímulo fica na tela por alguns instantes; não toque quando o par não corresponder à regra.
          </Text>
          <View style={[styles.ruleCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.ruleTitle, { color: palette.text }]}>Fase 1 · Azul</Text>
            <Text style={[styles.body, { color: palette.muted }]}>Toque em “Responder” quando as duas letras forem iguais.</Text>
            <Text style={[styles.ruleTitle, { color: palette.text }]}>Fase 2 · Amarela</Text>
            <Text style={[styles.body, { color: palette.muted }]}>Toque em “Responder” quando as letras forem diferentes.</Text>
          </View>
          <ActionButton label="Iniciar atividade" onPress={beginTest} colors={gradientColors} highContrast={palette.background === theme.colors.highContrast.background} />
        </View>
      ) : null}

      {phase === 'ready-yellow' ? (
        <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.kicker, { color: palette.primary }]}>FASE 1 CONCLUÍDA</Text>
          <Text style={[styles.title, { color: palette.text }]}>A regra mudou</Text>
          <Text style={[styles.body, { color: palette.muted }]}>
            Na fase amarela, toque em “Responder” somente quando as duas letras forem diferentes.
          </Text>
          <ActionButton label="Iniciar fase amarela" onPress={startYellowPhase} colors={gradientColors} highContrast={palette.background === theme.colors.highContrast.background} />
        </View>
      ) : null}

      {isPlaying && currentTrial ? (
        <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.kicker, { color: palette.primary }]}>
            FASE {isBluePhase ? '1 DE 2 · AZUL' : '2 DE 2 · AMARELA'} · ESTÍMULO {trialIndex + 1} DE {activeTrials.length}
          </Text>
          <Text style={[styles.title, { color: palette.text }]}>{isBluePhase ? 'Letras iguais' : 'Letras diferentes'}</Text>
          <Text style={[styles.body, { color: palette.muted }]}>
            {isBluePhase ? 'Responda somente quando as duas letras forem iguais.' : 'Responda somente quando as duas letras forem diferentes.'}
          </Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.score, { color: palette.primary }]}>{score} pontos</Text>
            <Text style={[styles.body, { color: palette.muted }]}>{correct} acertos</Text>
          </View>
          <View style={styles.stimulus} accessibilityLabel={`Compare as letras ${currentTrial.first} e ${currentTrial.second}`}>
            <Image accessibilityLabel={`Letra ${currentTrial.first}`} resizeMode="contain" source={letterImages[currentTrial.rule][currentTrial.first]} style={styles.letter} />
            <Text style={[styles.multiplication, { color: palette.muted }]}>×</Text>
            <Image accessibilityLabel={`Letra ${currentTrial.second}`} resizeMode="contain" source={letterImages[currentTrial.rule][currentTrial.second]} style={styles.letter} />
          </View>
          <Text accessibilityLiveRegion="polite" style={[styles.feedback, { color: palette.muted }]}>{feedback || 'Observe as letras e siga a regra.'}</Text>
          <ActionButton label="Responder" onPress={answerTrial} colors={gradientColors} highContrast={palette.background === theme.colors.highContrast.background} />
        </View>
      ) : null}

      {phase === 'results' ? (
        <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.kicker, { color: palette.primary }]}>RESULTADO FINAL</Text>
          <Text style={[styles.title, { color: palette.text }]}>AATA concluído</Text>
          <View style={[styles.ruleCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <ResultRow label="Pontuação" value={`${score} de ${targetsPerPhase * 2 * 10}`} palette={palette} />
            <ResultRow label="Fase azul · Acertos" value={`${blueCorrect} de ${targetsPerPhase}`} palette={palette} />
            <ResultRow label="Fase amarela · Acertos" value={`${yellowCorrect} de ${targetsPerPhase}`} palette={palette} />
            <ResultRow label="Respostas" value={String(attempts)} palette={palette} />
            <ResultRow label="Omissões" value={String(misses)} palette={palette} />
            <ResultRow label="Respostas fora da regra" value={String(falseAlarms)} palette={palette} />
            <ResultRow label="Tempo total" value={formatDuration(Math.floor(elapsed / 1000))} palette={palette} />
          </View>
          {historySave.status === 'saving' ? <Text style={[styles.feedback, { color: palette.muted }]}>Salvando no histórico...</Text> : null}
          {historySave.status === 'saved' ? <Text style={[styles.feedback, { color: palette.primary }]}>Resultado salvo no histórico do perfil.</Text> : null}
          {historySave.status === 'error' ? (
            <View>
              <Text accessibilityRole="alert" style={[styles.feedback, { color: palette.danger }]}>{historySave.error}</Text>
              <Pressable accessibilityRole="button" onPress={historySave.retry} style={styles.retryButton}>
                <Text style={[styles.retryText, { color: palette.primary }]}>Tentar salvar novamente</Text>
              </Pressable>
            </View>
          ) : null}
          <ShareResultButton report={report} />
          <ActionButton label="Fazer novamente" onPress={() => router.replace('/aata')} colors={gradientColors} highContrast={palette.background === theme.colors.highContrast.background} />
          <Pressable accessibilityRole="button" onPress={() => router.replace('/home')} style={styles.backButton}>
            <Text style={[styles.retryText, { color: palette.primary }]}>Voltar ao início</Text>
          </Pressable>
        </View>
      ) : null}
    </MobileFrame>
  );
}

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  colors: readonly [string, string];
  highContrast: boolean;
}

function ActionButton({
  label,
  onPress,
  colors,
  highContrast,
}: ActionButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.actionButton}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.actionGradient}>
        <Text style={[styles.actionText, highContrast && styles.highContrastActionText]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

interface ResultRowProps {
  label: string;
  value: string;
  palette: ReturnType<typeof useAccessiblePalette>;
}

function ResultRow({ label, value, palette }: ResultRowProps) {
  return (
    <View style={styles.resultRow}>
      <Text style={[styles.body, { color: palette.muted }]}>{label}</Text>
      <Text style={[styles.resultValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: theme.spacing[14], padding: theme.spacing[18], borderWidth: theme.sizes[1], borderRadius: theme.radii[12] },
  kicker: { fontSize: theme.typography.fontSize[10], fontWeight: '800', letterSpacing: theme.sizes[0.8] },
  title: { fontSize: theme.typography.fontSize[25], lineHeight: theme.typography.lineHeight[31], fontWeight: '700' },
  body: { fontSize: theme.typography.fontSize[14], lineHeight: theme.typography.lineHeight[21] },
  ruleCard: { gap: theme.spacing[8], padding: theme.spacing[14], borderWidth: theme.sizes[1], borderRadius: theme.radii[10] },
  ruleTitle: { fontSize: theme.typography.fontSize[14], fontWeight: '700' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  score: { fontSize: theme.typography.fontSize[17], fontWeight: '800' },
  stimulus: { minHeight: theme.sizes[130], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing[12] },
  letter: { width: '38%', height: theme.sizes[118] },
  multiplication: { fontSize: theme.typography.fontSize[24], fontWeight: '600' },
  feedback: { minHeight: theme.sizes[20], fontSize: theme.typography.fontSize[13], lineHeight: theme.typography.lineHeight[19], textAlign: 'center' },
  actionButton: { width: '100%', minHeight: theme.sizes[48], borderRadius: theme.radii[9], overflow: 'hidden' },
  actionGradient: { minHeight: theme.sizes[48], alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing[14] },
  actionText: { color: theme.colors.white, fontSize: theme.typography.fontSize[15], fontWeight: '700' },
  highContrastActionText: { color: theme.colors.white },
  resultRow: { minHeight: theme.sizes[30], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing[8] },
  resultValue: { fontSize: theme.typography.fontSize[14], fontWeight: '700' },
  retryButton: { minHeight: theme.sizes[40], alignItems: 'center', justifyContent: 'center' },
  retryText: { fontSize: theme.typography.fontSize[13], fontWeight: '700' },
  backButton: { minHeight: theme.sizes[40], alignItems: 'center', justifyContent: 'center' },
});
