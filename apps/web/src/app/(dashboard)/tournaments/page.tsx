"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useTournaments } from "@/hooks/use-api";
import { timeAgo } from "@/lib/utils";
import { Trophy, Users, Timer, Swords, Sparkles } from "lucide-react";

const typeConfig: Record<string, { color: string; icon: any }> = {
  arena: { color: "text-blue-400", icon: Swords },
  duel: { color: "text-red-400", icon: Swords },
  league: { color: "text-yellow-400", icon: Trophy },
  sponsored: { color: "text-purple-400", icon: Sparkles },
};

function TournamentCard({ t }: { t: any }) {
  const type = typeConfig[t.type] || typeConfig.arena;
  const Icon = type.icon;
  return (
    <Link href={`/tournaments/${t.id}`}>
      <Card className="stat-card h-full hover:border-primary/40 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{t.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{t.symbol} · {t.timeframe}</p>
            </div>
            <Icon className={`h-5 w-5 ${type.color}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{t.participant_count}{t.max_participants ? ` / ${t.max_participants}` : ""}</span>
              </div>
              {t.prize_pool > 0 && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Trophy className="h-3.5 w-3.5" />
                  <span className="font-semibold">${t.prize_pool}</span>
                </div>
              )}
            </div>
            <Badge variant={t.status === "registration" ? "success" : t.status === "running" ? "default" : "secondary"}>
              {t.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function TournamentsPage() {
  const { data: all, isLoading } = useTournaments();
  const active = all?.filter((t) => t.status !== "completed") || [];
  const completed = all?.filter((t) => t.status === "completed") || [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Tournaments</h1>
          <p className="text-sm text-muted-foreground">Compete with other strategists in simulated battles</p>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4">
            {isLoading ? <SkeletonList count={4} /> : active.length === 0 ? (
              <EmptyState icon={<Trophy className="h-10 w-10" />} title="No active tournaments" description="Check back soon for new competitions" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">{active.map((t) => <TournamentCard key={t.id} t={t} />)}</div>
            )}
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            {completed.length === 0 ? (
              <EmptyState icon={<Timer className="h-10 w-10" />} title="No completed tournaments" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">{completed.map((t) => <TournamentCard key={t.id} t={t} />)}</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
