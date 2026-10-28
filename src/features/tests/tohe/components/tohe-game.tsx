import { theme } from '@/shared/theme';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AccessibleText as Text } from '@/features/accessibility/components/accessibility-text';
import { getBrandGradientColors, MobileFrame, useAccessiblePalette } from '@/features/dashboard/components/mobile-shell';
import { ShareResultButton } from '@/features/results/components/share-result-button';
import { useAccessibility } from '@/features/accessibility/context/accessibility-context';
import { recordActivity } from '@/features/activity/services/activity';
import { formatDuration } from '@/features/results/services/result-report';
import { useCompletedTestHistory } from '@/features/results/hooks/use-completed-test-history';

export type TohePiece = {
  id: string;
  image: ImageSourcePropType;
  label: string;
};

export type ToheStory = {
  id: string;
  label: string;
  pieces: readonly TohePiece[];
};

export type ToheStage = {
  id: string;
  label: string;
  stories?: readonly ToheStory[];
  placeholderImage?: ImageSourcePropType;
};

type Placements = Record<number, string | null>;

export interface ToheGameProps {
  stages: readonly ToheStage[];
}

function createEmptyBoard(slots: number[]): Placements {
  return Object.fromEntries(slots.map((slot) => [slot, null]));
}

function shufflePieces(pieces: readonly TohePiece[]) {
  const shuffled = [...pieces];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function pickRandomStory(stories: readonly ToheStory[]) {
  if (!stories.length) return null;
  return stories[Math.floor(Math.random() * stories.length)] ?? null;
}

export function ToheGame({ stages }: ToheGameProps) {
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);
  const { shouldReduceMotion } = useAccessibility();
  const [stageIndex, setStageIndex] = useState(0);
  const stage = stages[stageIndex];
  const [currentStory, setCurrentStory] = useState<ToheStory | null>(() => pickRandomStory(stage?.stories ?? []));
  const expectedPieces = currentStory?.pieces ?? [];
  const [shuffledPieces, setShuffledPieces] = useState(() => shufflePieces(expectedPieces));
  const pieces = shuffledPieces;
  const slots = expectedPieces.map((_, index) => index + 1);
  const [placements, setPlacements] = useState<Placements>(() => createEmptyBoard(expectedPieces.map((_, index) => index + 1)));
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [complete, setComplete] = useState(false);
  const [readyPlaceholderStage, setReadyPlaceholderStage] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const startedAt = useRef<number | null>(null);

  function prepareStory(nextStage: ToheStage, now: number) {
    const nextStory = pickRandomStory(nextStage.stories ?? []);
    const nextPieces = nextStory?.pieces ?? [];
    setCurrentStory(nextStory);
    setShuffledPieces(shufflePieces(nextPieces));
    setPlacements(createEmptyBoard(nextPieces.map((_, index) => index + 1)));
    setSelectedPiece(null);
    setMessage('');
    setComplete(false);
    setReadyPlaceholderStage(null);
    setAttemptCount(0);
    startedAt.current = now;
    setElapsedSeconds(0);
  }

  function changeStage(nextIndex: number, now: number) {
    const nextStage = stages[nextIndex];
    if (!nextStage) return;
    setStageIndex(nextIndex);
    prepareStory(nextStage, now);
  }

  useEffect(() => {
    if (complete) return;
    if (startedAt.current === null) startedAt.current = Date.now();
    const startTime = startedAt.current;

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [complete]);

  useEffect(() => {
    if (!stage?.placeholderImage) return;
    const timeout = setTimeout(() => setReadyPlaceholderStage(stageIndex), 450);
    return () => clearTimeout(timeout);
  }, [stageIndex, stage?.placeholderImage]);

  const elapsedLabel = formatDuration(elapsedSeconds);

  function placePiece(slot: number) {
    if (!selectedPiece) {
      setMessage('Primeiro toque em uma cena; depois escolha o espaço.');
      return;
    }

    setPlacements((current) => {
      const next: Placements = { ...current };
      slots.forEach((currentSlot) => {
        if (next[currentSlot] === selectedPiece) next[currentSlot] = null;
      });
      next[slot] = selectedPiece;
      return next;
    });
    setSelectedPiece(null);
    setMessage('');
  }

  const placeholderReady = !stage?.placeholderImage || readyPlaceholderStage === stageIndex;

  function finishExperiment(completedAt: number) {
    if (stage?.placeholderImage) {
      if (!placeholderReady) return;
      if (startedAt.current !== null) {
        setElapsedSeconds(Math.floor((completedAt - startedAt.current) / 1000));
      }
      void recordActivity();
      setComplete(true);
      setMessage('');
      return;
    }

    if (!currentStory) return;

    setAttemptCount((count) => count + 1);
    const isCorrect = slots.every((slot) => placements[slot] === expectedPieces[slot - 1]?.id);
    if (isCorrect) {
      if (startedAt.current !== null) {
        setElapsedSeconds(Math.floor((completedAt - startedAt.current) / 1000));
      }
      setComplete(true);
      setMessage('');
      return;
    }
    setMessage('Organize todas as cenas na ordem correta para concluir.');
  }

  function resetExperiment(now: number) {
    if (!stage) return;
    prepareStory(stage, now);
  }

  function advanceStage(now: number) {
    const nextIndex = stageIndex + 1;
    if (nextIndex >= stages.length) return;
    changeStage(nextIndex, now);
  }

  function restartExperiment(now: number) {
    changeStage(0, now);
  }

  const isFinalStage = stageIndex === stages.length - 1;
  const resultReport = {
    testName: 'TOHE · Organização de histórias',
    durationSeconds: elapsedSeconds,
    attempts: attemptCount,
    attemptsLabel: 'tentativas',
    score: 70,
    scoreLabel: 'de 70 pontos',
    details: [
      { label: 'Nível Fácil', value: '3 cenas organizadas corretamente' },
      { label: 'Nível Médio', value: '4 cenas organizadas corretamente' },
      { label: 'Acertos', value: '7 de 7 cenas' },
      { label: 'Critério de pontuação', value: '10 pontos por cena correta' },
      { label: 'Nível Difícil', value: 'Etapa demonstrativa; não incluída na pontuação' },
    ],
  };
  const historySave = useCompletedTestHistory(resultReport, complete && isFinalStage);

  return (
    <MobileFrame>
      <View style={styles.levelSelector}>
        {stages.map((item, index) => {
          const selected = index === stageIndex;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={item.id}
              onPress={() => changeStage(index, Date.now())}
              style={[
                styles.levelButton,
                {
                  backgroundColor: selected ? palette.surface : 'transparent',
                  borderColor: selected ? palette.primary : palette.border,
                },
              ]}>
              <Text style={[styles.levelButtonText, { color: selected ? palette.primary : palette.muted }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.heading}>
        <Text style={[styles.kicker, { color: palette.primary }]}>CONSATTENTIA · TOHE · {stage?.label}</Text>
        <Text style={[styles.title, { color: palette.text }]}>{stage?.placeholderImage ? 'Nível difícil' : `Organize a história · ${currentStory?.label ?? stage?.label}`}</Text>
        <Text style={[styles.instructions, { color: palette.muted }]}>
          {stage?.placeholderImage ? 'Esta etapa está em desenvolvimento.' : 'Toque em uma cena e depois no espaço em que ela deve ficar.'}
        </Text>
      </View>

      {stage?.placeholderImage ? (
        <View style={[styles.placeholderStage, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Image accessibilityLabel="Imagem ilustrativa do nível difícil" resizeMode="contain" source={stage.placeholderImage} style={styles.placeholderImage} />
          <Text style={[styles.placeholderCopy, { color: palette.muted }]}>Mais cenas e atividades para este nível serão adicionadas em breve.</Text>
        </View>
      ) : (
        <>
          <View style={styles.board}>
            {slots.map((slot) => {
              const piece = pieces.find((item) => item.id === placements[slot]);
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={piece ? `Posição ${slot} preenchida com ${piece.label}. Toque para substituir.` : `Posição ${slot} vazia`}
                  key={slot}
                  onPress={() => placePiece(slot)}
                  style={({ pressed }) => [
                    styles.slot,
                    { backgroundColor: palette.surface, borderColor: selectedPiece ? palette.primary : palette.border },
                    pressed && styles.pressed,
                  ]}>
                  {piece ? (
                    <Image accessibilityLabel={piece.label} resizeMode="contain" source={piece.image} style={styles.slotImage} />
                  ) : (
                    <Text style={[styles.slotNumber, { color: palette.muted }]}>{slot}</Text>
                  )}
                  <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.slotBadge}>
                    <Text style={styles.slotBadgeText}>{slot}</Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.pieceSection}>
            <Text style={[styles.sectionLabel, { color: palette.text }]}>CENAS</Text>
            <ScrollView
              contentContainerStyle={styles.pieces}
              horizontal
              showsHorizontalScrollIndicator={false}>
              {pieces.map((piece) => {
                const isSelected = selectedPiece === piece.id;
                const placedSlot = slots.find((slot) => placements[slot] === piece.id);
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Imagem ${piece.label}${placedSlot ? `, posicionada no espaço ${placedSlot}` : ''}`}
                    accessibilityState={{ selected: isSelected }}
                    key={piece.id}
                    onPress={() => {
                      setSelectedPiece(isSelected ? null : piece.id);
                      setMessage('');
                    }}
                    style={[
                      styles.pieceButton,
                      { borderColor: isSelected ? palette.primary : palette.border, backgroundColor: palette.surface },
                      isSelected && !shouldReduceMotion && styles.selectedPiece,
                    ]}>
                    <Image accessibilityLabel={piece.label} resizeMode="contain" source={piece.image} style={styles.pieceImage} />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {message ? (
            <View accessibilityRole="alert" style={[styles.message, { borderColor: palette.border, backgroundColor: palette.surface }]}>
              <Text style={[styles.messageText, { color: palette.text }]}>{message}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={() => resetExperiment(Date.now())} style={[styles.secondaryButton, { borderColor: palette.primary }]}>
              <Text style={[styles.secondaryText, { color: palette.primary }]}>Limpar</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => finishExperiment(Date.now())} style={styles.compactFinishButton}>
              <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.compactFinishGradient}>
                <Text style={styles.finishText}>Concluir nível</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </>
      )}

      {stage.placeholderImage ? (
        <Pressable accessibilityRole="button" disabled={!placeholderReady} onPress={() => finishExperiment(Date.now())} style={[styles.finalStageButton, !placeholderReady && styles.disabledButton]}>
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.compactFinishGradient}>
            <Text style={styles.finishText}>Finalizar teste</Text>
          </LinearGradient>
        </Pressable>
      ) : null}

      <Modal animationType={shouldReduceMotion ? 'none' : 'fade'} onRequestClose={() => setComplete(false)} transparent visible={complete}>
        <View style={styles.successBackdrop}>
          <ScrollView contentContainerStyle={styles.successScroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.successPanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.successKicker, { color: palette.primary }]}>CONSATTENTIA · TOHE</Text>
            <Text style={[styles.successTitle, { color: palette.text }]}>{isFinalStage ? 'Teste concluído!' : 'Nível concluído!'}</Text>
            <Text style={[styles.successCopy, { color: palette.muted }]}>
              {isFinalStage ? 'Você concluiu as etapas disponíveis do TOHE.' : `Você organizou as ${pieces.length} cenas na ordem correta.`}
            </Text>
            <Text style={[styles.successTime, { color: palette.muted }]}>Tempo para concluir: {elapsedLabel}</Text>
            <Text style={[styles.successTime, { color: palette.muted }]}>{attemptCount === 1 ? '1 tentativa' : `${attemptCount} tentativas`}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => isFinalStage ? router.replace({ pathname: '/home', params: { openTests: '1' } }) : advanceStage(Date.now())}
              style={[styles.finishButton, styles.successAction]}
            >
              <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.finishGradient}>
                <Text style={styles.finishText}>{isFinalStage ? 'Voltar aos experimentos' : `Continuar para ${stages[stageIndex + 1]?.label}`}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => isFinalStage ? restartExperiment(Date.now()) : resetExperiment(Date.now())} style={styles.tryAgainButton}>
              <Text style={[styles.secondaryText, { color: palette.primary }]}>{isFinalStage ? 'Reiniciar teste' : 'Tentar novamente'}</Text>
            </Pressable>
            {isFinalStage ? <ShareResultButton report={resultReport} /> : null}
            {isFinalStage && historySave.status === 'saving' ? (
              <Text style={[styles.successTime, { color: palette.muted }]}>Salvando no histórico...</Text>
            ) : null}
            {isFinalStage && historySave.status === 'saved' ? (
              <Text style={[styles.successTime, { color: palette.primary }]}>Resultado salvo no histórico do perfil.</Text>
            ) : null}
            {isFinalStage && historySave.status === 'error' ? (
              <View>
                <Text accessibilityRole="alert" style={[styles.successTime, { color: palette.danger }]}>{historySave.error}</Text>
                <Pressable accessibilityRole="button" onPress={historySave.retry} style={styles.tryAgainButton}>
                  <Text style={[styles.secondaryText, { color: palette.primary }]}>Tentar salvar novamente</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
          </ScrollView>
        </View>
      </Modal>
    </MobileFrame>
  );
}

const styles = StyleSheet.create({
  levelSelector: { flexDirection: 'row', gap: theme.spacing[8], marginBottom: theme.spacing[8] },
  levelButton: { flex: 1, minHeight: theme.sizes[40], borderWidth: theme.sizes[1], borderRadius: theme.radii[8], alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing[8] },
  levelButtonText: { fontSize: theme.typography.fontSize[12], fontWeight: '700' },
  heading: { gap: theme.spacing[6] },
  kicker: { fontSize: theme.typography.fontSize[10], fontWeight: '800', letterSpacing: theme.sizes[1] },
  title: { fontSize: theme.typography.fontSize[24], lineHeight: theme.typography.lineHeight[30], fontWeight: '700' },
  instructions: { fontSize: theme.typography.fontSize[13], lineHeight: theme.typography.lineHeight[19] },
  board: { flexDirection: 'column', gap: theme.spacing[10] },
  slot: { width: '100%', minHeight: theme.sizes[104], overflow: 'hidden', borderWidth: theme.sizes[2], borderRadius: theme.radii[8], alignItems: 'center', justifyContent: 'center' },
  slotImage: { width: '100%', maxWidth: theme.sizes[285], aspectRatio: 3 },
  slotNumber: { fontSize: theme.typography.fontSize[42], fontWeight: '300' },
  placeholderStage: { minHeight: theme.sizes[280], padding: theme.spacing[20], borderWidth: theme.sizes[1], borderRadius: theme.radii[8], alignItems: 'center', justifyContent: 'center', gap: theme.spacing[16] },
  placeholderImage: { width: '100%', maxWidth: theme.sizes[260], height: theme.sizes[170] },
  placeholderCopy: { maxWidth: theme.sizes[280], fontSize: theme.typography.fontSize[14], lineHeight: theme.typography.lineHeight[21], textAlign: 'center' },
  slotBadge: { position: 'absolute', top: theme.spacing[7], left: theme.spacing[7], width: theme.sizes[25], height: theme.sizes[25], borderRadius: theme.radii[13], alignItems: 'center', justifyContent: 'center' },
  slotBadgeText: { color: theme.colors.white, fontSize: theme.typography.fontSize[12], fontWeight: '800' },
  pieceSection: { gap: theme.spacing[10] },
  sectionLabel: { fontSize: theme.typography.fontSize[12], fontWeight: '800', letterSpacing: theme.sizes[0.8] },
  pieces: { flexDirection: 'row', gap: theme.spacing[10], paddingRight: theme.spacing[20] },
  pieceButton: { width: theme.sizes[132], overflow: 'hidden', borderWidth: theme.sizes[2], borderRadius: theme.radii[8] },
  selectedPiece: { borderWidth: theme.sizes[3], transform: [{ scale: 0.98 }] },
  pieceImage: { width: '100%', height: theme.sizes[96] },
  pressed: { opacity: 0.8 },
  message: { padding: theme.spacing[12], borderWidth: theme.sizes[1], borderRadius: theme.radii[8] },
  messageText: { fontSize: theme.typography.fontSize[13], lineHeight: theme.typography.lineHeight[19] },
  actions: { flexDirection: 'row', gap: theme.spacing[10] },
  secondaryButton: { flex: 1, minHeight: theme.sizes[48], borderWidth: theme.sizes[1], borderRadius: theme.radii[8], alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: theme.typography.fontSize[14], fontWeight: '700' },
  finishButton: { flex: 1, minHeight: theme.sizes[48], borderRadius: theme.radii[8], overflow: 'hidden' },
  compactFinishButton: { flex: 1, minHeight: theme.sizes[40], borderRadius: theme.radii[8], overflow: 'hidden' },
  finalStageButton: { width: '100%', maxWidth: theme.sizes[280], minHeight: theme.sizes[48], alignSelf: 'center', borderRadius: theme.radii[8], overflow: 'hidden' },
  successAction: { width: '100%', maxWidth: theme.sizes[300], minHeight: theme.sizes[48], alignSelf: 'center', flex: 0 },
  disabledButton: { opacity: 0.55 },
  finishGradient: { flex: 1, minHeight: theme.sizes[48], alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing[14] },
  compactFinishGradient: { flex: 1, minHeight: theme.sizes[40], alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing[14] },
  finishText: { color: theme.colors.white, fontSize: theme.typography.fontSize[14], fontWeight: '700', textAlign: 'center' },
  successBackdrop: { flex: 1, padding: theme.spacing[22], justifyContent: 'center', backgroundColor: theme.colors.modalBackdrop },
  successScroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: theme.spacing[8] },
  successPanel: { width: '100%', maxWidth: theme.sizes[440], alignSelf: 'center', borderWidth: theme.sizes[1], borderRadius: theme.radii[12], padding: theme.spacing[20], alignItems: 'center', gap: theme.spacing[12] },
  successKicker: { fontSize: theme.typography.fontSize[10], fontWeight: '800', letterSpacing: theme.sizes[1] },
  successTitle: { fontSize: theme.typography.fontSize[29], fontWeight: '700' },
  successCopy: { fontSize: theme.typography.fontSize[14], lineHeight: theme.typography.lineHeight[20], textAlign: 'center' },
  successTime: { fontSize: theme.typography.fontSize[13], lineHeight: theme.typography.lineHeight[18], textAlign: 'center' },
  tryAgainButton: { minHeight: theme.sizes[42], justifyContent: 'center' },
});