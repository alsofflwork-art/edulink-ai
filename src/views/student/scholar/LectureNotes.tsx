import { useState } from 'react';
import { ChevronDown, Download, Layers, NotebookText, PlayCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { lectureNotes } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { highlight } from '@/lib/highlight';
import { cn } from '@/lib/utils';

export function LectureNotes() {
  const [open, setOpen] = useState<Set<string>>(new Set(lectureNotes.sections.map((s) => s.id)));
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const pushToast = useAppStore((s) => s.pushToast);

  const toggle = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg">{lectureNotes.title}</CardTitle>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="indigo">
              <Sparkles /> AI notes from {lectureNotes.lectureLength} lecture
            </Badge>
            <Badge variant="success">
              {lectureNotes.code} matched · {lectureNotes.matchConfidence}%
            </Badge>
            <Badge variant="outline">{lectureNotes.generatedAt}</Badge>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => pushToast({ title: 'Notes exported', description: 'Photosynthesis-notes.pdf saved to your study drive', tone: 'success' })}>
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="notes">
          <TabsList>
            <TabsTrigger value="notes">
              <NotebookText /> Structured notes
            </TabsTrigger>
            <TabsTrigger value="cards">
              <Layers /> Flashcards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-2">
            {lectureNotes.sections.map((s, i) => {
              const isOpen = open.has(s.id);
              return (
                <div key={s.id} className="rounded-xl border border-slate-200">
                  <button onClick={() => setOpen(toggle(open, s.id))} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">{i + 1}</span>
                    <span className="flex-1 text-sm font-semibold text-slate-800">{s.heading}</span>
                    <span className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
                      <PlayCircle className="h-3 w-3" /> {s.timestamp}
                    </span>
                    <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-4 pb-3 pt-2 animate-in fade-in-0">
                      <ul className="space-y-1.5">
                        {s.bullets.map((b) => (
                          <li key={b} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                            <span>{highlight(b, s.keyTerms, 'rounded bg-amber-100 px-0.5 font-medium text-slate-900')}</span>
                          </li>
                        ))}
                      </ul>
                      {s.id === 'n1' && (
                        <div className="mt-3 rounded-lg bg-slate-900 px-4 py-3 text-center font-mono text-sm text-emerald-300">{lectureNotes.equation}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="cards">
            <p className="mb-3 text-xs text-slate-500">Click a card to flip it. Generated from key terms in the lecture.</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {lectureNotes.flashcards.map((c, i) => {
                const isFlipped = flipped.has(i);
                return (
                  <button
                    key={c.front}
                    onClick={() => setFlipped(toggle(flipped, i))}
                    className={cn(
                      'flex min-h-[120px] flex-col items-center justify-center rounded-xl border p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                      isFlipped ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-white',
                    )}
                  >
                    {isFlipped ? (
                      <p key="back" className="text-sm leading-relaxed text-indigo-900 animate-in fade-in-0 zoom-in-95">
                        {c.back}
                      </p>
                    ) : (
                      <>
                        <p key="front" className="text-base font-semibold text-slate-800 animate-in fade-in-0">
                          {c.front}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-400">Tap to reveal</p>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
