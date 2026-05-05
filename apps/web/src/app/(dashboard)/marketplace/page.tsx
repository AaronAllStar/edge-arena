"use client";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Store, Star, ShoppingCart } from "lucide-react";

export default function MarketplacePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-sm text-muted-foreground">Discover and acquire proven trading strategies</p>
        </div>

        <EmptyState
          icon={<Store className="h-10 w-10" />}
          title="Marketplace coming soon"
          description="Publish your strategies for sale and acquire strategies from top performers. Available in a future update."
          action={<Badge variant="outline">Premium feature</Badge>}
        />

        {/* Preview cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-50 pointer-events-none">
          {[
            { name: "EMA Momentum Pro", sharpe: 2.41, wr: 67.3, rating: 4.8, price: 49.99 },
            { name: "RSI Mean Reversion", sharpe: 1.89, wr: 58.1, rating: 4.5, price: 29.99 },
            { name: "Bollinger Squeeze Hunter", sharpe: 3.12, wr: 72.5, rating: 4.9, price: 79.99 },
          ].map((s) => (
            <Card key={s.name} className="stat-card">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-1">{s.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">By @algotrader · BTC/USDT</p>
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div><p className="text-xs text-muted-foreground">Sharpe</p><p className="font-mono font-bold">{s.sharpe}</p></div>
                  <div><p className="text-xs text-muted-foreground">Win Rate</p><p className="font-mono font-bold text-win">{s.wr}%</p></div>
                  <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /><span className="font-bold">{s.rating}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">${s.price}</span>
                  <Badge variant="outline"><ShoppingCart className="h-3 w-3 mr-1" />Preview</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
