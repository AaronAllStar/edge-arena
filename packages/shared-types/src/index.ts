export interface Condition {
  type: "condition";
  indicator: string;
  params: Record<string, number>;
  operator: string;
  target: { indicator?: string; params?: Record<string, number>; value?: number };
}

export interface StrategyRules {
  version: string;
  name: string;
  asset: string;
  timeframe: string;
  entry_rules: Condition[];
  exit_rules: Condition[];
  risk_management: {
    stop_loss_pct: number;
    take_profit_pct: number;
    position_size_pct: number;
    max_open_positions: number;
  };
}

export interface BacktestResult {
  pnl_pct: number;
  total_trades: number;
  win_rate: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  profit_factor: number;
  avg_win: number;
  avg_loss: number;
  best_trade: number;
  worst_trade: number;
}

export interface Trade {
  entry_time: string;
  exit_time: string | null;
  side: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  pnl: number;
  pnl_pct: number;
}

export interface EquityPoint {
  timestamp: string;
  equity: number;
}

export type Plan = "free" | "basic" | "premium";

export interface UserPublic {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  rating: number;
  total_wins: number;
  total_losses: number;
}
