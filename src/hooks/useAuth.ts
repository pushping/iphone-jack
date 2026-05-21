import { useCallback, useMemo } from 'react';
import { useAppStore } from '@/hooks/useAppState';
import { api, setToken, clearToken } from '@/lib/api';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    role: 'user' | 'admin';
    subscriptionTier: 'free' | 'paid';
  };
}

export function useAuth() {
  const { state, dispatch } = useAppStore();
  const { user } = state;

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      const { data, error } = await api.post<AuthResponse>('/auth/login', { email, password });
      if (error || !data) return { error: error || '登录失败' };

      setToken(data.token);
      dispatch({
        type: 'SET_USER',
        payload: {
          ...data.user,
          createdAt: new Date(),
        },
      });
      return {};
    },
    [dispatch],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string,
    ): Promise<{ error?: string }> => {
      const { data, error } = await api.post<AuthResponse>('/auth/register', {
        email,
        password,
        displayName,
      });
      if (error || !data) return { error: error || '注册失败' };

      setToken(data.token);
      dispatch({
        type: 'SET_USER',
        payload: {
          ...data.user,
          createdAt: new Date(),
        },
      });
      return {};
    },
    [dispatch],
  );

  const signOut = useCallback(async () => {
    clearToken();
    localStorage.removeItem('iphone-jack-state');
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_USAGE_LIMITS', payload: null });
  }, [dispatch]);

  const refreshProfile = useCallback(async () => {
    const { data, error } = await api.get<{
      id: string;
      email: string;
      displayName: string | null;
      role: 'user' | 'admin';
      subscriptionTier: 'free' | 'paid';
      createdAt: string;
    }>('/profile');

    if (error || !data) return;

    dispatch({
      type: 'SET_USER',
      payload: {
        id: data.id,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        subscriptionTier: data.subscriptionTier,
        createdAt: new Date(data.createdAt),
      },
    });
  }, [dispatch]);

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  return {
    user,
    loading: false,
    isAdmin,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };
}
