import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getUserName } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { type ResultSummary } from '@/lib/result-report';
import { shareResultPdf } from '../lib/share-result-pdf';

export function ShareResultButton({ report }: { report: ResultSummary }) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');

  async function handleShare() {
    setSharing(true);
    setError('');
    const user = auth?.currentUser;

    try {
      await shareResultPdf({
        ...report,
        userName: user ? getUserName(user) : 'Usuário',
        generatedAt: new Date().toLocaleString('pt-BR'),
      });
    } catch (shareError) {
      if (shareError instanceof Error && shareError.name === 'AbortError') return;
      const reason = shareError instanceof Error ? shareError.message : '';
      setError(reason ? `Não foi possível gerar ou compartilhar o relatório: ${reason}` : 'Não foi possível gerar ou compartilhar o relatório. Tente novamente.');
    } finally {
      setSharing(false);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: sharing }} disabled={sharing} onPress={handleShare} style={({ pressed }) => [styles.button, pressed && styles.pressed, sharing && styles.disabled]}>
        <Text style={styles.buttonText}>{sharing ? 'Preparando PDF...' : 'Compartilhar'}</Text>
      </Pressable>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 8 },
  button: { width: '100%', minHeight: 48, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#C83F3F', alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.86 },
  disabled: { opacity: 0.65 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  error: { color: '#A13434', fontSize: 12, lineHeight: 17, textAlign: 'center' },
});