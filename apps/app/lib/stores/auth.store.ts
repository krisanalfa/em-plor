import { IAccount } from "@em-plor/contracts";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  account: IAccount | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  setAccount: (account: IAccount | null) => void;
  setToken: (token: string | null) => void;
  login: (account: IAccount, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      account: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,
      setAccount: (account) => set({ account, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      login: (account, token) => set({ account, token, isAuthenticated: true }),
      logout: () => set({ account: null, token: null, isAuthenticated: false }),
      initialize: () => set({ isInitialized: true }),
    }),
    {
      name: "auth-storage",
      // Only persist these fields
      partialize: (state) => ({
        token: state.token,
        account: state.account,
        isAuthenticated: false,
      }),
    },
  ),
);
