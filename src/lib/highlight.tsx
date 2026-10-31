import type { ReactNode } from 'react';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Wraps every occurrence of `terms` (case-insensitive, longest first) in a <mark>. */
export function highlight(text: string, terms: string[], className: string): ReactNode[] {
  const list = terms.filter(Boolean).sort((a, b) => b.length - a.length);
  if (!list.length) return [text];
  const re = new RegExp(`(${list.map(escapeRegex).join('|')})`, 'gi');
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className={className}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
