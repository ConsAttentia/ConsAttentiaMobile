import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MobileFrame, useAccessiblePalette } from '@/components/mobile-shell';
import { recordActivity } from '@/lib/activity';

const pieces = [
  { id: 'principal1', image: require('../../assets/images/consattentia/principal1.jpg'), label: 'Cena 1' },
  { id: 'principal2', image: require('../../assets/images/consattentia/principal2.jpg'), label: 'Cena 2' },
  { id: 'principal3', image: require('../../assets/images/consattentia/principal3.jpg'), label: 'Cena 3' },
  { id: 'principal4', image: require('../../assets/images/consattentia/principal4.jpg'), label: 'Cena 4' },
] as const;

type PieceId = (typeof pieces)[number]['id'];
type Placements = Record<1 | 2 | 3 | 4, PieceId | null>;
const emptyBoard: Placements = { 1: null, 2: null, 3: null, 4: null };
const slots = [1, 2, 3, 4] as const;

export default function ToheScreen() {
  const palette = useAccessiblePalette();
  const [placements, setPlacements] = useState<Placements>(emptyBoard);
  const [selectedPiece, setSelectedPiece] = useState<PieceId | null>(null);
  const [message, setMessage] = useState('');
  const [complete, setComplete] = useState(false);

  function placePiece(slot: 1 | 2 | 3 | 4) {
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

  function finishExperiment() {
    const isCorrect = slots.every((slot) => placements[slot] === `principal${slot}`);
    if (isCorrect) {
      void recordActivity();
      setComplete(true);
      setMessage('');
      return;
    }
    setMessage('Organize todas as cenas na ordem correta para concluir.');
  }

  function resetExperiment() {
    setPlacements({ ...emptyBoard });
    setSelectedPiece(null);
    setMessage('');
    setComplete(false);
  }

  return (
    <MobileFrame>
      <View style={styles.heading}>
        <Text style={[styles.kicker, { color: palette.primary }]}>CONSATTENTIA · TOHE</Text>
        <Text style={[styles.title, { color: palette.text }]}>Organize a história</Text>
        <Text style={[styles.instructions, { color: palette.muted }]}>
          Toque em uma cena e depois no espaço em que ela deve ficar.
        </Text>
      </View>

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
              <View style={[styles.slotBadge, { backgroundColor: palette.primary }]}>
                <Text style={styles.slotBadgeText}>{slot}</Text>
              </View>
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
        <Pressable accessibilityRole="button" onPress={resetExperiment} style={[styles.secondaryButton, { borderColor: palette.primary }]}>
          <Text style={[styles.secondaryText, { color: palette.primary }]}>Limpar</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={finishExperiment} style={[styles.finishButton, { backgroundColor: palette.primary }]}>
          <Text style={styles.finishText}>Concluir</Text>
        </Pressable>
      </View>

      <Modal animationType="fade" onRequestClose={() => setComplete(false)} transparent visible={complete}>
        <View style={styles.successBackdrop}>
          <View style={[styles.successPanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.successKicker, { color: palette.primary }]}>CONSATTENTIA · TOHE</Text>
            <Text style={[styles.successTitle, { color: palette.text }]}>Parabéns!</Text>
            <Text style={[styles.successCopy, { color: palette.muted }]}>Você organizou as quatro cenas na ordem correta.</Text>
            <Pressable accessibilityRole="button" onPress={() => router.replace('/selecao')} style={[styles.finishButton, { backgroundColor: palette.primary }]}>
              <Text style={styles.finishText}>Voltar aos experimentos</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={resetExperiment} style={styles.tryAgainButton}>
              <Text style={[styles.secondaryText, { color: palette.primary }]}>Tentar novamente</Text>
            </Pressable>
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
  finishButton: { flex: 1, minHeight: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  finishText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  successBackdrop: { flex: 1, padding: 22, justifyContent: 'center', backgroundColor: 'rgba(10, 30, 33, 0.72)' },
  successPanel: { borderWidth: 1, borderRadius: 12, padding: 24, alignItems: 'center', gap: 12 },
  successKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  successTitle: { fontSize: 29, fontWeight: '700' },
  successCopy: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  tryAgainButton: { minHeight: 42, justifyContent: 'center' },
});
