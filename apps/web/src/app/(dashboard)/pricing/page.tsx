"use client";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { useAuthStore } from "@/stores/auth";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    icon: <Zap className="h-5 w-5" />,
    description: "Get started with the basics",
    features: ["5 strategies", "20 backtests/month", "5 copies/day", "10 AI messages/day", "Public tournaments"],
    limits: { strategies: 5, backtests: 20, copies: 5 },
  },
  {
    id: "basic",
    name: "Basic",
    price: 9,
    icon: <Sparkles className="h-5 w-5" />,
    description: "For serious strategists",
    features: ["25 strategies", "200 backtests/month", "50 copies/day", "100 AI messages/day", "All tournaments", "Marketplace access"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 29,
    icon: <Crown className="h-5 w-5" />,
    description: "Unlimited power",
    features: ["Unlimited strategies", "Unlimited backtests", "Unlimited copies", "Unlimited AI messages", "Create tournaments", "Sell on marketplace", "Priority support"],
  },
];

export default function PricingPage() {
  const { user } = useAuthStore();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Choose your plan</h1>
          <p className="text-muted-foreground">Start free, upgrade when you need more power</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = user?.plan === plan.id;
            return (
              <Card key={plan.id} className={`relative stat-card ${plan.popular ? "border-primary glow-primary" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="shadow-lg">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {plan.icon}
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-accent shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? "glow" : "outline"} disabled={isCurrent}>
                    {isCurrent ? "Current Plan" : plan.price === 0 ? "Get Started" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
