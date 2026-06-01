import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { usersApi, authApi } from '../api/endpoints';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const tokens = await authApi.login({ email, password });
          localStorage.setItem('access_token', tokens.access_token);
          localStorage.setItem('refresh_token', tokens.refresh_token);
          const user = await usersApi.me();
          set({ user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const refresh = localStorage.getItem('refresh_token');
        if (refresh) {
          try { await authApi.logout(refresh); } catch {}
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) { set({ isAuthenticated: false, user: null }); return; }
        try {
          const user = await usersApi.me();
          set({ user, isAuthenticated: true });
        } catch {
          set({ isAuthenticated: false, user: null });
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: 'auth',
      partialize: (s) => ({ isAuthenticated: s.isAuthenticated }),
    }
  )
);
