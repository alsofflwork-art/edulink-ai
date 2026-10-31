import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, HelpCircle, RotateCcw, ScanSearch, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { essayTask } from '@/data/mockData';
import { analyzeEssay, type EssayAnalysis } from '@/lib/essayEngine';
import { cn } from '@/lib/utils';

const gradeTone: Record<string, string> = {
  A: 'text-emerald-600',
  B: 'text-indigo-600',
  C: 'text-amber-600',
  D: 'text-orange-600',
  E: 'text-rose-600',
};

export function EssayFeedback() {
  const [draft, setDraft] = useState(essayTask.starterDraft);
  const [analysis, setAnalysis] = useState<EssayAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedText, setAnalyzedText] = useState('');

  const words = useMemo(() => (draft.trim() ? draft.trim().split(/\s+/).length : 0), [draft]);
  const stale = analysis !== null && analyzedText !== draft;

  const run = (text: string) => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalysis(analyzeEssay(text));
      setAnalyzedText(text);
      setAnalyzing(false);
    }, 1100);
  };

  useEffect(() => {
    run(essayTask.starterDraft);
  }, []);

  const [minW, maxW] = essayTask.targetWords;
  const circumference = 2 * Math.PI * 40;

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg">Essay & Homework Feedback</CardTitle>
          <CardDescription className="mt-1">Rubric-aligned feedback that asks guiding questions — it never rewrites your work.</CardDescription>
        </div>
        <Badge variant="success" className="px-2.5 py-1">
          <ShieldCheck /> Academic-integrity mode
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-sm text-indigo-900">
              <span className="font-semibold">Prompt: </span>
              {essayTask.prompt}
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck
              className="mt-3 h-80 w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="Start writing your essay…"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className={cn('font-semibold tabular-nums', words < minW ? 'text-amber-600' : words > maxW ? 'text-rose-600' : 'text-emerald-600')}>
                  {words} words
                </span>
                <span>
                  Target {minW}–{maxW}
                </span>
                {stale && <Badge variant="warning">Draft changed — re-analyse</Badge>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setDraft(essayTask.starterDraft)}>
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
                <Button size="sm" onClick={() => run(draft)} disabled={analyzing || !draft.trim()}>
                  <ScanSearch className="h-3.5 w-3.5" /> {analyzing ? 'Analysing…' : 'Analyse draft'}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {analyzing || !analysis ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-full" />
                ))}
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className={cn('space-y-5 transition-opacity animate-in fade-in-0', stale && 'opacity-60')}>
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 shrink-0">
                    <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - analysis.total / 100)}
                        className={cn('transition-all duration-700', gradeTone[analysis.grade])}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={cn('text-2xl font-bold', gradeTone[analysis.grade])}>{analysis.grade}</span>
                      <span className="text-[11px] text-slate-400">{analysis.total}/100</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Predicted grade: {analysis.grade}</p>
                    <p className="text-sm text-slate-500">
                      {analysis.words} words · {analysis.paragraphs} paragraph{analysis.paragraphs === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {analysis.criteria.map((c) => (
                    <div key={c.id}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-medium text-slate-700">{c.label}</span>
                        <span className="tabular-nums text-slate-500">
                          {c.score}/{c.max}
                        </span>
                      </div>
                      <Progress
                        value={(c.score / c.max) * 100}
                        className="h-1.5"
                        indicatorClassName={c.score / c.max >= 0.75 ? 'bg-emerald-500' : c.score / c.max >= 0.45 ? 'bg-indigo-500' : 'bg-amber-500'}
                      />
                    </div>
                  ))}
                </div>

                {analysis.strengths.length > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">Strengths</p>
                    <ul className="space-y-1">
                      {analysis.strengths.map((s) => (
                        <li key={s} className="flex gap-2 text-sm text-emerald-900">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.prompts.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">Questions to push your thinking</p>
                    <ul className="space-y-1.5">
                      {analysis.prompts.map((p) => (
                        <li key={p} className="flex gap-2 text-sm text-amber-950">
                          <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
