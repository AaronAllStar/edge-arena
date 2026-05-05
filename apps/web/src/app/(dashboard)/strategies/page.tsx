"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useStrategies } from "@/hooks/use-api";
import { formatPercent, timeAgo } from "@/lib/utils";
import { Plus, FlaskConical, Play, Copy, MoreVertical } from "lucide-react";

export default function StrategiesPage() {
  const { data: strategies, isLoading } = useStrategies();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Strategies</h1>
            <p className="text-sm text-muted-foreground">Build and manage your trading strategies</p>
          </div>
          <Button asChild variant="glow">
            <Link href="/strategies/new"><Plus className="mr-2 h-4 w-4" />New Strategy</Link>
          </Button>
        </div>

        {isLoading ? (
          <SkeletonList count={5} />
        ) : !strategies?.length ? (
          <EmptyState
            icon={<FlaskConical className="h-10 w-10" />}
            title="No strategies yet"
            description="Create your first strategy to start building your edge in the market."
            action={<Button asChild><Link href="/strategies/new"><Plus className="mr-2 h-4 w-4" />Create Strategy</Link></Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {strategies.map((s) => (
              <Link key={s.id} href={`/strategies/${s.id}`}>
                <Card className="stat-card h-full hover:border-primary/40 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{s.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">v{s.version} · {timeAgo(s.updated_at)}</p>
                      </div>
                      <Badge variant={s.status === "active" ? "success" : s.status === "draft" ? "secondary" : "outline"}>
                        {s.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Backtests</p>
                        <p className="font-mono font-semibold">{s.total_backtests}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Win Rate</p>
                        <p className={`font-mono font-semibold ${s.win_rate && s.win_rate > 50 ? "text-win" : ""}`}>
                          {s.win_rate !== null ? `${s.win_rate.toFixed(0)}%` : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Best Sharpe</p>
                        <p className="font-mono font-semibold">
                          {s.best_sharpe !== null ? s.best_sharpe.toFixed(2) : "—"}
                        </p>
                      </div>
                    </div>
                    {s.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {s.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
