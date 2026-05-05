"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard, RatingBadge, WinRateBar } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/stores/auth";
import { useStrategies, useBacktests, useTournaments } from "@/hooks/use-api";
import { formatPercent, timeAgo, ratingTier } from "@/lib/utils";
import { Plus, FlaskConical, Trophy, ArrowRight, TrendingUp, Swords, Zap } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: strategies, isLoading: sLoading } = useStrategies();
  const { data: backtests, isLoading: bLoading } = useBacktests();
  const { data: tournaments, isLoading: tLoading } = useTournaments("registration");

  const recentStrategies = strategies?.slice(0, 3) || [];
  const recentBacktests = backtests?.slice(0, 3) || [];
  const openTournaments = tournaments?.slice(0, 3) || [];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, <span className="gradient-text">{user?.display_name || user?.username}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Here&apos;s your arena overview</p>
          </div>
          <Button asChild variant="glow">
            <Link href="/strategies/new"><Plus className="mr-2 h-4 w-4" />New Strategy</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Rating" value={user?.rating || 1200} subtitle={user ? ratingTier(user.rating).label : ""} icon={<TrendingUp className="h-4 w-4" />} />
          <StatCard label="Win Rate" value={user ? `${((user.total_wins / Math.max(1, user.total_wins + user.total_losses)) * 100).toFixed(0)}%` : "—"} subtitle={`${user?.total_wins || 0}W / ${user?.total_losses || 0}L`} icon={<Swords className="h-4 w-4" />} />
          <StatCard label="Strategies" value={strategies?.length || 0} icon={<FlaskConical className="h-4 w-4" />} />
          <StatCard label="Tournaments" value={user?.total_tournaments || 0} icon={<Trophy className="h-4 w-4" />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Strategies */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Strategies</CardTitle>
              <Button variant="ghost" size="sm" asChild><Link href="/strategies">View all</Link></Button>
            </CardHeader>
            <CardContent>
              {sLoading ? <SkeletonList count={3} /> : recentStrategies.length === 0 ? (
                <EmptyState icon={<FlaskConical className="h-8 w-8" />} title="No strategies yet" description="Create your first strategy to start competing" action={<Button size="sm" asChild><Link href="/strategies/new">Create Strategy</Link></Button>} />
              ) : (
                <div className="space-y-2">
                  {recentStrategies.map((s) => (
                    <Link key={s.id} href={`/strategies/${s.id}`} className="flex items-center gap-3 rounded-lg border bg-card/50 p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <FlaskConical className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.total_backtests} backtests · v{s.version}</p>
                      </div>
                      {s.win_rate !== null && (
                        <span className="text-xs font-mono text-win">{s.win_rate.toFixed(0)}%</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Open Tournaments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Open Tournaments</CardTitle>
              <Button variant="ghost" size="sm" asChild><Link href="/tournaments">View all</Link></Button>
            </CardHeader>
            <CardContent>
              {tLoading ? <SkeletonList count={3} /> : openTournaments.length === 0 ? (
                <EmptyState icon={<Trophy className="h-8 w-8" />} title="No open tournaments" description="New tournaments will appear here" />
              ) : (
                <div className="space-y-2">
                  {openTournaments.map((t) => (
                    <Link key={t.id} href={`/tournaments/${t.id}`} className="flex items-center gap-3 rounded-lg border bg-card/50 p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.symbol} · {t.participant_count} participants</p>
                      </div>
                      {t.prize_pool > 0 && <Badge variant="gold">${t.prize_pool}</Badge>}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Backtests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Backtests</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/backtests/last">View all</Link></Button>
          </CardHeader>
          <CardContent>
            {bLoading ? <SkeletonList count={3} /> : recentBacktests.length === 0 ? (
              <EmptyState icon={<Zap className="h-8 w-8" />} title="No backtests yet" description="Run a backtest from your strategies" />
            ) : (
              <div className="space-y-2">
                {recentBacktests.map((bt) => (
                  <Link key={bt.id} href={`/backtests/${bt.id}`} className="flex items-center gap-3 rounded-lg border bg-card/50 p-3 hover:bg-muted/50 transition-colors">
                    <Badge variant={bt.status === "completed" ? "success" : bt.status === "failed" ? "destructive" : "secondary"}>
                      {bt.status}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{bt.symbol} · {bt.timeframe}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(bt.created_at)}</p>
                    </div>
                    {bt.results && typeof bt.results === "object" && "pnl_pct" in bt.results && (
                      <span className={`text-sm font-mono font-bold ${(bt.results.pnl_pct as number) >= 0 ? "text-win" : "text-loss"}`}>
                        {formatPercent(bt.results.pnl_pct as number)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
