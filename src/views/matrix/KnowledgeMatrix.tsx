import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  BookOpenCheck,
  CheckCircle2,
  Loader2,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wand2,
  XCircle,
} from 'lucide-react';
import { ageBandOutputs, photosynthesisTranscript, socraticVsDirect, syllabusChapter, type AgeBand } from '@/data/mockData';
import { highlight } from '@/lib/highlight';
import { cn } from '@/lib/utils';

type Phase = 'idle' | 'transcribing' | 'generating' | 'done';
type StageState = 'idle' | 'running' | 'done';

const segments = photosynthesisTranscript;
const allConcepts = segments.flatMap((s) => s.concepts);

function StageHeader({ n, title, sub, state, icon: Icon }: { n: number; title: string; sub: string; state: StageState; icon: typeof AudioLines }) {
  return (
    <div className="flex items-start gap-3 border-b border-white/10 p-4">
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1',
          state === 'done' ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30' : state === 'running' ? 'bg-sky-500/15 text-sky-300 ring-sky-400/30' : 'bg-white/5 text-slate-400 ring-white/10',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Stage {n}</p>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
      <span
        className={cn(
          'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
          state === 'done' ? 'bg-emerald-500/15 text-emerald-300' : state === 'running' ? 'bg-sky-500/15 text-sky-300' : 'bg-white/5 text-slate-500',
        )}
      >
        {state === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
        {state === 'done' && <CheckCircle2 className="h-3 w-3" />}
        {state}
      </span>
    </div>
  );
}

function Connector({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center py-1 lg:px-1 lg:py-0">
      <div className={cn('relative flex h-10 w-10 items-center justify-center rounded-full border', active ? 'border-teal-400/50 bg-teal-400/10 text-teal-300' : 'border-white/10 text-slate-600')}>
        {active && <span className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping-slow" />}
        <ArrowRight className="hidden h-4 w-4 lg:block" />
        <ArrowDown className="h-4 w-4 lg:hidden" />
      </div>
    </div>
  );
}

export function KnowledgeMatrix() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [revealed, setRevealed] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [band, setBand] = useState<AgeBand>('10-12');

  useEffect(() => {
    setPhase('transcribing');
  }, []);

  useEffect(() => {
    if (phase !== 'transcribing') return;
    if (revealed >= segments.length) {
      const t = setTimeout(() => setPhase('generating'), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealed((r) => r + 1), 750);
    return () => clearTimeout(t);
  }, [phase, revealed]);

  useEffect(() => {
    if (phase !== 'generating') return;
    const t = setTimeout(() => setPhase('done'), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  const run = () => {
    setSelected(null);
    setRevealed(0);
    setPhase('transcribing');
  };

  const visible = segments.slice(0, revealed);
  const selectedSeg = segments.find((s) => s.id === selected);

  const loScores = useMemo(() => {
    const scores: Record<string, { score: number; from: string[] }> = {};
    syllabusChapter.objectives.forEach((o) => (scores[o.id] = { score: 0, from: [] }));
    visible.forEach((s) =>
      s.matches.forEach((m) => {
        const entry = scores[m.lo];
        if (!entry) return;
        entry.score = Math.max(entry.score, m.score);
        entry.from.push(s.id);
      }),
    );
    return scores;
  }, [visible]);

  const stage1: StageState = phase === 'idle' ? 'idle' : phase === 'transcribing' ? 'running' : 'done';
  const stage2: StageState = phase === 'idle' || revealed === 0 ? 'idle' : phase === 'transcribing' ? 'running' : 'done';
  const stage3: StageState = phase === 'generating' ? 'running' : phase === 'done' ? 'done' : 'idle';
  const output = ageBandOutputs[band];
  const chapterConfidence = Math.round(
    (Object.values(loScores).reduce((s, v) => s + v.score, 0) / syllabusChapter.objectives.length) * 100,
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-4 text-slate-100 shadow-2xl shadow-slate-900/30 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-grid-slate" />
        <div className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
              <Sparkles className="h-3.5 w-3.5" /> The AI Layer
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Knowledge Matrix</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Watch one minute of classroom audio flow through EduLink AI — transcribed, aligned to the official syllabus, then turned into homework tuned for every age group.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              ['Latency', '4.2s'],
              ['ASR accuracy', '96.9%'],
              ['Chapter match', phase === 'idle' ? '—' : `${chapterConfidence}%`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{k}</p>
                <p className="font-mono text-sm font-semibold text-white">{v}</p>
              </div>
            ))}
            <button
              onClick={run}
              disabled={phase === 'transcribing' || phase === 'generating'}
              className="flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-teal-400 to-emerald-400 px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:opacity-60"
            >
              {phase === 'done' ? <RotateCcw className="h-4 w-4" /> : phase === 'idle' ? <Play className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
              {phase === 'done' ? 'Replay pipeline' : phase === 'idle' ? 'Run pipeline' : 'Processing…'}
            </button>
          </div>
        </div>

        <div className="relative mt-6 grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-0">
          {/* Stage 1: transcript */}
          <section className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
            <StageHeader n={1} title="Raw Mic Audio Transcript" sub="Lapel mic → on-device denoise → speech-to-text" state={stage1} icon={AudioLines} />
            <div className="flex h-12 items-center gap-[3px] border-b border-white/5 px-4">
              {Array.from({ length: 48 }).map((_, i) => (
                <span
                  key={i}
                  className={cn('w-full rounded-full', stage1 === 'running' ? 'animate-wave bg-teal-400/80' : 'bg-slate-700')}
                  style={{ height: `${20 + ((i * 53) % 80)}%`, animationDelay: `${(i % 9) * 0.1}s` }}
                />
              ))}
            </div>
            <div className="scrollbar-thin max-h-[460px] flex-1 space-y-2 overflow-y-auto p-3">
              {visible.length === 0 && <p className="p-4 text-center text-sm text-slate-500">Waiting for audio stream…</p>}
              {visible.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(selected === s.id ? null : s.id)}
                  className={cn(
                    'w-full rounded-xl border p-3 text-left text-[13px] leading-relaxed transition animate-in fade-in-0 slide-in-from-left-2',
                    selected === s.id ? 'border-teal-400/60 bg-teal-400/10 ring-1 ring-teal-400/40' : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/5',
                  )}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-mono text-[10px] text-teal-300">{s.t}</span>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">Teacher</span>
                  </div>
                  <span className="text-slate-300">{highlight(s.text, allConcepts, 'rounded bg-teal-400/15 px-0.5 text-teal-200')}</span>
                </button>
              ))}
            </div>
            <p className="border-t border-white/5 px-4 py-2 text-[11px] text-slate-500">Tip: click any segment to trace it through the pipeline.</p>
          </section>

          <Connector active={stage2 !== 'idle'} />

          {/* Stage 2: syllabus matching */}
          <section className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
            <StageHeader n={2} title="Syllabus Matching Algorithm" sub="Semantic embeddings × keyword overlap vs. SCI-5.3" state={stage2} icon={BookOpenCheck} />
            <div className="border-b border-white/5 px-4 py-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Top chapter candidate</span>
                <span className="font-mono text-emerald-300">{syllabusChapter.code}</span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-white">{syllabusChapter.title}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="rounded-md bg-white/5 py-1.5">
                  <p className="text-slate-500">Embedding</p>
                  <p className="font-mono text-slate-200">w = 0.7</p>
                </div>
                <div className="rounded-md bg-white/5 py-1.5">
                  <p className="text-slate-500">Keywords</p>
                  <p className="font-mono text-slate-200">w = 0.3</p>
                </div>
                <div className="rounded-md bg-white/5 py-1.5">
                  <p className="text-slate-500">Threshold</p>
                  <p className="font-mono text-slate-200">≥ 0.60</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2 p-3">
              {syllabusChapter.objectives.map((o) => {
                const entry = loScores[o.id];
                const pct = Math.round(entry.score * 100);
                const linked = selectedSeg?.matches.find((m) => m.lo === o.id);
                const dim = selectedSeg && !linked;
                return (
                  <div
                    key={o.id}
                    className={cn(
                      'rounded-xl border p-3 transition-all duration-300',
                      linked ? 'border-emerald-400/60 bg-emerald-400/10 ring-1 ring-emerald-400/40' : 'border-white/5 bg-white/[0.02]',
                      dim && 'opacity-35',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-200">{o.id}</span>
                      <span className={cn('font-mono text-xs font-semibold', pct >= 60 ? 'text-emerald-300' : 'text-slate-500')}>
                        {linked ? `${Math.round(linked.score * 100)}% from ${selectedSeg?.t}` : pct ? `${pct}%` : '—'}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{o.text}</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <Connector active={stage3 !== 'idle'} />

          {/* Stage 3: generator */}
          <section className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
            <StageHeader n={3} title="Age-Appropriate Homework Generator" sub="Pedagogy model + readability & Bloom’s constraints" state={stage3} icon={Wand2} />
            <div className="border-b border-white/5 p-3">
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-white/5 p-1">
                {(Object.keys(ageBandOutputs) as AgeBand[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBand(b)}
                    className={cn('rounded-md py-1.5 text-xs font-semibold transition', band === b ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white')}
                  >
                    Ages {b}
                  </button>
                ))}
              </div>
            </div>
            {stage3 === 'done' ? (
              <div key={band} className="flex-1 space-y-3 p-3 animate-in fade-in-0">
                <p className="text-sm font-semibold text-white">{output.label}</p>
                <dl className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    ['Readability', output.readability],
                    ['Vocabulary', output.vocabulary],
                    ['Format', output.format],
                    ['Style', output.style],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-md bg-white/5 px-2 py-1.5">
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="mt-0.5 text-slate-200">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="space-y-2">
                  {output.items.map((item, i) => {
                    const src = segments.find((s) => s.id === item.source);
                    const linked = selected === item.source;
                    return (
                      <div
                        key={item.q}
                        className={cn(
                          'rounded-xl border p-3 transition-all duration-300',
                          linked ? 'border-violet-400/60 bg-violet-400/10 ring-1 ring-violet-400/40' : 'border-white/5 bg-white/[0.02]',
                          selected && !linked && 'opacity-35',
                        )}
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <p className="text-[13px] leading-relaxed text-slate-200">{item.q}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                          <span className="rounded bg-violet-400/15 px-1.5 py-0.5 text-violet-200">{item.type}</span>
                          <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 font-mono text-emerald-300">{item.lo}</span>
                          <span className="rounded bg-teal-400/10 px-1.5 py-0.5 font-mono text-teal-300">src {src?.t}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-3 p-3">
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  {stage3 === 'running' ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-300" /> Generating adaptive question sets…
                    </>
                  ) : (
                    'Waiting for syllabus alignment…'
                  )}
                </p>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2 rounded-xl border border-white/5 p-3">
                    <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
                    <div className="flex gap-1.5">
                      <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
                      <div className="h-3 w-12 animate-pulse rounded bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900">Socratic Guardrail</h3>
              <p className="text-sm text-slate-500">The tutor model is constrained to guide reasoning, never to hand over answers.</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Policy enforced
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {socraticVsDirect.map((row) => (
              <div key={row.ask} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-sm font-medium text-slate-800">🧒 “{row.ask}”</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-2.5">
                    <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-rose-600">
                      <XCircle className="h-3.5 w-3.5" /> Direct answer · blocked
                    </p>
                    <p className="mt-1 text-sm text-rose-900/70 line-through decoration-rose-400">{row.direct}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5">
                    <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Socratic hint · delivered
                    </p>
                    <p className="mt-1 text-sm text-emerald-950">{row.socratic}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: Lock, title: 'Privacy by design', text: 'Student voices are filtered on-device; only teacher speech is transcribed. PII is redacted before upload.', tone: 'bg-indigo-50 text-indigo-600' },
            { icon: UserCheck, title: 'Teacher-in-the-loop', text: 'Every AI summary and homework set requires one-tap teacher approval before students see it.', tone: 'bg-emerald-50 text-emerald-600' },
            { icon: BookOpenCheck, title: 'Curriculum-grounded', text: 'Generation is constrained to matched syllabus objectives — no off-curriculum content or hallucinated facts.', tone: 'bg-amber-50 text-amber-600' },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className={cn('h-fit rounded-lg p-2', c.tone)}>
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{c.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{c.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
