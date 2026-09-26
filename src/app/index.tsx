import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { AuthButton, AuthField, AuthFrame, AuthHeading, AuthLink, AuthMessage } from '@/components/auth-ui';
import { getAuthErrorMessage, signIn } from '@/lib/auth';
import { auth } from '@/lib/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkingSession, setCheckingSession] = useState(Boolean(auth));

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (user) => {
      setCheckingSession(false);
      if (user) router.replace('/home');
    });
  }, []);

  async function handleLogin() {
    setMessage('');
    if (!email.trim() || !password) {
      setMessage('Preencha o e-mail e a senha.');
      return;
    }
    setBusy(true);
    try {
      await signIn(email, password);
      router.replace('/home');
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame footer={<AuthLink onPress={() => router.push('/register')}>Criar conta</AuthLink>}>
      <AuthHeading title="Bem-vindo" subtitle="Entre na sua conta ConsAttentia." />
      <AuthField autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="E-mail" onChangeText={setEmail} placeholder="seu@email.com" returnKeyType="next" value={email} />
      <AuthField autoCapitalize="none" autoComplete="current-password" label="Senha" onChangeText={setPassword} onSubmitEditing={handleLogin} placeholder="Sua senha" returnKeyType="done" secureTextEntry value={password} />
      <AuthButton busy={busy || checkingSession} label="Entrar" onPress={handleLogin} />
      {message ? <AuthMessage>{message}</AuthMessage> : null}
      {!auth ? <AuthMessage>Configure o Firebase no arquivo .env para habilitar o acesso.</AuthMessage> : null}
    </AuthFrame>
  );
}
