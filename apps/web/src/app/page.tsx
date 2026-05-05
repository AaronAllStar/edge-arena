import Link from "next/link";
import { Swords, FlaskConical, Trophy, Brain, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between border-b border-border px-8 py-4">
        <div className="flex items-center gap-2">
          <Swords className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">EdgeArena</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            style={{ boxShadow: "0 0 20px rgba(34, 255, 0, 0.4)" }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5"
          style={{ boxShadow: "0 0 20px rgba(34, 255, 0, 0.15)" }}
        >
          <Zap className="h-3.5 w-3.5 text-accent" />
          <span className="text-sm font-medium text-accent neon-text">
            Competitive Trading Laboratory
          </span>
        </div>
        <h1 className="mb-4 max-w-3xl text-5xl font-bold tracking-tight">
          Build strategies. Backtest them.
          <br />
          <span className="gradient-text">Compete in the arena.</span>
        </h1>
        <p className="mb-8 max-w-xl text-lg text-muted-foreground">
          EdgeArena is a competitive platform where you design trading
          strategies, validate them with historical data, and battle other
          traders in simulated tournaments.
        </p>
        <div className="flex gap-4">
          <Link
            href="/register"
            className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            style={{ boxShadow: "0 0 20px rgba(34, 255, 0, 0.4)" }}
          >
            Enter the Arena
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-input bg-background px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border px-8 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <FlaskConical className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-lg font-semibold">Strategy Lab</h3>
            <p className="text-sm text-muted-foreground">
              Design strategies with a visual builder or AI assistance. Define
              entry/exit rules with technical indicators.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <Trophy className="mb-4 h-8 w-8 text-accent" />
            <h3 className="mb-2 text-lg font-semibold">Competitive Arena</h3>
            <p className="text-sm text-muted-foreground">
              Enter tournaments, duel other strategists, climb the leaderboard,
              and earn reputation.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <Brain className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-lg font-semibold">AI Copilot</h3>
            <p className="text-sm text-muted-foreground">
              Get AI help to build, critique, and optimize your trading
              strategies with natural language.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-6 text-center text-sm text-muted-foreground">
        EdgeArena — No real funds. Simulated trading only.
      </footer>
    </div>
  );
}
