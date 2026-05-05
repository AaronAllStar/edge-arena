import { create } from "zustand";

export interface Condition {
  type: "condition";
  indicator: string;
  params: Record<string, number>;
  operator: string;
  target: { indicator?: string; params?: Record<string, number>; value?: number };
}

export interface RiskManagement {
  stop_loss_pct: number;
  take_profit_pct: number;
  position_size_pct: number;
  max_open_positions: number;
}

export interface StrategyRules {
  version: string;
  name: string;
  asset: string;
  timeframe: string;
  entry_rules: Condition[];
  exit_rules: Condition[];
  risk_management: RiskManagement;
}

interface StrategyStore {
  currentRules: StrategyRules | null;
  setRules: (rules: StrategyRules | null) => void;
  addEntryRule: (rule: Condition) => void;
  removeEntryRule: (index: number) => void;
  addExitRule: (rule: Condition) => void;
  removeExitRule: (index: number) => void;
  updateRisk: (risk: Partial<RiskManagement>) => void;
}

const EMPTY_RULES: StrategyRules = {
  version: "1.0",
  name: "",
  asset: "BTC/USDT",
  timeframe: "1h",
  entry_rules: [],
  exit_rules: [],
  risk_management: {
    stop_loss_pct: 2,
    take_profit_pct: 4,
    position_size_pct: 5,
    max_open_positions: 1,
  },
};

export const useStrategyStore = create<StrategyStore>((set, get) => ({
  currentRules: null,
  setRules: (rules) => set({ currentRules: rules }),
  addEntryRule: (rule) => {
    const cur = get().currentRules || { ...EMPTY_RULES };
    set({ currentRules: { ...cur, entry_rules: [...cur.entry_rules, rule] } });
  },
  removeEntryRule: (index) => {
    const cur = get().currentRules;
    if (!cur) return;
    set({ currentRules: { ...cur, entry_rules: cur.entry_rules.filter((_, i) => i !== index) } });
  },
  addExitRule: (rule) => {
    const cur = get().currentRules || { ...EMPTY_RULES };
    set({ currentRules: { ...cur, exit_rules: [...cur.exit_rules, rule] } });
  },
  removeExitRule: (index) => {
    const cur = get().currentRules;
    if (!cur) return;
    set({ currentRules: { ...cur, exit_rules: cur.exit_rules.filter((_, i) => i !== index) } });
  },
  updateRisk: (risk) => {
    const cur = get().currentRules || { ...EMPTY_RULES };
    set({ currentRules: { ...cur, risk_management: { ...cur.risk_management, ...risk } } });
  },
}));

export { EMPTY_RULES };
