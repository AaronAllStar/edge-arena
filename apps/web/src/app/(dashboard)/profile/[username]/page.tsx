"use client";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useLeaderboard } from "@/hooks/use-api";
import { RatingBadge, WinRateBar, StatCard } from "@/components/shared/stat-card";
import { ratingTier } from "@/lib/utils";
import { Trophy, FlaskConical, TrendingUp, Crown } from "lucide-react";

export default function ProfilePage({ params }: { params: { username: string } }) {
  // In a real app, we'd fetch the user profile by username
  // For now, show a placeholder
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Profile header */}
        <Card>
          <CardContent className="flex items-center gap-6 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white">
              {params.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{params.username}</h1>
              <div className="flex items-center gap-3 mt-2">
                <RatingBadge rating={1500} size="lg" showLabel />
                <Badge variant="outline">Premium</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Rating" value="1500" subtitle="Gold" icon={<TrendingUp className="h-4 w-4" />} />
          <StatCard label="Win Rate" value="67%" subtitle="20W / 10L" icon={<Trophy className="h-4 w-4" />} />
          <StatCard label="Strategies" value="8" icon={<FlaskConical className="h-4 w-4" />} />
          <StatCard label="Best Rating" value="1650" subtitle="Peak" icon={<Crown className="h-4 w-4" />} />
        </div>

        <WinRateBar wins={20} losses={10} className="max-w-md" />

        {/* Placeholder for recent activity */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              User activity feed coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
