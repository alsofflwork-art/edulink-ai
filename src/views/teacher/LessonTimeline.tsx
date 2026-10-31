import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { lessons } from '@/data/mockData';
import { useLessonStatus } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/types';

export function StatusBadge({ lesson }: { lesson: Lesson }) {
  const status = useLessonStatus(lesson);
  if (status === 'live')
    return (
      <Badge variant="danger">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" /> Recording
      </Badge>
    );
  if (status === 'processing')
    return (
      <Badge variant="info">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" /> AI processing
      </Badge>
    );
  return <Badge variant="success">Processed</Badge>;
}

function TimelineItem({ lesson, selected, onSelect }: { lesson: Lesson; selected: boolean; onSelect: () => void }) {
  const status = useLessonStatus(lesson);
  const dot = status === 'live' ? 'bg-rose-500' : status === 'processing' ? 'bg-sky-500' : 'bg-emerald-500';

  return (
    <button onClick={onSelect} className="group text-left focus-visible:outline-none">
      <div className="flex items-center gap-2">
        <span className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-4 ring-white">
          {status === 'live' && <span className="absolute h-4 w-4 animate-ping rounded-full bg-rose-400 opacity-60" />}
          <span className={cn('h-3 w-3 rounded-full', dot)} />
        </span>
        <span className="font-mono text-xs font-medium text-slate-500">{lesson.time}</span>
      </div>
      <div
        className={cn(
          'mt-3 rounded-xl border p-3 transition-all',
          selected
            ? 'border-indigo-300 bg-indigo-50/60 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-300'
            : 'border-slate-200 bg-white group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-sm',
        )}
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{lesson.className}</p>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-slate-800">{lesson.title}</p>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500">{lesson.duration}</span>
          <StatusBadge lesson={lesson} />
        </div>
      </div>
    </button>
  );
}

export function LessonTimeline({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Today’s Recorded Lessons</CardTitle>
          <CardDescription className="mt-1">Captured automatically by the lapel mic — select a lesson to inspect the AI output</CardDescription>
        </div>
        <Badge variant="outline">{lessons.length} sessions</Badge>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-2 right-2 top-2 hidden h-0.5 bg-gradient-to-r from-emerald-200 via-sky-200 to-rose-200 md:block" />
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {lessons.map((l) => (
              <TimelineItem key={l.id} lesson={l} selected={l.id === selectedId} onSelect={() => onSelect(l.id)} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
