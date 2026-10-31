import { useState } from 'react';
import { BookOpenCheck, Clock3, FileText, ListChecks, Mic, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SyllabusDocument } from '@/components/SyllabusDocument';
import { teacher } from '@/data/mockData';
import { MicStatusWidget } from './MicStatusWidget';
import { ActiveClasses } from './ActiveClasses';
import { LessonTimeline } from './LessonTimeline';
import { LessonDetail } from './LessonDetail';
import { HomeworkPanel } from './HomeworkPanel';

const stats = [
  { label: 'Lessons captured today', value: '4', sub: '1 recording live', icon: Mic, tone: 'text-indigo-600 bg-indigo-50' },
  { label: 'Minutes transcribed', value: '125', sub: '16,370 words · 3.1% WER', icon: Clock3, tone: 'text-sky-600 bg-sky-50' },
  { label: 'Avg. syllabus match', value: '94%', sub: '12 objectives covered', icon: Target, tone: 'text-emerald-600 bg-emerald-50' },
  { label: 'Homework auto-drafted', value: '3', sub: 'Awaiting your approval', icon: ListChecks, tone: 'text-violet-600 bg-violet-50' },
];

export function TeacherHub() {
  const [selectedId, setSelectedId] = useState('l1');
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">{today}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Good morning, {teacher.shortName} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Your lapel mic captured today’s lessons. EduLink AI has transcribed, aligned and drafted homework for you.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <FileText className="h-4 w-4" /> Syllabus: SCI-5.3
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[88vh] overflow-y-auto p-4 sm:p-6">
            <DialogTitle className="sr-only">Syllabus chapter SCI-5.3</DialogTitle>
            <DialogDescription className="sr-only">Mock one-page syllabus document</DialogDescription>
            <SyllabusDocument />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">{s.label}</p>
                <span className={`rounded-lg p-2 ${s.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <MicStatusWidget />
          <ActiveClasses />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <LessonTimeline selectedId={selectedId} onSelect={setSelectedId} />
          <LessonDetail lessonId={selectedId} />
        </div>
      </div>

      <HomeworkPanel />

      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <BookOpenCheck className="h-3.5 w-3.5" /> Teacher-in-the-loop: nothing reaches students until you publish it.
      </p>
    </div>
  );
}
