"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useBacktests } from "@/hooks/use-api";
import { formatPercent, timeAgo } from "@/lib/utils";
import { FlaskConical, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const statusIcon: Record<string, any> = {
  queued: Clock,
  running: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
  cancelled: XCircle,
};

const statusColor: Record<string, string> = {
  queued: "text-amber-400",
  running: "text-blue-400 animate-spin",
  completed: "text-emerald-400",
  failed: "text-red-400",
  cancelled: "text-muted-foreground",
};

export default function BacktestsPage() {
  const { data: backtests, isLoading } = useBacktests();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Backtests</h1>
          <p className="text-sm text-muted-foreground">View your backtest history and results</p>
        </div>

        {isLoading ? (
          <SkeletonList count={5} />
        ) : !backtests?.length ? (
          <EmptyState
            icon={<FlaskConical className="h-10 w-10" />}
            title="No backtests yet"
            description="Run a backtest from one of your strategies to see results here."
          />
        ) : (
          <div className="space-y-3">
            {backtests.map((bt) => {
              const Icon = statusIcon[bt.status] || Clock;
              return (
                <Link key={bt.id} href={`/backtests/${bt.id}`}>
                  <Card className="stat-card hover:border-primary/40 cursor-pointer">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`rounded-full bg-muted p-2 ${statusColor[bt.status]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{bt.symbol} · {bt.timeframe}</span>
                          <Badge variant={bt.status === "completed" ? "success" : bt.status === "failed" ? "destructive" : "secondary"}>
                            {bt.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{timeAgo(bt.created_at)}</p>
                      </div>
                      {bt.results && typeof bt.results === "object" && "pnl_pct" in bt.results && (
                        <div className="flex gap-6 text-sm">
                          <div className="text-right">
                            <p className="text-muted-foreground text-xs">PnL</p>
                            <p className={`font-mono font-bold ${(bt.results.pnl_pct as number) >= 0 ? "text-win" : "text-loss"}`}>
                              {formatPercent(bt.results.pnl_pct as number)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground text-xs">Sharpe</p>
                            <p className="font-mono font-bold">{(bt.results.sharpe_ratio as number).toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground text-xs">Win Rate</p>
                            <p className="font-mono font-bold">{(bt.results.win_rate as number).toFixed(0)}%</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
