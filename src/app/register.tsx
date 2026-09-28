import { useState } from 'react';
import { router } from 'expo-router';

import { AuthButton, AuthField, AuthFrame, AuthHeading, AuthLink, AuthMessage } from '@/components/auth-ui';
import { getAuthErrorMessage, register } from '@/lib/auth';
import { auth } from '@/lib/firebase';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleRegister() {
    setMessage('');
    if (!name.trim() || !email.trim() || !password) {
      setMessage('Preencha nome, e-mail e senha.');
      return;
    }
    if (password.length < 6) {
      setMessage('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (!auth) {
      setMessage('Configure o Firebase no arquivo .env para habilitar o cadastro.');
      return;
    }
    setBusy(true);
    try {
      await register(name, email, password);
      router.replace('/home');
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame footer={<AuthLink onPress={() => router.replace('/')}>Já tenho uma conta</AuthLink>}>
      <AuthHeading title="Criar conta" subtitle="Comece preenchendo seus dados." />
      <AuthField autoCapitalize="words" autoComplete="name" label="Nome" onChangeText={setName} placeholder="Seu nome" returnKeyType="next" value={name} />
      <AuthField autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="E-mail" onChangeText={setEmail} placeholder="seu@email.com" returnKeyType="next" value={email} />
      <AuthField autoCapitalize="none" autoComplete="new-password" label="Senha" onChangeText={setPassword} onSubmitEditing={handleRegister} placeholder="Mínimo de 6 caracteres" returnKeyType="done" secureTextEntry value={password} />
      <AuthButton busy={busy} label="Cadastrar" onPress={handleRegister} />
      {message ? <AuthMessage>{message}</AuthMessage> : null}
    </AuthFrame>
  );
}
