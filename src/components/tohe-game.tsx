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
  Text,
  View,
} from 'react-native';

import { getBrandGradientColors, MobileFrame, useAccessiblePalette } from '@/components/mobile-shell';
import { ShareResultButton } from '@/components/share-result-button';
import { recordActivity } from '@/lib/activity';
import { formatDuration } from '@/lib/result-report';

export type TohePiece = {
  id: string;
  image: ImageSourcePropType;
  label: string;
};

export type ToheStage = {
  label: string;
  pieces?: readonly TohePiece[];
  placeholderImage?: ImageSourcePropType;
};

type Placements = Record<number, string | null>;

function createEmptyBoard(slots: number[]): Placements {
  return Object.fromEntries(slots.map((slot) => [slot, null]));
}

export function ToheGame({ stages }: { stages: readonly ToheStage[] }) {
  const palette = useAccessiblePalette();
  const gradientColors = getBrandGradientColors(palette);
  const [stageIndex, setStageIndex] = useState(0);
  const stage = stages[stageIndex];
  const pieces = stage.pieces ?? [];
  const slots = pieces.map((_, index) => index + 1);
  const [placements, setPlacements] = useState<Placements>(() => createEmptyBoard((stages[0]?.pieces ?? []).map((_, index) => index + 1)));
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [complete, setComplete] = useState(false);
  const [readyPlaceholderStage, setReadyPlaceholderStage] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const startedAt = useRef<number | null>(null);

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
    if (!stage.placeholderImage) return;
    const timeout = setTimeout(() => setReadyPlaceholderStage(stageIndex), 450);
    return () => clearTimeout(timeout);
  }, [stageIndex, stage.placeholderImage]);

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

  const placeholderReady = !stage.placeholderImage || readyPlaceholderStage === stageIndex;

  function finishExperiment(completedAt: number) {
    if (stage.placeholderImage) {
      if (!placeholderReady) return;
      if (startedAt.current !== null) {
        setElapsedSeconds(Math.floor((completedAt - startedAt.current) / 1000));
      }
      void recordActivity();
      setComplete(true);
      setMessage('');
      return;
    }

    setAttemptCount((count) => count + 1);
    const isCorrect = slots.every((slot) => placements[slot] === pieces[slot - 1]?.id);
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
    setPlacements(createEmptyBoard(slots));
    setSelectedPiece(null);
    setMessage('');
    setComplete(false);
    startedAt.current = now;
    setElapsedSeconds(0);
  }

  function advanceStage() {
    const nextIndex = stageIndex + 1;
    const nextStage = stages[nextIndex];
    if (!nextStage) return;
    setPlacements(createEmptyBoard((nextStage.pieces ?? []).map((_, index) => index + 1)));
    setSelectedPiece(null);
    setMessage('');
    setStageIndex(nextIndex);
    setReadyPlaceholderStage(null);
    setComplete(false);
  }

  function restartExperiment(now: number) {
    const firstStage = stages[0];
    setPlacements(createEmptyBoard((firstStage?.pieces ?? []).map((_, index) => index + 1)));
    setSelectedPiece(null);
    setMessage('');
    setStageIndex(0);
    setReadyPlaceholderStage(null);
    setComplete(false);
    setAttemptCount(0);
    startedAt.current = now;
    setElapsedSeconds(0);
  }

  const isFinalStage = stageIndex === stages.length - 1;
  const resultReport = {
    testName: 'TOHE · Organização de histórias',
    durationSeconds: elapsedSeconds,
    attempts: attemptCount,
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

  return (
    <MobileFrame>
      <View style={styles.heading}>
        <Text style={[styles.kicker, { color: palette.primary }]}>CONSATTENTIA · TOHE · {stage.label}</Text>
        <Text style={[styles.title, { color: palette.text }]}>{stage.placeholderImage ? 'Nível difícil' : 'Organize a história'}</Text>
        <Text style={[styles.instructions, { color: palette.muted }]}>
          {stage.placeholderImage ? 'Esta etapa está em desenvolvimento.' : 'Toque em uma cena e depois no espaço em que ela deve ficar.'}
        </Text>
      </View>

      {stage.placeholderImage ? (
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
                  accessibilityLabel={piece ? `Espaço ${slot}, ${piece.label}. Toque para substituir.` : `Espaço vazio ${slot}`}
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
                    accessibilityLabel={`${piece.label}${placedSlot ? `, no espaço ${placedSlot}` : ''}`}
                    accessibilityState={{ selected: isSelected }}
                    key={piece.id}
                    onPress={() => {
                      setSelectedPiece(isSelected ? null : piece.id);
                      setMessage('');
                    }}
                    style={[
                      styles.pieceButton,
                      { borderColor: isSelected ? palette.primary : palette.border, backgroundColor: palette.surface },
                      isSelected && styles.selectedPiece,
                    ]}>
                    <Image accessibilityLabel={piece.label} resizeMode="contain" source={piece.image} style={styles.pieceImage} />
                    <Text style={[styles.pieceLabel, { color: palette.text }]}>
                      {placedSlot ? `Espaço ${placedSlot}` : piece.label}
                    </Text>
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
            <Pressable accessibilityRole="button" onPress={() => finishExperiment(Date.now())} style={styles.finishButton}>
              <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.finishGradient}>
                <Text style={styles.finishText}>Concluir nível</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </>
      )}

      {stage.placeholderImage ? (
        <Pressable accessibilityRole="button" disabled={!placeholderReady} onPress={() => finishExperiment(Date.now())} style={[styles.finishButton, !placeholderReady && styles.disabledButton]}>
          <LinearGradient colors={gradientColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.finishGradient}>
            <Text style={styles.finishText}>Finalizar teste</Text>
          </LinearGradient>
        </Pressable>
      ) : null}

      <Modal animationType="fade" onRequestClose={() => setComplete(false)} transparent visible={complete}>
        <View style={styles.successBackdrop}>
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
              onPress={() => isFinalStage ? router.replace({ pathname: '/home', params: { openTests: '1' } }) : advanceStage()}
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
          </View>
        </View>
      </Modal>
    </MobileFrame>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 6 },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  instructions: { fontSize: 13, lineHeight: 19 },
  board: { flexDirection: 'column', gap: 10 },
  slot: { width: '100%', minHeight: 104, overflow: 'hidden', borderWidth: 2, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  slotImage: { width: '100%', maxWidth: 285, aspectRatio: 3 },
  slotNumber: { fontSize: 42, fontWeight: '300' },
  placeholderStage: { minHeight: 280, padding: 20, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 16 },
  placeholderImage: { width: '100%', maxWidth: 260, height: 170 },
  placeholderCopy: { maxWidth: 280, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  slotBadge: { position: 'absolute', top: 7, left: 7, width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  slotBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  pieceSection: { gap: 10 },
  sectionLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  pieces: { flexDirection: 'row', gap: 10, paddingRight: 20 },
  pieceButton: { width: 285, maxWidth: 285, overflow: 'hidden', borderWidth: 2, borderRadius: 8 },
  selectedPiece: { borderWidth: 3, transform: [{ scale: 0.98 }] },
  pieceImage: { width: '100%', height: 95 },
  pieceLabel: { paddingVertical: 7, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  pressed: { opacity: 0.8 },
  message: { padding: 12, borderWidth: 1, borderRadius: 8 },
  messageText: { fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 10 },
  secondaryButton: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 14, fontWeight: '700' },
  finishButton: { flex: 1, minHeight: 48, borderRadius: 8, overflow: 'hidden' },
  successAction: { width: '100%', flex: 0 },
  disabledButton: { opacity: 0.55 },
  finishGradient: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  finishText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  successBackdrop: { flex: 1, padding: 22, justifyContent: 'center', backgroundColor: 'rgba(10, 30, 33, 0.72)' },
  successPanel: { borderWidth: 1, borderRadius: 12, padding: 24, alignItems: 'center', gap: 12 },
  successKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  successTitle: { fontSize: 29, fontWeight: '700' },
  successCopy: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  successTime: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  tryAgainButton: { minHeight: 42, justifyContent: 'center' },
});