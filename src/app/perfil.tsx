import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton, AuthField } from '@/components/auth-ui';
import { UtilityPage } from '@/components/utility-page';
import { useAccessiblePalette } from '@/components/mobile-shell';
import { getAuthErrorMessage, getUserName, signOutUser, updateAccountName, updateAccountPassword } from '@/lib/auth';
import { auth } from '@/lib/firebase';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);
  const [name, setName] = useState(auth?.currentUser ? getUserName(auth.currentUser) : '');
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
  const palette = useAccessiblePalette();

  useEffect(() => {
    if (!auth) {
      router.replace('/');
      return;
    }

    return onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/');
        return;
      }
      setUser(currentUser);
      setName(getUserName(currentUser));
    });
  }, []);

  async function saveName() {
    if (!user) return;
    const normalizedName = name.trim();
    setNameNotice('');
    if (!normalizedName) {
      setNameNotice('Digite um nome para continuar.');
      setNameNoticeIsError(true);
      return;
    }

    setSavingName(true);
    try {
      await updateAccountName(user, normalizedName);
      setName(normalizedName);
      setNameNotice('Nome atualizado com sucesso.');
      setNameNoticeIsError(false);
    } catch (error) {
      setNameNotice(getAuthErrorMessage(error));
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
      setPasswordNotice(getAuthErrorMessage(error));
      setPasswordNoticeIsError(true);
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleLogout() {
    setLogoutNotice('');
    setLoggingOut(true);
    try {
      await signOutUser();
      router.replace('/');
    } catch (error) {
      setLogoutNotice(getAuthErrorMessage(error));
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
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.details}>
          <Text style={[styles.label, { color: palette.muted }]}>E-mail da conta</Text>
          <Text style={[styles.value, { color: palette.text }]}>{user?.email ?? 'Carregando perfil...'}</Text>
        </View>
      </View>

      <View style={[styles.formSection, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Nome do perfil</Text>
        <AuthField autoCapitalize="words" autoComplete="name" label="Nome completo" onChangeText={setName} placeholder="Seu nome" returnKeyType="done" value={name} />
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

      <Pressable accessibilityRole="button" disabled={loggingOut} onPress={handleLogout} style={[styles.logoutButton, { borderColor: palette.danger, backgroundColor: palette.surface }]}>
        <Text style={[styles.logoutText, { color: palette.danger }]}>{loggingOut ? 'Saindo...' : 'Sair e voltar para o login'}</Text>
      </Pressable>
      {logoutNotice ? <Text style={[styles.notice, { color: palette.danger }]}>{logoutNotice}</Text> : null}
    </UtilityPage>
  );
}

const styles = StyleSheet.create({
  profile: { borderWidth: 1, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 23, fontWeight: '700' },
  details: { flex: 1, minWidth: 0, gap: 4 },
  label: { fontSize: 12, lineHeight: 17 },
  value: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  formSection: { borderWidth: 1, borderRadius: 8, padding: 16, gap: 8 },
  sectionTitle: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
  notice: { fontSize: 12, lineHeight: 17 },
  logoutButton: { minHeight: 48, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  logoutText: { fontSize: 14, fontWeight: '700' },
});