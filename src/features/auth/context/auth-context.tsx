import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { register, signIn, signOutUser } from '@/features/auth/services/auth';
import { auth } from '@/shared/firebase/firebase';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  sessionError: string | null;
  login: (email: string, password: string) => Promise<void>;
  registerAccount: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;

    return onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
        setSessionError(null);
      },
      (error: Error) => {
        console.error('Não foi possível verificar a sessão autenticada.', error);
        setUser(null);
        setLoading(false);
        setSessionError('Não foi possível confirmar sua sessão. Entre novamente.');
      }
    );
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signIn(email, password);
  }, []);

  const registerAccount = useCallback(async (name: string, email: string, password: string) => {
    await register(name, email, password);
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    configured: Boolean(auth),
    sessionError,
    login,
    registerAccount,
    logout,
  }), [user, loading, sessionError, login, registerAccount, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
