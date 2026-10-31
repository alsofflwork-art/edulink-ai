import { BrainCircuit, GraduationCap, Mic, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { teacher } from '@/data/mockData';
import { cn } from '@/lib/utils';
import type { View } from '@/types';

const views: { id: View; label: string; sub: string; icon: typeof Mic }[] = [
  { id: 'teacher', label: "Teacher's Hub", sub: 'The Input', icon: Mic },
  { id: 'student', label: 'Student Portal', sub: 'The Output', icon: GraduationCap },
  { id: 'matrix', label: 'Knowledge Matrix', sub: 'The AI Layer', icon: BrainCircuit },
];

export function AppHeader() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const micStatus = useAppStore((s) => s.micStatus);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-500 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-bold tracking-tight text-slate-900">
              EduLink <span className="bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">AI</span>
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Classroom → Syllabus → Learner</p>
          </div>
        </div>

        <nav className="order-3 flex w-full gap-1 rounded-xl bg-slate-100 p-1 md:order-none md:mx-auto md:w-auto" aria-label="Demo perspective">
          {views.map((v) => {
            const Icon = v.icon;
            const active = view === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all md:flex-none md:px-4',
                  active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800',
                )}
              >
                <Icon className={cn('h-4 w-4', active && 'text-indigo-600')} />
                <span className="leading-tight">
                  <span className="block text-sm font-semibold">{v.label}</span>
                  <span className="hidden text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:block">{v.sub}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live sync · mic {micStatus}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 ring-2 ring-white">
              {teacher.initials}
            </div>
            <div className="hidden leading-tight lg:block">
              <p className="text-sm font-semibold text-slate-800">{teacher.name}</p>
              <p className="text-xs text-slate-400">{teacher.school}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
