"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useLeaderboard } from "@/hooks/use-api";
import { RatingBadge } from "@/components/shared/stat-card";
import { ratingTier } from "@/lib/utils";
import { Crown, Medal, Award } from "lucide-react";

const rankIcons: Record<number, any> = { 1: Crown, 2: Medal, 3: Award };
const rankColors: Record<number, string> = { 1: "text-gold", 2: "text-silver", 3: "text-bronze" };

export default function LeaderboardPage() {
  const { data: entries, isLoading } = useLeaderboard(50);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Top strategists ranked by ELO rating</p>
        </div>

        {isLoading ? (
          <SkeletonList count={10} />
        ) : !entries?.length ? (
          <EmptyState icon={<Crown className="h-10 w-10" />} title="Leaderboard is empty" description="Compete in tournaments to earn rating and appear here" />
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const RankIcon = rankIcons[entry.rank];
              const tier = ratingTier(entry.rating);
              return (
                <Link key={entry.user_id} href={`/profile/${entry.username}`}>
                  <Card className="stat-card hover:border-primary/40 cursor-pointer">
                    <CardContent className="flex items-center gap-4 p-4">
                      {/* Rank */}
                      <div className="w-10 text-center">
                        {RankIcon ? (
                          <RankIcon className={`h-6 w-6 mx-auto ${rankColors[entry.rank]}`} />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">#{entry.rank}</span>
                        )}
                      </div>

                      {/* Avatar placeholder */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 text-sm font-bold`}>
                        {entry.username.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{entry.display_name || entry.username}</p>
                        <p className={`text-xs ${tier.color}`}>{tier.label}</p>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-6 text-sm">
                        <div className="text-right">
                          <p className="text-muted-foreground text-xs">Rating</p>
                          <p className="font-mono font-bold">{entry.rating}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground text-xs">W / L</p>
                          <p className="font-mono">
                            <span className="text-win">{entry.wins}</span>
                            <span className="text-muted-foreground"> / </span>
                            <span className="text-loss">{entry.losses}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground text-xs">Tournaments</p>
                          <p className="font-mono">{entry.tournaments}</p>
                        </div>
                      </div>
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
