"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import type { UserProfile } from "@/stores/auth";

function useToken() {
  return useAuthStore((s) => s.tokens?.access_token);
}

// ── Auth ────────────────────────────────────────────
export function useMe() {
  const token = useToken();
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<UserProfile>("/auth/me", { token }),
    enabled: !!token,
  });
}

// ── Strategies ──────────────────────────────────────
export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  version: number;
  status: string;
  is_public: boolean;
  rules: Record<string, unknown>;
  tags: string[] | null;
  total_backtests: number;
  win_rate: number | null;
  best_sharpe: number | null;
  best_pnl_pct: number | null;
  created_at: string;
  updated_at: string;
}

export function useStrategies(status?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["strategies", status],
    queryFn: () => api.get<Strategy[]>("/strategies", { token, params: { status } }),
    enabled: !!token,
  });
}

export function useStrategy(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["strategy", id],
    queryFn: () => api.get<Strategy>(`/strategies/${id}`, { token }),
    enabled: !!token && !!id,
  });
}

export function useCreateStrategy() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post<Strategy>("/strategies", data, { token }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["strategies"] }),
  });
}

// ── Backtests ───────────────────────────────────────
export interface Backtest {
  id: string;
  strategy_id: string;
  status: string;
  symbol: string;
  timeframe: string;
  results: Record<string, unknown> | null;
  error_message: string | null;
  execution_time_ms: number | null;
  created_at: string;
  completed_at: string | null;
}

export function useBacktests() {
  const token = useToken();
  return useQuery({
    queryKey: ["backtests"],
    queryFn: () => api.get<Backtest[]>("/backtests", { token }),
    enabled: !!token,
  });
}

export function useBacktest(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["backtest", id],
    queryFn: () => api.get<Backtest>(`/backtests/${id}`, { token }),
    enabled: !!token && !!id,
    refetchInterval: (q) => (q.state.data?.status === "running" || q.state.data?.status === "queued" ? 3000 : false),
  });
}

export function useCreateBacktest() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post<Backtest>("/backtests", data, { token }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backtests"] }),
  });
}

// ── Tournaments ─────────────────────────────────────
export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  symbol: string;
  timeframe: string;
  max_participants: number | null;
  entry_fee: number;
  prize_pool: number;
  registration_ends: string | null;
  starts_at: string | null;
  participant_count: number;
  created_at: string;
}

export function useTournaments(status?: string) {
  return useQuery({
    queryKey: ["tournaments", status],
    queryFn: () => api.get<Tournament[]>("/tournaments", { params: { status } }),
  });
}

export function useTournament(id: string) {
  return useQuery({
    queryKey: ["tournament", id],
    queryFn: () => api.get<Tournament>(`/tournaments/${id}`),
    enabled: !!id,
  });
}

export function useJoinTournament() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, strategy_id }: { id: string; strategy_id: string }) =>
      api.post(`/tournaments/${id}/join`, { strategy_id }, { token }),
    onSuccess: (_: any, vars: any) => qc.invalidateQueries({ queryKey: ["tournament", vars.id] }),
  });
}

// ── Leaderboard ─────────────────────────────────────
export interface LeaderEntry {
  rank: number;
  user_id: string;
  username: string;
  display_name: string | null;
  rating: number;
  peak_rating: number;
  wins: number;
  losses: number;
  tournaments: number;
}

export function useLeaderboard(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["leaderboard", limit, offset],
    queryFn: () => api.get<LeaderEntry[]>("/leaderboard/global", { params: { limit, offset } }),
  });
}

// ── Billing ─────────────────────────────────────────
export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: () => api.get<Record<string, any>>("/billing/plans"),
  });
}

export function useUsage() {
  const token = useToken();
  return useQuery({
    queryKey: ["usage"],
    queryFn: () => api.get<any>("/billing/usage", { token }),
    enabled: !!token,
  });
}
