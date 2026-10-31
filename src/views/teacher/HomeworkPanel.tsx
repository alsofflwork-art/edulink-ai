import { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Quote, RefreshCw, Send, Sparkles, Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { homeworkSets, photosynthesisTranscript } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { cn, shuffle } from '@/lib/utils';
import type { Audience, QuizItem } from '@/types';

const audiences: { id: Audience; label: string }[] = [
  { id: 'explorer', label: 'Explorer 6–9' },
  { id: 'standard', label: 'Grade 5' },
  { id: 'scholar', label: 'Scholar 13+' },
];

const bloomTone: Record<QuizItem['bloom'], string> = {
  Remember: 'bg-slate-100 text-slate-600',
  Understand: 'bg-sky-50 text-sky-700',
  Apply: 'bg-amber-50 text-amber-700',
  Analyze: 'bg-violet-50 text-violet-700',
  Evaluate: 'bg-rose-50 text-rose-700',
};

export function HomeworkPanel() {
  const [audience, setAudience] = useState<Audience>('standard');
  const [showAnswers, setShowAnswers] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [version, setVersion] = useState(1);
  const [items, setItems] = useState<QuizItem[]>(homeworkSets.standard.items);
  const published = useAppStore((s) => s.homeworkPublished);
  const publishedAt = useAppStore((s) => s.publishedAt);
  const publish = useAppStore((s) => s.publishHomework);
  const pushToast = useAppStore((s) => s.pushToast);

  const regenerate = (next: Audience, bumpVersion: boolean) => {
    setGenerating(true);
    setTimeout(() => {
      const set = homeworkSets[next].items;
      setItems(bumpVersion ? shuffle(set).map((q) => (q.options ? { ...q, options: shuffle(q.options) } : q)) : set);
      if (bumpVersion) setVersion((v) => v + 1);
      setGenerating(false);
    }, 900);
  };

  const changeAudience = (a: Audience) => {
    if (a === audience) return;
    setAudience(a);
    regenerate(a, false);
  };

  const handlePublish = () => {
    publish();
    pushToast({ title: 'Homework published', description: '28 students in Grade 5 Science notified · adaptive versions delivered', tone: 'success' });
  };

  const set = homeworkSets[audience];

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-violet-50 p-2 text-violet-600">
              <Wand2 className="h-4 w-4" />
            </span>
            <CardTitle>Auto-Generated Homework</CardTitle>
            <Badge variant="violet">v{version} · AI draft</Badge>
          </div>
          <CardDescription className="mt-2">
            Drafted purely from the 08:15 “Photosynthesis” audio — every question links back to the moment it was taught.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-1">
            {audiences.map((a) => (
              <button
                key={a.id}
                onClick={() => changeAudience(a.id)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition',
                  audience === a.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShowAnswers((v) => !v)}>
            {showAnswers ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showAnswers ? 'Hide' : 'Show'} key
          </Button>
          <Button size="sm" variant="outline" onClick={() => regenerate(audience, true)} disabled={generating}>
            <RefreshCw className={cn('h-3.5 w-3.5', generating && 'animate-spin')} /> Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">{set.label}</Badge>
          <Badge variant="outline">{items.length} questions</Badge>
          <Badge variant="outline">~{set.minutes} min</Badge>
          <Badge variant="success">
            <CheckCircle2 /> Aligned to SCI-5.3
          </Badge>
          <Badge variant="outline">Generated in 4.2s</Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {generating
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-8" />
                    <Skeleton className="h-8" />
                  </div>
                </div>
              ))
            : items.map((q, idx) => <QuestionCard key={`${q.id}-${version}`} q={q} index={idx} showAnswer={showAnswers} />)}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Publishing sends each student the version matched to their age profile.
          </p>
          {published ? (
            <Badge variant="success" className="px-3 py-1.5 text-sm">
              <CheckCircle2 className="!h-4 !w-4" /> Published at {publishedAt}
            </Badge>
          ) : (
            <Button variant="success" onClick={handlePublish} disabled={generating}>
              <Send className="h-4 w-4" /> Approve & publish to students
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionCard({ q, index, showAnswer }: { q: QuizItem; index: number; showAnswer: boolean }) {
  const source = photosynthesisTranscript.find((s) => s.id === q.sourceSegment);
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition animate-in fade-in-0 slide-in-from-bottom-1 hover:border-slate-300 hover:shadow-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">{index + 1}</span>
        <Badge variant="secondary">{q.type}</Badge>
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', bloomTone[q.bloom])}>{q.bloom}</span>
        <span className="font-mono text-[11px] text-slate-400">{q.objective}</span>
        {q.marks && <span className="ml-auto text-[11px] font-semibold text-slate-500">{q.marks} marks</span>}
      </div>
      <p className="mt-3 text-sm font-medium leading-relaxed text-slate-800">{q.question}</p>

      {q.options && (
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {q.options.map((o) => {
            const correct = showAnswer && o === q.answer;
            return (
              <div
                key={o}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition',
                  correct ? 'border-emerald-300 bg-emerald-50 font-medium text-emerald-800' : 'border-slate-200 text-slate-600',
                )}
              >
                {correct ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <span className="h-3.5 w-3.5 rounded-full border border-slate-300" />}
                {o}
              </div>
            );
          })}
        </div>
      )}
      {!q.options && showAnswer && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-800">
          <span className="font-semibold">Model answer: </span>
          {q.answer}
        </div>
      )}

      {source && (
        <button
          onClick={() => setQuoteOpen((v) => !v)}
          className="mt-3 flex w-full items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-left text-xs text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700"
        >
          <Quote className="mt-0.5 h-3 w-3 shrink-0" />
          <span className={cn(!quoteOpen && 'line-clamp-1')}>
            <span className="font-mono font-semibold">from {source.t}</span> — “{source.text}”
          </span>
        </button>
      )}
    </div>
  );
}
