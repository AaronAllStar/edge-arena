import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  plan: string;
  rating: number;
  peak_rating: number;
  total_wins: number;
  total_losses: number;
  total_tournaments: number;
  total_backtests: number;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface AuthState {
  user: UserProfile | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const data = await api.post<{ user: UserProfile; tokens: TokenPair }>(
          "/auth/login", { email, password }
        );
        set({ user: data.user, tokens: data.tokens, isAuthenticated: true });
      },

      register: async (email, username, password) => {
        const data = await api.post<{ user: UserProfile; tokens: TokenPair }>(
          "/auth/register", { email, username, password }
        );
        set({ user: data.user, tokens: data.tokens, isAuthenticated: true });
      },

      logout: async () => {
        const { tokens } = get();
        try {
          if (tokens?.refresh_token) {
            await api.post("/auth/logout", { refresh_token: tokens.refresh_token });
          }
        } catch {}
        set({ user: null, tokens: null, isAuthenticated: false });
      },

      refresh: async () => {
        const { tokens } = get();
        if (!tokens?.refresh_token) return;
        try {
          const newTokens = await api.post<TokenPair>(
            "/auth/refresh", { refresh_token: tokens.refresh_token }
          );
          set({ tokens: newTokens });
        } catch {
          set({ user: null, tokens: null, isAuthenticated: false });
        }
      },

      fetchMe: async () => {
        const { tokens } = get();
        if (!tokens?.access_token) return;
        try {
          const user = await api.get<UserProfile>("/auth/me", { token: tokens.access_token });
          set({ user });
        } catch (e: any) {
          if (e.status === 401) {
            await get().refresh();
            const newTokens = get().tokens;
            if (newTokens?.access_token) {
              const user = await api.get<UserProfile>("/auth/me", { token: newTokens.access_token });
              set({ user });
            }
          }
        }
      },
    }),
    {
      name: "edgearena-auth",
      partialize: (s) => ({ tokens: s.tokens, user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
