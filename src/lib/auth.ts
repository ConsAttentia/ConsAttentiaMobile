import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

function requireAuth() {
  if (!auth) {
    throw new Error('firebase/not-configured');
  }

  return auth;
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(requireAuth(), email.trim(), password);
}

export async function register(name: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(
    requireAuth(),
    email.trim(),
    password
  );
  await updateProfile(credential.user, { displayName: name.trim() });
  return credential;
}

export async function updateAccountName(user: User, name: string) {
  await updateProfile(user, { displayName: name.trim() });
}

export async function updateAccountPassword(user: User, currentPassword: string, newPassword: string) {
  if (!user.email) {
    throw new Error('auth/email-required');
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  try {
    await reauthenticateWithCredential(user, credential);
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      throw new Error('auth/incorrect-current-password');
    }
    throw error;
  }
  await updatePassword(user, newPassword);
}

export async function signOutUser() {
  await signOut(requireAuth());
}

export function getAuthErrorMessage(error: unknown) {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : '';

  switch (code) {
    case 'firebase/not-configured':
      return 'Configure as variáveis EXPO_PUBLIC_FIREBASE no arquivo .env.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'E-mail ou senha inválidos.';
    case 'auth/incorrect-current-password':
      return 'Senha atual incorreta. Confira e tente novamente.';
    case 'auth/email-required':
      return 'Esta conta não possui um e-mail para autenticação por senha.';
    case 'auth/requires-recent-login':
      return 'Por segurança, confirme sua senha atual e tente novamente.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'Digite um e-mail válido.';
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique a internet e tente novamente.';
    default:
      return 'Não foi possível concluir. Tente novamente.';
  }
}

export function getUserName(user: User) {
  return user.displayName?.trim() || user.email?.split('@')[0] || 'Pessoa';
}