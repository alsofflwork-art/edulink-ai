import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const toneStyles = {
  success: { icon: CheckCircle2, className: 'text-emerald-600 bg-emerald-50' },
  info: { icon: Info, className: 'text-indigo-600 bg-indigo-50' },
  warning: { icon: TriangleAlert, className: 'text-amber-600 bg-amber-50' },
};

export function Toaster() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const tone = toneStyles[t.tone ?? 'info'];
        const Icon = tone.icon;
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg shadow-slate-900/10 animate-in slide-in-from-bottom-4 fade-in-0"
          >
            <span className={cn('mt-0.5 rounded-full p-1.5', tone.className)}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-slate-500">{t.description}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="rounded p-1 text-slate-400 hover:text-slate-700" aria-label="Dismiss">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
