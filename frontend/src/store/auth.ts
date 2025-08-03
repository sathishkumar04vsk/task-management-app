import { create } from "zustand";

interface AuthState {
  token: string | null;
  username: string | null;
  isAdmin: boolean;
  setToken: (token: string) => void;
  setUsername: (username: string) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  isAdmin: false,
  setToken: (token) => set({ token }),
  setUsername: (username) => set({ username }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  clearAuth: () => set({ token: null, username: null, isAdmin: false }),
}));
