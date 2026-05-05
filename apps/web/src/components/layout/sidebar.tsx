"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FlaskConical, Trophy, Store, Settings, LogOut,
  Swords, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/strategies", label: "Strategies", icon: FlaskConical },
  { href: "/backtests", label: "Backtests", icon: BarChart3 },
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Swords className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold tracking-tight">EdgeArena</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {user && (
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
              {user.username?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">
                {user.display_name || user.username}
              </p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {user.plan} plan
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
