import { BellRing, CalendarClock, Flame, FlaskConical, ListChecks, PenLine, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { scholarDeadlines, scholarStudent, scholarSyllabus } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { LectureNotes } from './LectureNotes';
import { EssayFeedback } from './EssayFeedback';

const deadlineIcon = { Essay: PenLine, Lab: FlaskConical, Quiz: ListChecks };

export function ScholarMode() {
  const published = useAppStore((s) => s.homeworkPublished);
  const overall = Math.round(scholarSyllabus.reduce((s, c) => s + c.progress, 0) / scholarSyllabus.length);
  const circumference = 2 * Math.PI * 34;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">{scholarStudent.initials}</div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Good afternoon, {scholarStudent.firstName}</h2>
            <p className="text-sm text-slate-500">{scholarStudent.grade}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="px-3 py-1 text-sm">
            <CalendarClock className="!h-3.5 !w-3.5 text-rose-500" /> {scholarStudent.due} due this week
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-sm">
            <Flame className="!h-3.5 !w-3.5 text-orange-500" /> {scholarStudent.streak}-day streak
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-sm">
            <TrendingUp className="!h-3.5 !w-3.5 text-emerald-500" /> Avg. {scholarStudent.avgScore}%
          </Badge>
        </div>
      </div>

      {published && (
        <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800 animate-in slide-in-from-top-2 fade-in-0">
          <BellRing className="h-4 w-4" />
          <span>
            <span className="font-semibold">New assignment:</span> “Gas exchange” structured questions (4 items · 16 marks) — generated from today’s lecture.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LectureNotes />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Syllabus Progress</CardTitle>
              <CardDescription>Biology 8 · tracked against classroom audio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-5 flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0">
                  <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="url(#sg)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - overall / 100)}
                    />
                    <defs>
                      <linearGradient id="sg" x1="0" x2="1">
                        <stop offset="0" stopColor="#4f46e5" />
                        <stop offset="1" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{overall}%</span>
                </div>
                <div className="text-sm text-slate-500">
                  <p className="font-semibold text-slate-800">On track for Term 2</p>
                  <p>1 of 5 chapters complete. Projected finish: 12 Dec.</p>
                </div>
              </div>
              <div className="space-y-3.5">
                {scholarSyllabus.map((c) => (
                  <div key={c.code}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate">
                        <span className="mr-1.5 font-mono text-xs text-slate-400">{c.code}</span>
                        <span className="font-medium text-slate-700">{c.chapter}</span>
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-slate-500">{c.progress}%</span>
                    </div>
                    <Progress
                      value={c.progress}
                      className="h-1.5"
                      indicatorClassName={cn(c.status === 'Completed' ? 'bg-emerald-500' : c.status === 'In progress' ? 'bg-indigo-500' : 'bg-slate-300')}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {scholarDeadlines.map((d) => {
                const Icon = deadlineIcon[d.type as keyof typeof deadlineIcon];
                return (
                  <div key={d.title} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5 transition hover:bg-slate-50">
                    <span className={cn('rounded-lg p-2', d.urgent ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500')}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{d.title}</p>
                      <p className="text-xs text-slate-400">Due {d.due}</p>
                    </div>
                    {d.urgent && <Badge variant="danger">Soon</Badge>}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <EssayFeedback />
    </div>
  );
}
