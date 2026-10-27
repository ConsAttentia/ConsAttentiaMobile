import { useState } from 'react';
import { router } from 'expo-router';

import { AuthButton, AuthField, AuthFrame, AuthHeading, AuthLink, AuthMessage } from '@/features/auth/components/auth-ui';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { notifyAuthError } from '@/features/auth/utils/auth-notifications';

export default function LoginScreen() {
  const { login, loading, configured, sessionError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleLogin() {
    setMessage('');
    if (!email.trim() || !password) {
      setMessage('Preencha o e-mail e a senha.');
      return;
    }
    setBusy(true);
    try {
      await login(email, password);
      router.replace('/home');
    } catch (error) {
      setMessage(notifyAuthError(error, 'Falha ao entrar'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame footer={<AuthLink onPress={() => router.push('/register')}>Criar conta</AuthLink>}>
      <AuthHeading title="Bem-vindo" subtitle="Entre na sua conta ConsAttentia." />
      <AuthField autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="E-mail" onChangeText={setEmail} placeholder="seu@email.com" returnKeyType="next" value={email} />
      <AuthField autoCapitalize="none" autoComplete="current-password" label="Senha" onChangeText={setPassword} onSubmitEditing={handleLogin} placeholder="Sua senha" returnKeyType="done" secureTextEntry value={password} />
      <AuthButton busy={busy || loading} label="Entrar" onPress={handleLogin} />
      {message ? <AuthMessage>{message}</AuthMessage> : null}
      {sessionError ? <AuthMessage>{sessionError}</AuthMessage> : null}
      {!configured ? <AuthMessage>Configure o Firebase no arquivo .env para habilitar o acesso.</AuthMessage> : null}
    </AuthFrame>
  );
}
