import { theme } from '@/shared/theme';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AccessibleText as Text } from '@/features/accessibility/components/accessibility-text';
import { AuthButton, AuthField } from '@/features/auth/components/auth-ui';
import { ShareResultButton } from '@/features/results/components/share-result-button';
import { UtilityPage } from '@/features/dashboard/components/utility-page';
import { useAccessiblePalette } from '@/features/dashboard/components/mobile-shell';
import { getUserName, updateAccountName, updateAccountPassword } from '@/features/auth/services/auth';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { notifyAuthError } from '@/features/auth/utils/auth-notifications';
import { readTestHistory, type SavedTestResult } from '@/features/results/services/test-history';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user ? getUserName(user) : '');
  const [nameUserId, setNameUserId] = useState<string | null>(user?.uid ?? null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [nameNotice, setNameNotice] = useState('');
  const [nameNoticeIsError, setNameNoticeIsError] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState('');
  const [passwordNoticeIsError, setPasswordNoticeIsError] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [historyResult, setHistoryResult] = useState<{
    userId: string;
    entries: SavedTestResult[];
    error: string | null;
  } | null>(null);
  const palette = useAccessiblePalette();
  const historyLoading = Boolean(user && historyResult?.userId !== user.uid);
  const historyMatchesUser = Boolean(user && historyResult?.userId === user.uid);
  const historyError = historyMatchesUser ? historyResult?.error ?? '' : '';
  const testHistory = historyMatchesUser ? historyResult?.entries ?? [] : [];
  const displayedName = user && nameUserId === user.uid ? name : user ? getUserName(user) : '';

  useEffect(() => {
    if (!user) return;

    let active = true;
    readTestHistory(user.uid)
      .then((history) => {
        if (active) setHistoryResult({ userId: user.uid, entries: history, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setHistoryResult({
          userId: user.uid,
          entries: [],
          error: error instanceof Error ? error.message : 'Não foi possível carregar o histórico de atividades.',
        });
      });

    return () => {
      active = false;
    };
  }, [user]);

  async function saveName() {
    if (!user) return;
    const normalizedName = displayedName.trim();
    setNameNotice('');
    if (!normalizedName) {
      setNameNotice('Digite um nome para continuar.');
      setNameNoticeIsError(true);
      return;
    }

    setSavingName(true);
    try {
      await updateAccountName(user, normalizedName);
      setNameUserId(user.uid);
      setName(normalizedName);
      setNameNotice('Nome atualizado com sucesso.');
      setNameNoticeIsError(false);
    } catch (error) {
      setNameNotice(notifyAuthError(error, 'Falha ao atualizar o perfil'));
      setNameNoticeIsError(true);
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword() {
    if (!user) return;
    setPasswordNotice('');
    if (!currentPassword || !newPassword) {
      setPasswordNotice('Preencha a senha atual e a nova senha.');
      setPasswordNoticeIsError(true);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordNotice('A nova senha precisa ter pelo menos 6 caracteres.');
      setPasswordNoticeIsError(true);
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordNotice('A nova senha precisa ser diferente da atual.');
      setPasswordNoticeIsError(true);
      return;
    }

    setSavingPassword(true);
    try {
      await updateAccountPassword(user, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPasswordNotice('Senha atualizada. Use a nova senha no próximo login.');
      setPasswordNoticeIsError(false);
    } catch (error) {
      setPasswordNotice(notifyAuthError(error, 'Falha ao atualizar a senha'));
      setPasswordNoticeIsError(true);
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleLogout() {
    setLogoutNotice('');
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      setLogoutNotice(notifyAuthError(error, 'Falha ao sair da conta'));
      setLoggingOut(false);
    }
  }

  return (
    <UtilityPage
      eyebrow="SUA CONTA"
      title="Perfil"
      description="Gerencie seus dados e sua senha.">
      <View style={[styles.profile, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <View style={[styles.avatar, { backgroundColor: palette.primary }]}>
          <Text style={[styles.avatarText, palette.background === theme.colors.highContrast.background && styles.highContrastAvatarText]}>{name.charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.details}>
          <Text style={[styles.label, { color: palette.muted }]}>E-mail da conta</Text>
          <Text style={[styles.value, { color: palette.text }]}>{user?.email ?? 'Carregando perfil...'}</Text>
        </View>
      </View>

      <View style={[styles.formSection, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Nome do perfil</Text>
        <AuthField autoCapitalize="words" autoComplete="name" label="Nome completo" onChangeText={(value) => { setNameUserId(user?.uid ?? null); setName(value); }} placeholder="Seu nome" returnKeyType="done" value={displayedName} />
        <AuthButton busy={savingName} label="Salvar nome" onPress={saveName} />
        {nameNotice ? <Text style={[styles.notice, { color: nameNoticeIsError ? palette.danger : palette.primary }]}>{nameNotice}</Text> : null}
      </View>

      <View style={[styles.formSection, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Alterar senha</Text>
        <AuthField autoCapitalize="none" autoComplete="current-password" label="Senha atual" onChangeText={setCurrentPassword} placeholder="Confirme sua senha atual" returnKeyType="next" secureTextEntry value={currentPassword} />
        <AuthField autoCapitalize="none" autoComplete="new-password" label="Nova senha" onChangeText={setNewPassword} onSubmitEditing={savePassword} placeholder="Mínimo de 6 caracteres" returnKeyType="done" secureTextEntry value={newPassword} />
        <AuthButton busy={savingPassword} label="Atualizar senha" onPress={savePassword} />
        {passwordNotice ? <Text style={[styles.notice, { color: passwordNoticeIsError ? palette.danger : palette.primary }]}>{passwordNotice}</Text> : null}
      </View>

      <View style={[styles.formSection, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Histórico de atividades</Text>
        {historyLoading ? <Text style={[styles.notice, { color: palette.muted }]}>Carregando resultados...</Text> : null}
        {historyError ? <Text accessibilityRole="alert" style={[styles.notice, { color: palette.danger }]}>{historyError}</Text> : null}
        {!historyLoading && !historyError && testHistory.length === 0 ? (
          <Text style={[styles.notice, { color: palette.muted }]}>Os resultados das atividades concluídas aparecerão aqui.</Text>
        ) : null}
        {testHistory.map((entry) => (
          <View key={entry.id} style={[styles.historyEntry, { borderColor: palette.border }]}>
            <Text style={[styles.historyTitle, { color: palette.text }]}>{entry.testName}</Text>
            <Text style={[styles.notice, { color: palette.muted }]}>
              {new Date(entry.generatedAt).toLocaleString('pt-BR')} · {entry.score} {entry.scoreLabel} · {entry.attempts} {entry.attemptsLabel ?? 'respostas'}
            </Text>
            <ShareResultButton report={entry} />
          </View>
        ))}
      </View>

      <Pressable accessibilityRole="button" disabled={loggingOut} onPress={handleLogout} style={[styles.logoutButton, { borderColor: palette.danger, backgroundColor: palette.surface }]}>
        <Text style={[styles.logoutText, { color: palette.danger }]}>{loggingOut ? 'Saindo...' : 'Sair e voltar para o login'}</Text>
      </Pressable>
      {logoutNotice ? <Text style={[styles.notice, { color: palette.danger }]}>{logoutNotice}</Text> : null}
    </UtilityPage>
  );
}

const styles = StyleSheet.create({
  profile: { borderWidth: theme.sizes[1], borderRadius: theme.radii[8], padding: theme.spacing[16], flexDirection: 'row', alignItems: 'center', gap: theme.spacing[14] },
  avatar: { width: theme.sizes[56], height: theme.sizes[56], borderRadius: theme.radii[28], alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: theme.colors.white, fontSize: theme.typography.fontSize[23], fontWeight: '700' },
  highContrastAvatarText: { color: theme.colors.black },
  details: { flex: 1, minWidth: theme.sizes[0], gap: theme.spacing[4] },
  label: { fontSize: theme.typography.fontSize[12], lineHeight: theme.typography.lineHeight[17] },
  value: { fontSize: theme.typography.fontSize[15], lineHeight: theme.typography.lineHeight[21], fontWeight: '600' },
  formSection: { borderWidth: theme.sizes[1], borderRadius: theme.radii[8], padding: theme.spacing[16], gap: theme.spacing[8] },
  historyEntry: { borderTopWidth: theme.sizes[1], paddingTop: theme.spacing[12], gap: theme.spacing[8] },
  historyTitle: { fontSize: theme.typography.fontSize[14], lineHeight: theme.typography.lineHeight[19], fontWeight: '700' },
  sectionTitle: { fontSize: theme.typography.fontSize[16], lineHeight: theme.typography.lineHeight[22], fontWeight: '700' },
  notice: { fontSize: theme.typography.fontSize[12], lineHeight: theme.typography.lineHeight[17] },
  logoutButton: { minHeight: theme.sizes[48], borderWidth: theme.sizes[1], borderRadius: theme.radii[8], alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing[14] },
  logoutText: { fontSize: theme.typography.fontSize[14], fontWeight: '700' },
});