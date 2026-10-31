import { Flame, Star } from 'lucide-react';
import { explorerStudent } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { MissedClassReplay } from './MissedClassReplay';
import { SocraticTutor } from './SocraticTutor';

export function ExplorerMode() {
  const stars = useAppStore((s) => s.stars);
  const published = useAppStore((s) => s.homeworkPublished);
  const xp = explorerStudent.xp + (stars - 12) * 10;
  const xpPct = Math.min(100, Math.round((xp / explorerStudent.xpToNext) * 100));

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-50 via-emerald-50 to-sky-50 p-4 font-display sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-yellow-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-10 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-4xl shadow-lg shadow-amber-200/60 animate-float">🦊</div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">Hi {explorerStudent.name}! 👋</h2>
            <p className="text-lg text-slate-600">You missed Tuesday’s class — let’s catch up together!</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-md shadow-amber-100">
            <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
            <span key={stars} className="text-2xl font-bold text-slate-800 animate-pop">
              {stars}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-md shadow-orange-100">
            <Flame className="h-7 w-7 fill-orange-400 text-orange-500" />
            <span className="text-2xl font-bold text-slate-800">{explorerStudent.streak}</span>
            <span className="text-sm text-slate-500">days</span>
          </div>
          <div className="min-w-[180px] rounded-2xl bg-white px-4 py-2 shadow-md shadow-emerald-100">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-emerald-700">🌿 {explorerStudent.level}</span>
              <span className="text-slate-400">
                {xp}/{explorerStudent.xpToNext}
              </span>
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-400 transition-all duration-700" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {published && (
        <div className="relative mt-5 flex items-center gap-3 rounded-2xl border-2 border-dashed border-violet-300 bg-white/80 px-4 py-3 animate-in slide-in-from-top-2 fade-in-0">
          <span className="text-3xl">📬</span>
          <p className="text-lg text-slate-700">
            <span className="font-bold text-violet-700">New homework from Ms. Rivera!</span> Sprout made it extra fun just for you.
          </p>
        </div>
      )}

      <div className="relative mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <MissedClassReplay />
        </div>
        <div className="xl:col-span-2">
          <SocraticTutor />
        </div>
      </div>
    </div>
  );
}
