import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { activeClasses, type Accent } from '@/data/mockData';

const accentStyles: Record<Accent, { dot: string; bar: string; chip: string }> = {
  emerald: { dot: 'bg-emerald-500', bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  indigo: { dot: 'bg-indigo-500', bar: 'bg-indigo-500', chip: 'bg-indigo-50 text-indigo-700' },
  teal: { dot: 'bg-teal-500', bar: 'bg-teal-500', chip: 'bg-teal-50 text-teal-700' },
  sky: { dot: 'bg-sky-500', bar: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700' },
};

export function ActiveClasses() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Classes</CardTitle>
        <CardDescription>Syllabus coverage auto-tracked from recorded lessons</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {activeClasses.map((c) => {
          const a = accentStyles[c.accent];
          return (
            <div key={c.id} className="group rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50/60">
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${a.chip}`}>
                  {c.name.split(' ').slice(-1)[0].slice(0, 3)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">{c.name}</p>
                    {c.live && (
                      <Badge variant="danger" className="px-1.5 py-0 text-[10px]">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" /> LIVE
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500">
                    {c.room} · Next: {c.nextTopic}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Users className="h-3 w-3" />
                  {c.students}
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <Progress value={c.syllabusProgress} className="h-1.5" indicatorClassName={a.bar} />
                <span className="w-9 text-right text-xs font-semibold tabular-nums text-slate-600">{c.syllabusProgress}%</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
