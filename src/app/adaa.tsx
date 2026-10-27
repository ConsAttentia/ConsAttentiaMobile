import { theme } from '@/shared/theme';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AccessibleText as Text } from '@/features/accessibility/components/accessibility-text';
import { getBrandGradientColors, MobileFrame, useAccessiblePalette } from '@/features/dashboard/components/mobile-shell';
import { ShareResultButton } from '@/features/results/components/share-result-button';
import { recordActivity } from '@/features/activity/services/activity';
import { formatDuration } from '@/features/results/services/result-report';
import { useCompletedTestHistory } from '@/features/results/hooks/use-completed-test-history';

type Palette = ReturnType<typeof useAccessiblePalette>;
type Level = {
  name: string;
  difficulty: string;
  image: ComponentProps<typeof Image>['source'];
  aspectRatio: number;
};
type Phase = 'intro' | 'playing' | 'results';
type CropSize = { width: number; height: number };

const gridSize = 5;
const cropsPerLevel = 3;
const levels: readonly Level[] = [
  { name: 'Floresta', difficulty: 'Fácil', image: require('../../assets/images/attention/forest-grid.png'), aspectRatio: 596 / 380 },
  { name: 'Casa', difficulty: 'Médio', image: require('../../assets/images/attention/home-grid.png'), aspectRatio: 740 / 415 },
  { name: 'Cidade', difficulty: 'Difícil', image: require('../../assets/images/attention/city-grid-mobile.jpg'), aspectRatio: 16 / 9 },
];

function createRandomCrops() {
  const cells = Array.from({ length: gridSize * gridSize }, (_, index) => index);
  for (let index = cells.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cells[index], cells[swapIndex]] = [cells[swapIndex], cells[index]];
  }
  return cells.slice(0, cropsPerLevel);
}

export default function AdaaScreen() {
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);
  const [phase, setPhase] = useState<Phase>('intro');
  const [levelIndex, setLevelIndex] = useState(0);
  const [cropIndex, setCropIndex] = useState(0);
  const [targets, setTargets] = useState<number[][]>([]);
  const [answers, setAnswers] = useState<(number | null)[][]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cropSize, setCropSize] = useState<CropSize>({ width: 0, height: 0 });
  const startedAt = useRef<number | null>(null);
  const currentLevel = levels[levelIndex];
  const currentTargets = targets[levelIndex] ?? [];
  const currentAnswers = answers[levelIndex] ?? [];
  const targetCell = currentTargets[cropIndex];
  const report = {
    testName: 'ADAS · Atenção seletiva',
    durationSeconds: Math.floor(elapsed / 1000),
    attempts,
    attemptsLabel: 'recortes respondidos',
    score,
    scoreLabel: 'pontos',
    details: [
      { label: 'Pontuação total', value: `${score} de ${levels.length * cropsPerLevel} pontos` },
      { label: 'Recortes respondidos', value: `${attempts} de ${levels.length * cropsPerLevel}` },
      ...levels.map((level, index) => ({
        label: `Nível ${level.name}`,
        value: `${answers[index]?.filter((answer, crop) => answer === targets[index]?.[crop]).length ?? 0} de ${cropsPerLevel} acertos`,
      })),
      { label: 'Tempo total', value: formatDuration(Math.floor(elapsed / 1000)) },
    ],
  };
  const historySave = useCompletedTestHistory(report, phase === 'results');

  useEffect(() => {
    if (phase !== 'playing' || startedAt.current === null) return;
    const startTime = startedAt.current;
    const intervalId = setInterval(() => setElapsed(Date.now() - startTime), 250);
    return () => clearInterval(intervalId);
  }, [phase]);

  function beginTest() {
    startedAt.current = Date.now();
    setElapsed(0);
    setLevelIndex(0);
    setCropIndex(0);
    setTargets(levels.map(() => createRandomCrops()));
    setAnswers(levels.map(() => Array<number | null>(cropsPerLevel).fill(null)));
    setScore(0);
    setAttempts(0);
    setPhase('playing');
  }

  function answerCell(cellIndex: number) {
    if (targetCell === undefined || currentAnswers[cropIndex] !== null) return;
    setAnswers((previous) => {
      const next = previous.map((levelAnswers) => [...levelAnswers]);
      next[levelIndex][cropIndex] = cellIndex;
      return next;
    });
    setAttempts((count) => count + 1);
    if (cellIndex === targetCell) setScore((count) => count + 1);
    if (cropIndex < cropsPerLevel - 1) setCropIndex((index) => index + 1);
  }

  function continueLevel() {
    if (levelIndex === levels.length - 1) {
      if (startedAt.current !== null) setElapsed(Date.now() - startedAt.current);
      setPhase('results');
      void recordActivity();
      return;
    }
    setLevelIndex((index) => index + 1);
    setCropIndex(0);
    setCropSize({ width: 0, height: 0 });
  }

  function retrySave() {
    historySave.retry();
  }

  return (
    <MobileFrame>
      {phase === 'intro' ? (
        <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.kicker, { color: palette.primary }]}>ATENÇÃO SELETIVA</Text>
          <Text style={[styles.title, { color: palette.text }]}>ADAS</Text>
          <Text style={[styles.body, { color: palette.muted }]}>
            Observe cada recorte e toque no quadrado correspondente na imagem. São três recortes em cada um dos três níveis.
          </Text>
          {levels.map((level, index) => (
            <Text key={level.name} style={[styles.levelLine, { color: palette.text }]}>
              {index + 1}. {level.name} · {level.difficulty}
            </Text>
          ))}
          <ActionButton label="Iniciar atividade" onPress={beginTest} colors={gradientColors} highContrast={palette.background === theme.colors.highContrast.background} />
        </View>
      ) : null}

      {phase === 'playing' ? (
        <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.kicker, { color: palette.primary }]}>
            NÍVEL {levelIndex + 1} DE {levels.length} · {currentLevel.difficulty.toUpperCase()}
          </Text>
          <Text style={[styles.title, { color: palette.text }]}>{currentLevel.name}</Text>
          <Text style={[styles.body, { color: palette.muted }]}>
            Encontre na grade o quadrado que corresponde ao recorte mostrado.
          </Text>
          <View style={[styles.gridFrame, { aspectRatio: currentLevel.aspectRatio }]}>
            <Image
              accessibilityLabel={`Imagem da ${currentLevel.name} dividida em uma grade de 5 por 5`}
              resizeMode="contain"
              source={currentLevel.image}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.gridCells}>
              {Array.from({ length: gridSize * gridSize }, (_, cellIndex) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar linha ${Math.floor(cellIndex / gridSize) + 1}, coluna ${(cellIndex % gridSize) + 1}`}
                  disabled={currentAnswers[cropIndex] !== null}
                  key={cellIndex}
                  onPress={() => answerCell(cellIndex)}
                  style={({ pressed }) => [styles.gridCell, pressed && styles.gridCellPressed]}
                />
              ))}
            </View>
          </View>
          <Text style={[styles.cropLabel, { color: palette.text }]}>
            Recorte {Math.min(cropIndex + 1, cropsPerLevel)} de {cropsPerLevel}
          </Text>
          {targetCell !== undefined ? (
            <View
              accessibilityLabel={`Recorte ${cropIndex + 1} de ${cropsPerLevel}`}
              style={[styles.cropWindow, { aspectRatio: currentLevel.aspectRatio, borderColor: palette.border }]}
            >
              <View
                onLayout={(event) => {
                  const { width, height } = event.nativeEvent.layout;
                  if (width !== cropSize.width || height !== cropSize.height) setCropSize({ width, height });
                }}
                style={styles.cropViewport}
              >
                {cropSize.width > 0 && cropSize.height > 0 ? (
                  <Image
                    accessibilityLabel="Recorte da imagem"
                    resizeMode="contain"
                    source={currentLevel.image}
                    style={{
                      position: 'absolute',
                      left: -(targetCell % gridSize) * cropSize.width,
                      top: -Math.floor(targetCell / gridSize) * cropSize.height,
                      width: cropSize.width * gridSize,
                      height: cropSize.height * gridSize,
                    }}
                  />
                ) : null}
              </View>
            </View>
          ) : null}
          <Text style={[styles.body, { color: palette.muted }]}>Respostas registradas: {attempts}</Text>
          {cropIndex === cropsPerLevel - 1 && currentAnswers[cropIndex] !== null ? (
            <ActionButton
              label={levelIndex < levels.length - 1 ? 'Próximo nível' : 'Ver resultado'}
              onPress={continueLevel}
              colors={gradientColors}
              highContrast={palette.background === theme.colors.highContrast.background}
            />
          ) : null}
        </View>
      ) : null}

      {phase === 'results' ? (
        <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.kicker, { color: palette.primary }]}>RESULTADO FINAL</Text>
          <Text style={[styles.title, { color: palette.text }]}>ADAS concluído</Text>
          <Text style={[styles.body, { color: palette.muted }]}>Atividade de atenção seletiva concluída.</Text>
          <View style={styles.resultList}>
            <ResultRow label="Pontuação" value={`${score} de ${levels.length * cropsPerLevel}`} palette={palette} />
            <ResultRow label="Recortes respondidos" value={`${attempts} de ${levels.length * cropsPerLevel}`} palette={palette} />
            <ResultRow label="Tempo total" value={formatDuration(Math.floor(elapsed / 1000))} palette={palette} />
          </View>
          {historySave.status === 'saving' ? <Text style={[styles.body, { color: palette.muted }]}>Salvando no histórico...</Text> : null}
          {historySave.status === 'saved' ? <Text style={[styles.body, { color: palette.primary }]}>Resultado salvo no histórico do perfil.</Text> : null}
          {historySave.status === 'error' ? (
            <View>
              <Text accessibilityRole="alert" style={[styles.body, { color: palette.danger }]}>{historySave.error}</Text>
              <Pressable accessibilityRole="button" onPress={retrySave} style={styles.retryButton}>
                <Text style={[styles.retryText, { color: palette.primary }]}>Tentar salvar novamente</Text>
              </Pressable>
            </View>
          ) : null}
          <ShareResultButton report={report} />
          <ActionButton label="Fazer novamente" onPress={() => router.replace('/adaa')} colors={gradientColors} highContrast={palette.background === theme.colors.highContrast.background} />
          <Pressable accessibilityRole="button" onPress={() => router.replace('/home')} style={styles.retryButton}>
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
  palette: Palette;
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
  panel: { gap: theme.spacing[13], padding: theme.spacing[16], borderWidth: theme.sizes[1], borderRadius: theme.radii[12] },
  kicker: { fontSize: theme.typography.fontSize[10], fontWeight: '800', letterSpacing: theme.sizes[0.8] },
  title: { fontSize: theme.typography.fontSize[25], lineHeight: theme.typography.lineHeight[31], fontWeight: '700' },
  body: { fontSize: theme.typography.fontSize[14], lineHeight: theme.typography.lineHeight[21] },
  levelLine: { fontSize: theme.typography.fontSize[13], lineHeight: theme.typography.lineHeight[18], fontWeight: '600' },
  gridFrame: { width: '100%', overflow: 'hidden', position: 'relative', backgroundColor: theme.colors.border },
  gridCells: { ...StyleSheet.absoluteFill, flexDirection: 'row', flexWrap: 'wrap' },
  gridCell: { width: '20%', height: '20%', borderColor: theme.colors.gridBorder, borderWidth: theme.sizes[0.5] },
  gridCellPressed: { backgroundColor: theme.colors.gridPressed, borderColor: theme.colors.white },
  cropLabel: { fontSize: theme.typography.fontSize[14], fontWeight: '700' },
  cropWindow: { width: '100%', maxWidth: theme.sizes[170], alignSelf: 'center', position: 'relative', overflow: 'hidden', borderWidth: theme.sizes[2], borderRadius: theme.radii[8], backgroundColor: theme.colors.border },
  cropViewport: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  resultList: { gap: theme.spacing[7] },
  resultRow: { minHeight: theme.sizes[30], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing[8] },
  resultValue: { fontSize: theme.typography.fontSize[14], fontWeight: '700' },
  actionButton: { width: '100%', minHeight: theme.sizes[48], borderRadius: theme.radii[9], overflow: 'hidden' },
  actionGradient: { minHeight: theme.sizes[48], alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing[14] },
  actionText: { color: theme.colors.white, fontSize: theme.typography.fontSize[15], fontWeight: '700' },
  highContrastActionText: { color: theme.colors.white },
  retryButton: { minHeight: theme.sizes[40], alignItems: 'center', justifyContent: 'center' },
  retryText: { fontSize: theme.typography.fontSize[13], fontWeight: '700' },
});
