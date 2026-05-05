"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { useCreateStrategy } from "@/hooks/use-api";
import { useStrategyStore, EMPTY_RULES, type Condition } from "@/stores/strategy";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import {
  FlaskConical, Plus, Trash2, ArrowRight, Wand2, FileCode,
  Sparkles, Loader2, CheckCircle2, AlertTriangle
} from "lucide-react";

const INDICATORS = ["EMA", "SMA", "RSI", "MACD", "Bollinger", "ATR", "Volume", "Stochastic", "MFI"];
const OPERATORS = [">", "<", ">=", "<=", "crosses_above", "crosses_below"];
const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"];
const ASSETS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT", "DOGE/USDT", "AVAX/USDT"];

// ── Templates ──────────────────────────────────────────────
const TEMPLATES = [
  { id: "ema_crossover", name: "EMA Crossover", desc: "Trend-following. Fast EMA crosses slow EMA.", difficulty: "beginner", category: "Trend" },
  { id: "rsi_oversold", name: "RSI Oversold Bounce", desc: "Mean-reversion. Buy RSI < 30 in uptrend.", difficulty: "beginner", category: "Mean Reversion" },
  { id: "macd_momentum", name: "MACD Momentum", desc: "Momentum. MACD line crosses signal line.", difficulty: "beginner", category: "Momentum" },
  { id: "bollinger_squeeze", name: "Bollinger Squeeze", desc: "Volatility breakout after band compression.", difficulty: "intermediate", category: "Volatility" },
  { id: "rsi_ema_combo", name: "RSI + EMA Filter", desc: "RSI crosses 50 with price above EMA 50.", difficulty: "intermediate", category: "Combo" },
];

const defaultEntryRule: Condition = {
  type: "condition", indicator: "EMA", params: { period: 20 }, operator: ">", target: { value: 0 }
};

export default function NewStrategyPage() {
  const router = useRouter();
  const { currentRules, setRules, addEntryRule, removeEntryRule, addExitRule, removeExitRule, updateRisk } = useStrategyStore();
  const create = useCreateStrategy();
  const { tokens } = useAuthStore();
  const rules = currentRules || { ...EMPTY_RULES, name: "" };

  // Tab state
  const [tab, setTab] = useState("manual");
  const [name, setName] = useState(rules.name);
  const [asset, setAsset] = useState(rules.asset);
  const [timeframe, setTimeframe] = useState(rules.timeframe);

  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateOverrides, setTemplateOverrides] = useState<{ asset: string; timeframe: string }>({ asset: "", timeframe: "" });

  // AI state
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState("");

  // Validation state
  const [validationResult, setValidationResult] = useState<any>(null);

  // ── Handlers ───────────────────────────────────────────

  async function handleSaveManual() {
    if (!name.trim()) return;
    try {
      const result = await create.mutateAsync({
        name, description: null,
        rules: { ...rules, name, asset, timeframe },
        tags: [], is_public: false,
      });
      router.push(`/strategies/${result.id}`);
    } catch {}
  }

  async function handleSaveTemplate() {
    if (!selectedTemplate) return;
    try {
      const result = await api.post<any>("/strategies/from-template", {
        template_id: selectedTemplate,
        name: name || undefined,
        asset: templateOverrides.asset || undefined,
        timeframe: templateOverrides.timeframe || undefined,
      }, { token: tokens?.access_token });
      router.push(`/strategies/${result.id}`);
    } catch {}
  }

  async function handleAIConvert() {
    if (aiInput.length < 10) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    try {
      const result = await api.post<any>("/strategies/from-ai", {
        description: aiInput,
        save: false,
      }, { token: tokens?.access_token });
      setAiResult(result);
    } catch (err: any) {
      setAiError(err.message || "AI conversion failed. Make sure OPENAI_API_KEY is set on the server.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSaveAI() {
    if (!aiResult?.rules) return;
    try {
      const result = await api.post<any>("/strategies/from-ai", {
        description: aiInput,
        save: true,
      }, { token: tokens?.access_token });
      router.push(`/strategies/${result.strategy_id}`);
    } catch {}
  }

  async function handleValidate() {
    try {
      const result = await api.post<any>("/strategies/validate", {
        rules: { ...rules, name, asset, timeframe },
      });
      setValidationResult(result);
    } catch {}
  }

  function loadTemplateToEditor(templateId: string) {
    const tpl = TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    // Load template rules into manual editor
    setTab("manual");
    setName(tpl.name);
    setSelectedTemplate(templateId);
    // The actual rules will come from the template endpoint on save
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">New Strategy</h1>
          <p className="text-sm text-muted-foreground">Create manually, from a template, or describe it with AI</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual" className="gap-2"><FlaskConical className="h-4 w-4" />Manual</TabsTrigger>
            <TabsTrigger value="template" className="gap-2"><FileCode className="h-4 w-4" />Template</TabsTrigger>
            <TabsTrigger value="ai" className="gap-2"><Wand2 className="h-4 w-4" />AI Builder</TabsTrigger>
          </TabsList>

          {/* ── Manual Builder ─────────────────────────────── */}
          <TabsContent value="manual" className="space-y-6 mt-6">
            {/* Basic Info */}
            <Card>
              <CardHeader><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Strategy Name</Label>
                  <Input placeholder="e.g. EMA Cross RSI Filter" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Asset</Label>
                    <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={asset} onChange={(e) => setAsset(e.target.value)}>
                      {ASSETS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timeframe</Label>
                    <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                      {TIMEFRAMES.map((tf) => <option key={tf} value={tf}>{tf}</option>)}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Entry Rules */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Entry Rules</CardTitle>
                  <CardDescription>All conditions must be true (AND logic)</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => addEntryRule({ ...defaultEntryRule })}>
                  <Plus className="mr-1 h-3.5 w-3.5" />Add Rule
                </Button>
              </CardHeader>
              <CardContent>
                {rules.entry_rules.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Add at least one entry rule</p>
                ) : (
                  <div className="space-y-3">
                    {rules.entry_rules.map((rule, i) => (
                      <RuleEditor key={i} index={i} rule={rule} type="entry"
                        onChange={(updated) => {
                          const list = [...rules.entry_rules]; list[i] = updated;
                          setRules({ ...rules, entry_rules: list });
                        }}
                        onRemove={() => removeEntryRule(i)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exit Rules */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Exit Rules</CardTitle>
                  <CardDescription>Any true triggers exit (OR logic)</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => addExitRule({ ...defaultEntryRule })}>
                  <Plus className="mr-1 h-3.5 w-3.5" />Add Rule
                </Button>
              </CardHeader>
              <CardContent>
                {rules.exit_rules.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No exit rules — positions close via SL/TP only</p>
                ) : (
                  <div className="space-y-3">
                    {rules.exit_rules.map((rule, i) => (
                      <RuleEditor key={i} index={i} rule={rule} type="exit"
                        onChange={(updated) => {
                          const list = [...rules.exit_rules]; list[i] = updated;
                          setRules({ ...rules, exit_rules: list });
                        }}
                        onRemove={() => removeExitRule(i)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Management */}
            <Card>
              <CardHeader><CardTitle className="text-base">Risk Management</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {([
                    { key: "stop_loss_pct", label: "Stop Loss %", step: 0.5 },
                    { key: "take_profit_pct", label: "Take Profit %", step: 0.5 },
                    { key: "position_size_pct", label: "Position Size %", step: 1 },
                    { key: "max_open_positions", label: "Max Positions", step: 1 },
                  ] as const).map(({ key, label, step }) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <Input type="number" step={step} value={(rules.risk_management as any)[key]}
                        onChange={(e) => updateRisk({ [key]: parseFloat(e.target.value) || 0 })} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Validate + Save */}
            <div className="flex items-center gap-3 justify-end">
              <Button variant="outline" onClick={handleValidate}>
                <CheckCircle2 className="mr-1.5 h-4 w-4" />Validate
              </Button>
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button onClick={handleSaveManual} disabled={!name.trim() || create.isPending} variant="glow">
                {create.isPending ? "Saving..." : "Save Strategy"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <Card className={validationResult.valid ? "border-emerald-500/30" : "border-destructive/30"}>
                <CardContent className="pt-4 space-y-2">
                  {validationResult.errors?.map((e: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-red-400">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />{e}
                    </div>
                  ))}
                  {validationResult.warnings?.map((w: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-amber-400">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />{w}
                    </div>
                  ))}
                  {validationResult.valid && !validationResult.warnings?.length && (
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />Strategy is valid
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Template Selector ──────────────────────────── */}
          <TabsContent value="template" className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((tpl) => (
                <Card
                  key={tpl.id}
                  className={`stat-card cursor-pointer transition-all ${selectedTemplate === tpl.id ? "border-primary glow-primary" : "hover:border-primary/40"}`}
                  onClick={() => setSelectedTemplate(tpl.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{tpl.name}</h3>
                      <Badge variant={tpl.difficulty === "beginner" ? "success" : "secondary"}>{tpl.difficulty}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{tpl.desc}</p>
                    <Badge variant="outline" className="text-xs">{tpl.category}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Customize Template</CardTitle>
                  <CardDescription>Override asset and timeframe (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Asset (optional)</Label>
                      <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        value={templateOverrides.asset} onChange={(e) => setTemplateOverrides(p => ({ ...p, asset: e.target.value }))}>
                        <option value="">Use template default</option>
                        {ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Timeframe (optional)</Label>
                      <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        value={templateOverrides.timeframe} onChange={(e) => setTemplateOverrides(p => ({ ...p, timeframe: e.target.value }))}>
                        <option value="">Use template default</option>
                        {TIMEFRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Cancel</Button>
                    <Button onClick={handleSaveTemplate} variant="glow">
                      Create from Template <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── AI Builder ─────────────────────────────────── */}
          <TabsContent value="ai" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Describe your strategy
                </CardTitle>
                <CardDescription>
                  Write your trading idea in plain English. The AI will convert it to structured rules.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g. Buy Bitcoin when the 9 EMA crosses above the 21 EMA on the 1 hour chart. Use a 2% stop loss and 4% take profit. Exit when the 9 EMA crosses below the 21 EMA."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{aiInput.length} / 3000 characters</span>
                  <Button onClick={handleAIConvert} disabled={aiInput.length < 10 || aiLoading} variant="glow">
                    {aiLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Wand2 className="mr-2 h-4 w-4" />Generate Strategy</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Error */}
            {aiError && (
              <Card className="border-destructive/30">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2 text-sm text-red-400">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">AI conversion failed</p>
                      <p className="text-muted-foreground mt-1">{aiError}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Result */}
            {aiResult && (
              <Card className="border-primary/30 glow-primary">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Generated Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiResult.explanation && (
                    <div className="rounded-lg bg-muted/50 p-4 text-sm">
                      <p className="font-medium mb-1">AI Explanation</p>
                      <p className="text-muted-foreground">{aiResult.explanation}</p>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium">{aiResult.rules?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Asset</p>
                      <p className="text-sm font-medium">{aiResult.rules?.asset}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Timeframe</p>
                      <p className="text-sm font-medium">{aiResult.rules?.timeframe}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Entry Rules ({aiResult.rules?.entry_rules?.length})</p>
                    <pre className="text-xs bg-background rounded-lg p-3 overflow-x-auto">{JSON.stringify(aiResult.rules?.entry_rules, null, 2)}</pre>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Exit Rules ({aiResult.rules?.exit_rules?.length})</p>
                    <pre className="text-xs bg-background rounded-lg p-3 overflow-x-auto">{JSON.stringify(aiResult.rules?.exit_rules, null, 2)}</pre>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Risk Management</p>
                    <pre className="text-xs bg-background rounded-lg p-3 overflow-x-auto">{JSON.stringify(aiResult.rules?.risk_management, null, 2)}</pre>
                  </div>

                  {/* Warnings */}
                  {aiResult.warnings?.length > 0 && (
                    <div className="space-y-1">
                      {aiResult.warnings.map((w: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-amber-400">
                          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />{w}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => { setAiResult(null); setAiInput(""); }}>
                      Try Again
                    </Button>
                    <Button onClick={handleSaveAI} variant="glow">
                      Save AI Strategy <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

// ── Rule Editor Component ──────────────────────────────────

function RuleEditor({ index, rule, type, onChange, onRemove }: {
  index: number;
  rule: Condition;
  type: "entry" | "exit";
  onChange: (rule: Condition) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
      <Badge variant="secondary" className="shrink-0">#{index + 1}</Badge>
      <select className="h-8 rounded-md border border-input bg-background px-2 text-xs" value={rule.indicator}
        onChange={(e) => onChange({ ...rule, indicator: e.target.value })}>
        {INDICATORS.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
      </select>
      <Input type="number" className="h-8 w-16 text-xs" placeholder="Period"
        value={rule.params.period ?? 20}
        onChange={(e) => onChange({ ...rule, params: { ...rule.params, period: parseInt(e.target.value) || 20 } })} />
      <select className="h-8 rounded-md border border-input bg-background px-2 text-xs" value={rule.operator}
        onChange={(e) => onChange({ ...rule, operator: e.target.value })}>
        {OPERATORS.map((op) => <option key={op} value={op}>{op.replace("_", " ")}</option>)}
      </select>
      <Input type="number" step="0.5" className="h-8 w-20 text-xs" placeholder="Value"
        value={rule.target.value ?? ""}
        onChange={(e) => onChange({ ...rule, target: { value: parseFloat(e.target.value) || 0 } })} />
      <Button variant="ghost" size="icon-sm" onClick={onRemove} className="shrink-0 text-muted-foreground hover:text-destructive ml-auto">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
