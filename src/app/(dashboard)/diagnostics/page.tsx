"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { computeHealth, fetchStrategyData, type SpaceWithData } from "@/lib/data/api";
import { createClient } from "@/lib/supabase/client";
import { Target, TrendingUp, Footprints, Clock } from "lucide-react";

interface DiagnosticQuestion {
  id: string;
  dimension: string;
  question: string;
}

const questions: DiagnosticQuestion[] = [
  { id: "q1", dimension: "Strategic Clarity", question: "How clearly can you articulate which games you are choosing to play and which you are choosing not to play?" },
  { id: "q2", dimension: "Strategic Clarity", question: "How well does your team understand the difference between your finite and infinite games?" },
  { id: "q3", dimension: "Game Selection", question: "How disciplined are you at saying no to games that don't match your strategic criteria?" },
  { id: "q4", dimension: "Game Selection", question: "How well do you evaluate the asymmetry of payoff before committing resources to a new initiative?" },
  { id: "q5", dimension: "Resource Allocation", question: "How confident are you that your current resource allocation reflects your stated strategic priorities?" },
  { id: "q6", dimension: "Resource Allocation", question: "How effectively do you move resources from harvest/divest categories to invest categories?" },
  { id: "q7", dimension: "Time Horizon", question: "How well do you balance short-term finite game execution with long-term infinite game positioning?" },
  { id: "q8", dimension: "Time Horizon", question: "How often do you revisit and adjust your time horizon assumptions for each strategic initiative?" },
  { id: "q9", dimension: "Decision Quality", question: "How consistently do you document decision rationale and alternatives considered before committing?" },
  { id: "q10", dimension: "Decision Quality", question: "How rigorously do you track decision outcomes and feed learnings back into your strategic process?" },
];

const dimensions = ["Strategic Clarity", "Game Selection", "Resource Allocation", "Time Horizon", "Decision Quality"];

function LiveSignals() {
  const [spaces, setSpaces] = useState<SpaceWithData[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchStrategyData()
      .then((data) => {
        if (!cancelled) setSpaces(data);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load strategy data");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const health = useMemo(() => computeHealth(spaces ?? []), [spaces]);

  if (loadError) {
    return <p className="text-sm text-destructive">{loadError}</p>;
  }

  if (!spaces) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const signals = [
    {
      label: "Strategy Spaces",
      value: `${health.activeSpaces}/${health.totalSpaces}`,
      description: "active spaces in play",
      icon: <Target className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Games",
      value: `${health.activeGames}/${health.totalGames}`,
      description: "active games tracked",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Moves in Flight",
      value: `${health.movesInFlight}/${health.totalMoves}`,
      description: "strategic moves in progress",
      icon: <Footprints className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Pending Decisions",
      value: `${health.pendingDecisions}`,
      description: "awaiting outcome resolution",
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {signals.map((signal) => (
        <Card key={signal.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{signal.label}</CardTitle>
            {signal.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{signal.value}</div>
            <p className="text-xs text-muted-foreground">{signal.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DiagnosticsPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  // Persist the assessment to localStorage (keyed by user id) so a completed
  // or in-progress diagnostic survives navigation.
  const [storageKey, setStorageKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      let key = "lodestar:diagnostic:anon";
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) key = `lodestar:diagnostic:${user.id}`;
      } catch {
        // fall back to the anonymous key
      }
      if (cancelled) return;
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as { answers?: Record<string, unknown>; submitted?: unknown } | null;
          if (parsed && typeof parsed === "object") {
            const restored: Record<string, number> = {};
            for (const q of questions) {
              const v = parsed.answers?.[q.id];
              if (typeof v === "number" && v >= 1 && v <= 5) restored[q.id] = v;
            }
            setAnswers(restored);
            setSubmitted(parsed.submitted === true && questions.every((q) => restored[q.id] !== undefined));
          }
        }
      } catch {
        // ignore corrupted storage
      }
      setStorageKey(key);
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ answers, submitted }));
    } catch {
      // storage unavailable (private mode, quota) — assessment stays in memory
    }
  }, [answers, submitted, storageKey]);

  const handleRetake = () => {
    setSubmitted(false);
    setAnswers({});
    if (storageKey) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    }
  };

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const handleAnswer = (qId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: score }));
  };

  const getDimensionScore = (dim: string) => {
    const dimQuestions = questions.filter((q) => q.dimension === dim);
    const total = dimQuestions.reduce((acc, q) => acc + (answers[q.id] || 0), 0);
    return Math.round((total / (dimQuestions.length * 5)) * 100);
  };

  const getOverallScore = () => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    return Math.round((total / (questions.length * 5)) * 100);
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Strong";
    if (score >= 60) return "Developing";
    if (score >= 40) return "Emerging";
    return "Needs Attention";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  if (submitted) {
    const overall = getOverallScore();
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategy Health Score</h1>
          <p className="text-muted-foreground">Your strategic capability assessment</p>
        </div>

        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <div className={`text-6xl font-bold tabular-nums ${getScoreColor(overall)}`}>
              {overall}
            </div>
            <p className="text-lg font-medium">{getScoreLabel(overall)}</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {overall >= 80 && "Your strategic process is well-structured. Focus on maintaining discipline and adapting to changing conditions."}
              {overall >= 60 && overall < 80 && "Good foundation in place. Strengthen weaker dimensions to build a more cohesive strategic practice."}
              {overall >= 40 && overall < 60 && "Key elements of strategic discipline are developing. Prioritize the lowest-scoring dimensions for immediate improvement."}
              {overall < 40 && "Significant gaps in strategic process. Start with the fundamentals: clarify which games you are playing and document your decisions."}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {dimensions.map((dim) => {
            const score = getDimensionScore(dim);
            return (
              <Card key={dim}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{dim}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className={`text-2xl font-bold tabular-nums ${getScoreColor(score)}`}>
                    {score}%
                  </div>
                  <Progress value={score} />
                  <p className="text-xs text-muted-foreground">{getScoreLabel(score)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Dimension Breakdown</h2>
          {dimensions.map((dim) => {
            const dimQuestions = questions.filter((q) => q.dimension === dim);
            const score = getDimensionScore(dim);
            return (
              <Card key={dim}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{dim}</CardTitle>
                    <span className={`text-sm font-semibold ${getScoreColor(score)}`}>{score}%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dimQuestions.map((q) => (
                      <div key={q.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex-1">{q.question}</span>
                        <span className="ml-4 font-medium tabular-nums">{answers[q.id]}/5</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={handleRetake}>
            Retake Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Strategy Diagnostic</h1>
        <p className="text-muted-foreground">
          Assess your strategic clarity, game selection, and decision-making discipline
        </p>
      </div>

      <LiveSignals />

      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {Object.keys(answers).length} of {questions.length} questions answered
            </p>
            <span className="text-sm font-medium tabular-nums">
              {Math.round((Object.keys(answers).length / questions.length) * 100)}%
            </span>
          </div>
          <Progress value={(Object.keys(answers).length / questions.length) * 100} className="mt-2" />
        </CardContent>
      </Card>

      {dimensions.map((dim, dimIdx) => {
        const dimQuestions = questions.filter((q) => q.dimension === dim);
        return (
          <div key={dim} className="space-y-3">
            {dimIdx > 0 && <Separator />}
            <h2 className="text-lg font-semibold pt-2">{dim}</h2>
            {dimQuestions.map((q) => (
              <Card key={q.id}>
                <CardContent className="py-4 space-y-3">
                  <p className="text-sm font-medium">{q.question}</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <Button
                        key={score}
                        variant={answers[q.id] === score ? "default" : "outline"}
                        size="sm"
                        className="w-10"
                        onClick={() => handleAnswer(q.id, score)}
                      >
                        {score}
                      </Button>
                    ))}
                    <span className="text-xs text-muted-foreground flex items-center ml-2">
                      1 = Weak &middot; 5 = Strong
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      })}

      <div className="flex justify-end">
        <Button size="lg" disabled={!allAnswered} onClick={() => setSubmitted(true)}>
          Calculate Strategy Health Score
        </Button>
      </div>
    </div>
  );
}
