import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { PublicUser, AuthResponse } from '@skillswap/shared';
import { api, setAccessToken, getAccessToken } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';

type AuthState = {
  user: PublicUser | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  login: (identifier: string, password: string) => Promise<PublicUser>;
  signup: (input: SignupInput) => Promise<PublicUser>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

type SignupInput = {
  username: string;
  email: string;
  password: string;
  name: string;
  surname: string;
  birthdate: string;
  gender?: 'F' | 'M' | 'O';
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [status, setStatus] = useState<AuthState['status']>('loading');

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setStatus('anonymous');
      return;
    }
    (async () => {
      try {
        const res = await api.get<{ user: PublicUser }>('/auth/me');
        setUser(res.data.user);
        setStatus('authenticated');
        connectSocket();
      } catch {
        setAccessToken(null);
        setStatus('anonymous');
      }
    })();
  }, []);

  const login: AuthState['login'] = async (identifier, password) => {
    const res = await api.post<AuthResponse>('/auth/login', { identifier, password });
    setAccessToken(res.data.token);
    setUser(res.data.user);
    setStatus('authenticated');
    connectSocket();
    return res.data.user;
  };

  const signup: AuthState['signup'] = async (input) => {
    const res = await api.post<AuthResponse>('/auth/signup', input);
    setAccessToken(res.data.token);
    setUser(res.data.user);
    setStatus('authenticated');
    connectSocket();
    return res.data.user;
  };

  const logout = async () => {
    disconnectSocket();
    setAccessToken(null);
    setUser(null);
    setStatus('anonymous');
  };

  const refreshMe = async () => {
    try {
      const res = await api.get<{ user: PublicUser }>('/auth/me');
      setUser(res.data.user);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, status, login, signup, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export { getAccessToken };
