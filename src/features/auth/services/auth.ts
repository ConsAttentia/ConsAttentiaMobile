import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User,
  type UserCredential,
} from 'firebase/auth';

import { auth } from '@/shared/firebase/firebase';

function requireAuth() {
  if (!auth) {
    throw new Error('firebase/not-configured');
  }

  return auth;
}

function validateEmail(email: string): string {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) throw new Error('auth/email-required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('auth/invalid-email-format');
  }
  return normalizedEmail;
}

function validatePassword(password: string): void {
  if (!password) throw new Error('auth/password-required');
  if (password.length < 6) throw new Error('auth/weak-password');
}

export async function signIn(email: string, password: string): Promise<UserCredential> {
  validatePassword(password);
  return signInWithEmailAndPassword(requireAuth(), validateEmail(email), password);
}

export async function register(name: string, email: string, password: string): Promise<UserCredential> {
  const normalizedName = name.trim();
  if (!normalizedName) throw new Error('auth/name-required');
  validatePassword(password);
  const credential = await createUserWithEmailAndPassword(
    requireAuth(),
    validateEmail(email),
    password
  );
  await updateProfile(credential.user, { displayName: normalizedName });
  return credential;
}

export async function updateAccountName(user: User, name: string): Promise<void> {
  const normalizedName = name.trim();
  if (!normalizedName) throw new Error('auth/name-required');
  await updateProfile(user, { displayName: normalizedName });
}

export async function updateAccountPassword(user: User, currentPassword: string, newPassword: string): Promise<void> {
  if (!user.email) {
    throw new Error('auth/account-email-required');
  }
  validatePassword(currentPassword);
  validatePassword(newPassword);
  if (currentPassword === newPassword) {
    throw new Error('auth/password-unchanged');
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

export async function signOutUser(): Promise<void> {
  await signOut(requireAuth());
}

export function getAuthErrorMessage(error: unknown): string {
  const firebaseCode =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : '';
  const code = firebaseCode || (
    error instanceof Error
      && (error.message.startsWith('auth/') || error.message.startsWith('firebase/'))
      ? error.message
      : ''
  );

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
    case 'auth/account-email-required':
      return 'Esta conta não possui um e-mail para autenticação por senha.';
    case 'auth/requires-recent-login':
      return 'Por segurança, confirme sua senha atual e tente novamente.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/invalid-email':
    case 'auth/invalid-email-format':
      return 'Digite um e-mail válido.';
    case 'auth/email-required':
      return 'Informe seu e-mail.';
    case 'auth/password-required':
      return 'Informe sua senha.';
    case 'auth/name-required':
      return 'Digite um nome para continuar.';
    case 'auth/password-unchanged':
      return 'A nova senha precisa ser diferente da atual.';
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique a internet e tente novamente.';
    default:
      return 'Não foi possível concluir. Tente novamente.';
  }
}

export function getUserName(user: User): string {
  return user.displayName?.trim() || user.email?.split('@')[0] || 'Pessoa';
}