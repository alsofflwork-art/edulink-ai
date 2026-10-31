import { GraduationCap, Rocket } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { AgeMode } from '@/types';
import { ExplorerMode } from './explorer/ExplorerMode';
import { ScholarMode } from './scholar/ScholarMode';

const modes: { id: AgeMode; label: string; sub: string; icon: typeof Rocket }[] = [
  { id: 'explorer', label: 'Ages 6–9', sub: 'Explorer Mode', icon: Rocket },
  { id: 'scholar', label: 'Ages 13+', sub: 'Scholar Mode', icon: GraduationCap },
];

export function StudentPortal() {
  const ageMode = useAppStore((s) => s.ageMode);
  const setAgeMode = useAppStore((s) => s.setAgeMode);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Student Portal · Age-Adaptive</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Same lesson. Re-rendered for every learner.</h1>
          <p className="mt-0.5 text-sm text-slate-500">EduLink AI adapts layout, language, interaction and feedback style to the learner’s developmental stage.</p>
        </div>
        <div className="relative grid w-full grid-cols-2 rounded-xl bg-slate-100 p-1 sm:w-auto">
          <span
            className={cn(
              'absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg shadow-sm transition-all duration-300',
              ageMode === 'explorer' ? 'translate-x-0 bg-gradient-to-r from-amber-400 to-orange-400' : 'translate-x-full bg-gradient-to-r from-indigo-600 to-slate-800',
            )}
          />
          {modes.map((m) => {
            const Icon = m.icon;
            const active = ageMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setAgeMode(m.id)}
                className={cn('relative z-10 flex items-center gap-2.5 rounded-lg px-4 py-2 text-left transition-colors sm:min-w-[180px]', active ? 'text-white' : 'text-slate-600 hover:text-slate-900')}
              >
                <Icon className="h-5 w-5" />
                <span className="leading-tight">
                  <span className="block text-sm font-bold">{m.label}</span>
                  <span className={cn('block text-[11px] font-medium', active ? 'text-white/80' : 'text-slate-400')}>{m.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div key={ageMode} className="animate-in fade-in-0 zoom-in-[0.98] duration-500">
        {ageMode === 'explorer' ? <ExplorerMode /> : <ScholarMode />}
      </div>
    </div>
  );
}
