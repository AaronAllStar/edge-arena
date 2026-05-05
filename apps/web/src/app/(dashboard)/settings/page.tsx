"use client";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account</p>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Your public information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input defaultValue={user?.username} disabled />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input defaultValue={user?.display_name || ""} placeholder="Your display name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={user?.email} disabled />
              </div>
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription</CardTitle>
            <CardDescription>Your current plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium capitalize">{user?.plan || "free"} Plan</p>
                <p className="text-sm text-muted-foreground">
                  {user?.plan === "premium" ? "Unlimited everything" : "Upgrade for more power"}
                </p>
              </div>
              {user?.plan !== "premium" && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/pricing"><Sparkles className="mr-1.5 h-3.5 w-3.5" />Upgrade</Link>
                </Button>
              )}
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xl font-bold">0 / {user?.plan === "premium" ? "∞" : "5"}</p>
                <p className="text-xs text-muted-foreground">Strategies</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xl font-bold">0 / {user?.plan === "premium" ? "∞" : "20"}</p>
                <p className="text-xs text-muted-foreground">Backtests (month)</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xl font-bold">0 / {user?.plan === "premium" ? "∞" : "5"}</p>
                <p className="text-xs text-muted-foreground">Copies (today)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm">Delete account</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
