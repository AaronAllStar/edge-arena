"use client";

import { useAuthStore } from "@/stores/auth";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
      <div />
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rating</span>
            <Badge variant="outline" className="font-mono">
              {user.rating}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {user.total_wins}W / {user.total_losses}L
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
