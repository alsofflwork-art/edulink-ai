import { Sparkles } from 'lucide-react';
import { syllabusChapter } from '@/data/mockData';
import { cn } from '@/lib/utils';

/** Mock one-page PDF rendering of the syllabus chapter guidelines. */
export function SyllabusDocument({ highlight = [] }: { highlight?: string[] }) {
  const s = syllabusChapter;
  return (
    <div className="mx-auto max-w-[720px] rounded-sm bg-white px-6 py-8 text-[13px] leading-relaxed text-slate-700 shadow-xl ring-1 ring-slate-200 sm:px-10 sm:py-10">
      <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{s.board}</p>
          <h2 className="mt-1 font-serif text-xl font-bold text-slate-900">{s.title}</h2>
        </div>
        <div className="text-right text-[11px] text-slate-500">
          <p className="font-mono font-semibold text-slate-800">{s.code}</p>
          <p>{s.grade}</p>
          <p>{s.term}</p>
          <p>{s.hours} teaching hours</p>
        </div>
      </div>

      <section className="mt-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">1. Overview</h3>
        <p className="mt-1">{s.overview}</p>
      </section>

      <section className="mt-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">2. Learning objectives</h3>
        <p className="mt-1 text-slate-500">By the end of this chapter, learners should be able to:</p>
        <ul className="mt-2 space-y-1.5">
          {s.objectives.map((o) => {
            const hit = highlight.includes(o.id);
            return (
              <li key={o.id} className={cn('flex gap-2 rounded px-1.5 py-1 transition', hit && 'bg-emerald-50 ring-1 ring-emerald-200')}>
                <span className="w-12 shrink-0 font-mono text-[11px] font-semibold text-slate-900">{o.id}</span>
                <span className="flex-1">{o.text}</span>
                {hit && (
                  <span className="flex h-fit shrink-0 items-center gap-0.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                    <Sparkles className="h-2.5 w-2.5" /> AI matched
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">3. Key vocabulary</h3>
        <table className="mt-2 w-full border-collapse text-[12px]">
          <tbody>
            {s.vocabulary.map((v) => (
              <tr key={v.term} className="border-b border-slate-100">
                <td className="w-40 py-1 pr-3 align-top font-semibold text-slate-900">{v.term}</td>
                <td className="py-1">{v.def}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">4. Assessment guidance</h3>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {s.assessment.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">5. Differentiation</h3>
          <p className="mt-1">
            <span className="font-semibold text-slate-900">Support: </span>
            {s.differentiation.support}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-slate-900">Extension: </span>
            {s.differentiation.extension}
          </p>
        </section>
      </div>

      <div className="mt-6 flex justify-between border-t border-slate-200 pt-2 text-[10px] text-slate-400">
        <span>{s.board} · Revised 2026</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}
