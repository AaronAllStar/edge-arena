"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, Trophy, Brain, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: <FlaskConical className="h-8 w-8" />,
    title: "Build Strategies",
    desc: "Use our visual rule builder to create trading strategies with indicators like EMA, RSI, MACD and more. Or let AI help you define rules.",
  },
  {
    icon: <Trophy className="h-8 w-8" />,
    title: "Compete in Tournaments",
    desc: "Enter arena tournaments where your strategies compete against others on the same market data. Climb the leaderboard and earn reputation.",
  },
  {
    icon: <Brain className="h-8 w-8" />,
    title: "AI Copilot",
    desc: "Describe your trading idea in natural language and our AI will translate it into strategy rules. Get critiques and optimization suggestions.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <CardTitle className="text-xl">{steps[step].title}</CardTitle>
          <CardDescription>Step {step + 1} of {steps.length}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {steps[step].icon}
            </div>
          </div>
          <p className="text-center text-muted-foreground leading-relaxed">{steps[step].desc}</p>
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button
              className="flex-1"
              onClick={() => step < steps.length - 1 ? setStep(step + 1) : router.push("/strategies/new")}
            >
              {step < steps.length - 1 ? "Next" : "Create your first strategy"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
