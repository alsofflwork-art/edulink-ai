import { useEffect, useState } from 'react';
import { BookMarked, CheckCircle2, Circle, FileText, Loader2, Quote, Radio, Sparkles, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SyllabusDocument } from '@/components/SyllabusDocument';
import { lessons } from '@/data/mockData';
import { useAppStore, useLessonStatus } from '@/store/useAppStore';
import { highlight } from '@/lib/highlight';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/types';
import { StatusBadge } from './LessonTimeline';

export function LessonDetail({ lessonId }: { lessonId: string }) {
  const lesson = lessons.find((l) => l.id === lessonId) ?? lessons[0];
  const status = useLessonStatus(lesson);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, [lessonId]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0 border-b border-slate-100 bg-slate-50/50 pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono">{lesson.time}</span>·<span>{lesson.className}</span>·<span>{lesson.duration}</span>
          </div>
          <CardTitle className="mt-1.5 text-lg">{lesson.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge lesson={lesson} />
          {lesson.hasSyllabusDoc && status === 'processed' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <FileText className="h-3.5 w-3.5" /> Syllabus page
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[88vh] overflow-y-auto p-4 sm:p-6">
                <DialogTitle className="mb-3 flex items-center gap-2 pr-10 text-sm font-semibold text-slate-700">
                  <Sparkles className="h-4 w-4 text-emerald-600" /> Objectives auto-matched from “{lesson.title}”
                </DialogTitle>
                <DialogDescription className="sr-only">Syllabus page with AI-matched objectives highlighted</DialogDescription>
                <SyllabusDocument highlight={lesson.match.objectives.filter((o) => o.covered).map((o) => o.id)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {loading ? (
          <DetailSkeleton />
        ) : status === 'live' ? (
          <LiveCaptions lesson={lesson} />
        ) : status === 'processing' ? (
          <ProcessingState lesson={lesson} />
        ) : (
          <ProcessedDetail lesson={lesson} />
        )}
      </CardContent>
    </Card>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-72" />
      <div className="grid gap-5 md:grid-cols-5">
        <div className="space-y-2.5 md:col-span-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-36 md:col-span-2" />
      </div>
    </div>
  );
}

function ProcessedDetail({ lesson }: { lesson: Lesson }) {
  const conceptTerms = lesson.transcript.flatMap((s) => s.concepts);

  return (
    <Tabs defaultValue="summary">
      <TabsList className="scrollbar-thin max-w-full justify-start overflow-x-auto">
        <TabsTrigger value="summary">
          <Sparkles /> AI Summary
        </TabsTrigger>
        <TabsTrigger value="syllabus">
          <Target /> Syllabus Match
        </TabsTrigger>
        <TabsTrigger value="transcript">
          <Quote /> Transcript
        </TabsTrigger>
      </TabsList>

      <TabsContent value="summary">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
          <div className="md:col-span-3">
            <p className="text-sm leading-relaxed text-slate-600">{lesson.summary}</p>
            <h4 className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Key teaching points</h4>
            <ul className="mt-2 space-y-1.5">
              {lesson.keyPoints.map((p) => (
                <li key={p} className="flex gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 md:col-span-2">
            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  <BookMarked className="h-3.5 w-3.5" /> Auto-matched chapter
                </span>
                <span className="font-mono text-xs font-semibold text-emerald-800">{lesson.match.code}</span>
              </div>
              <p className="mt-2 font-semibold text-slate-900">{lesson.match.chapter}</p>
              <p className="text-sm text-slate-600">{lesson.match.section}</p>
              <div className="mt-3 flex items-center gap-2">
                <Progress value={lesson.match.confidence} className="h-1.5 bg-emerald-100" indicatorClassName="bg-emerald-500" />
                <span className="text-xs font-bold tabular-nums text-emerald-700">{lesson.match.confidence}%</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-700/80">Match confidence</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Detected concepts</h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {lesson.concepts.map((c) => (
                  <Badge key={c} variant="indigo">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400">{lesson.wordCount.toLocaleString()} words transcribed · 2 speakers detected</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="syllabus">
        <div className="space-y-2">
          {lesson.match.objectives.map((o) => (
            <div
              key={o.id}
              className={cn('flex items-start gap-3 rounded-xl border p-3', o.covered ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-slate-50/60')}
            >
              {o.covered ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-700">{o.id}</span>
                  <Badge variant={o.covered ? 'success' : 'secondary'} className="text-[10px]">
                    {o.covered ? 'Covered in audio' : 'Not yet covered'}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{o.text}</p>
              </div>
              <div className="w-20 shrink-0 text-right">
                <p className={cn('text-sm font-bold tabular-nums', o.covered ? 'text-emerald-600' : 'text-slate-400')}>{o.score}%</p>
                <Progress value={o.score} className="mt-1 h-1" indicatorClassName={o.covered ? 'bg-emerald-500' : 'bg-slate-300'} />
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="transcript">
        <div className="scrollbar-thin max-h-80 space-y-3 overflow-y-auto pr-1">
          {lesson.transcript.map((seg) => (
            <div key={seg.id} className="flex gap-3">
              <span className="mt-0.5 h-fit rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">{seg.t}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-slate-700">
                  {highlight(seg.text, conceptTerms, 'rounded bg-indigo-100 px-0.5 text-indigo-900')}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {seg.matches.map((m) => (
                    <span key={m.lo} className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-emerald-700">
                      → {m.lo} · {Math.round(m.score * 100)}%
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}

const processingSteps = ['Audio uploaded & denoised', 'Speech-to-text transcription', 'Syllabus objective matching', 'Drafting homework & summary'];

function ProcessingState({ lesson }: { lesson: Lesson }) {
  const [progress, setProgress] = useState(38);
  const setLessonStatus = useAppStore((s) => s.setLessonStatus);
  const pushToast = useAppStore((s) => s.pushToast);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => Math.min(100, p + 2)), 160);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (progress < 100) return;
    const t = setTimeout(() => {
      setLessonStatus(lesson.id, 'processed');
      pushToast({ title: 'Lesson processed', description: `“${lesson.title}” matched to ${lesson.match.code} · ${lesson.match.confidence}%`, tone: 'success' });
    }, 400);
    return () => clearTimeout(t);
  }, [progress, lesson, setLessonStatus, pushToast]);

  const activeStep = Math.min(processingSteps.length - 1, Math.floor(progress / 25));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        {processingSteps.map((step, i) => {
          const done = i < activeStep || progress >= 100;
          const active = i === activeStep && progress < 100;
          return (
            <div key={step} className="flex items-center gap-3">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : active ? (
                <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
              <span className={cn('text-sm', done ? 'text-slate-700' : active ? 'font-medium text-slate-900' : 'text-slate-400')}>{step}</span>
            </div>
          );
        })}
        <div className="pt-2">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-slate-500">Overall progress</span>
            <span className="font-mono font-semibold text-sky-600">{progress}%</span>
          </div>
          <Progress value={progress} indicatorClassName="bg-gradient-to-r from-sky-500 to-indigo-500" />
        </div>
      </div>
      <div className="space-y-2.5 rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Partial transcript</p>
        {lesson.transcript.map((s) => (
          <p key={s.id} className="text-sm text-slate-600">
            <span className="mr-2 font-mono text-[11px] text-slate-400">{s.t}</span>
            {s.text}
          </p>
        ))}
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function LiveCaptions({ lesson }: { lesson: Lesson }) {
  const [count, setCount] = useState(1);
  const [elapsed, setElapsed] = useState(1342);

  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c >= lesson.transcript.length ? 1 : c + 1)), 2600);
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      clearInterval(id);
      clearInterval(tick);
    };
  }, [lesson.transcript.length]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const visible = lesson.transcript.slice(0, count);
  const detected = Array.from(new Set(visible.flatMap((s) => s.concepts)));

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">
            <Radio className="h-3.5 w-3.5 animate-pulse" /> REC {mm}:{ss}
          </span>
          <span className="text-xs text-slate-500">Live captions · streaming from {lesson.className}</span>
        </div>
        <div className="scrollbar-thin max-h-72 space-y-2.5 overflow-y-auto rounded-xl bg-slate-900 p-4">
          {visible.map((s, i) => (
            <p
              key={s.id}
              className={cn('text-sm leading-relaxed animate-in fade-in-0 slide-in-from-bottom-1', i === visible.length - 1 ? 'text-white' : 'text-slate-400')}
            >
              <span className="mr-2 font-mono text-[11px] text-slate-500">{s.t}</span>
              {s.text}
              {i === visible.length - 1 && <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-emerald-400 align-middle" />}
            </p>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Concepts detected live</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {detected.map((c) => (
              <Badge key={c} variant="info" className="animate-in zoom-in-95">
                {c}
              </Badge>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Provisional syllabus match</p>
          <p className="mt-2 font-semibold text-slate-800">{lesson.match.code} · {lesson.match.section}</p>
          <div className="mt-2 flex items-center gap-2">
            <Progress value={Math.min(95, 40 + count * 9)} className="h-1.5" indicatorClassName="bg-sky-500" />
            <span className="text-xs font-semibold tabular-nums text-sky-600">{Math.min(95, 40 + count * 9)}%</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Homework is drafted when the recording ends.</p>
        </div>
      </div>
    </div>
  );
}
