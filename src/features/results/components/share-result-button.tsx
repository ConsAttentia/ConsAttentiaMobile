import { theme } from '@/shared/theme';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AccessibleText as Text } from '@/features/accessibility/components/accessibility-text';
import { useAccessiblePalette } from '@/features/dashboard/components/mobile-shell';
import { getUserName } from '@/features/auth/services/auth';
import { auth } from '@/shared/firebase/firebase';
import { type ResultSummary } from '@/features/results/services/result-report';
import { shareResultPdf } from '@/features/results/services/share-result-pdf';

export interface ShareResultButtonProps {
  report: ResultSummary;
}

export function ShareResultButton({ report }: ShareResultButtonProps) {
  const palette = useAccessiblePalette();
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
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: sharing }} disabled={sharing} onPress={handleShare} style={({ pressed }) => [styles.button, { backgroundColor: palette.background === theme.colors.highContrast.background ? theme.colors.highContrast.gradient : theme.colors.shareAction }, pressed && styles.pressed, sharing && styles.disabled]}>
        <Text style={styles.buttonText}>{sharing ? 'Preparando PDF...' : 'Compartilhar'}</Text>
      </Pressable>
      {error ? <Text accessibilityRole="alert" style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: theme.spacing[8] },
  button: { width: '100%', minHeight: theme.sizes[48], paddingHorizontal: theme.spacing[18], borderRadius: theme.radii[8], backgroundColor: theme.colors.shareAction, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.86 },
  disabled: { opacity: 0.65 },
  buttonText: { color: theme.colors.white, fontSize: theme.typography.fontSize[14], fontWeight: '700' },
  error: { color: theme.colors.danger, fontSize: theme.typography.fontSize[12], lineHeight: theme.typography.lineHeight[17], textAlign: 'center' },
});