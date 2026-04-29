import { create } from 'zustand';
import type { User } from '@garnish/shared';
import { authService, getStoredTokens } from '@/services';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  fetchAuthenticatedUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),

  fetchAuthenticatedUser: async () => {
    set({ isLoading: true });

    try {
      const { accessToken } = await getStoredTokens();
      if (!accessToken) {
        set({ isAuthenticated: false, user: null, isLoading: false });
        return;
      }

      const user = await authService.getMe();
      set({ isAuthenticated: true, user, isLoading: false });
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  signOut: async () => {
    await authService.logout();
    set({ isAuthenticated: false, user: null });
  },
}));

export default useAuthStore;
