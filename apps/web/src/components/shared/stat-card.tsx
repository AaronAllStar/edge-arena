import { cn, formatPercent, ratingTier } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, subtitle, trend, icon, className }: StatCardProps) {
  return (
    <div className={cn("stat-card rounded-xl border bg-card p-5", className)}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight">{value}</span>
        {trend !== undefined && (
          <span className={cn("text-sm font-medium mb-1", trend >= 0 ? "text-win" : "text-loss")}>
            {formatPercent(trend)}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

interface RatingBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function RatingBadge({ rating, size = "md", showLabel = false, className }: RatingBadgeProps) {
  const tier = ratingTier(rating);
  const sizes = { sm: "text-xs px-1.5 py-0.5", md: "text-sm px-2 py-1", lg: "text-base px-3 py-1.5" };

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-lg font-mono font-bold", tier.color, sizes[size], className)}>
      {rating}
      {showLabel && <span className="text-xs font-sans font-normal opacity-80">{tier.label}</span>}
    </span>
  );
}

interface WinRateBarProps {
  wins: number;
  losses: number;
  className?: string;
}

export function WinRateBar({ wins, losses, className }: WinRateBarProps) {
  const total = wins + losses;
  const winPct = total > 0 ? (wins / total) * 100 : 0;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs">
        <span className="text-win font-medium">{wins}W</span>
        <span className="text-muted-foreground">{total > 0 ? `${winPct.toFixed(0)}%` : "—"}</span>
        <span className="text-loss font-medium">{losses}L</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-loss/20">
        <div className="bg-win transition-all" style={{ width: `${winPct}%` }} />
      </div>
    </div>
  );
}

interface TierBadgeProps {
  tier: string;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config: Record<string, { variant: "gold" | "default" | "secondary" | "outline"; icon: string }> = {
    free: { variant: "secondary", icon: "○" },
    basic: { variant: "default", icon: "◆" },
    premium: { variant: "gold", icon: "★" },
  };
  const c = config[tier] || config.free;
  return (
    <Badge variant={c.variant} className={cn("capitalize", className)}>
      {c.icon} {tier}
    </Badge>
  );
}
