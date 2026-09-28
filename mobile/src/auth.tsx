import * as SecureStore from 'expo-secure-store';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';
import { login, type Session } from './api';

const STORAGE_KEY = 'session';

type Auth = {
  // undefined while secure storage loads, null when signed out.
  session: Session | null | undefined;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

// Keeps the signed-in account on this phone until it signs out or the server rejects its token.
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>();

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then((saved) => setSession(saved ? JSON.parse(saved) : null));
  }, []);

  async function signIn(username: string, password: string) {
    const signedIn = await login(username, password);
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(signedIn));
    setSession(signedIn);
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    setSession(null);
  }

  return <AuthContext value={{ session, signIn, signOut }}>{children}</AuthContext>;
}

export function useAuth() {
  const auth = use(AuthContext);
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>.');
  return auth;
}
