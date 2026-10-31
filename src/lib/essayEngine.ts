import { essayRubric, essaySocraticPrompts, essayTask } from '@/data/mockData';

export interface CriterionResult {
  id: string;
  label: string;
  score: number;
  max: number;
  hits: string[];
  missing: string[];
}

export interface EssayAnalysis {
  words: number;
  paragraphs: number;
  total: number;
  grade: string;
  criteria: CriterionResult[];
  strengths: string[];
  prompts: string[];
}

const STRUCTURE_MAX = 15;

/** Rubric-based feedback. It asks guiding questions and never rewrites the student's text. */
export function analyzeEssay(text: string): EssayAnalysis {
  const lower = text.toLowerCase();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;

  const criteria: CriterionResult[] = essayRubric.map((c) => {
    const hits: string[] = [];
    const missing: string[] = [];
    c.keywords.forEach((k) => {
      const alts = k.split('|');
      (alts.some((a) => lower.includes(a)) ? hits : missing).push(alts[0]);
    });
    return { id: c.id, label: c.label, max: c.max, hits, missing, score: Math.round((hits.length / c.keywords.length) * c.max) };
  });

  const [minWords] = essayTask.targetWords;
  const paraScore = paragraphs >= 4 ? 1 : paragraphs === 3 ? 0.75 : paragraphs === 2 ? 0.45 : paragraphs === 1 ? 0.2 : 0;
  const lengthFactor = words >= minWords ? 1 : words >= 150 ? 0.8 : words >= 60 ? 0.5 : 0.2;
  const structureScore = Math.round(STRUCTURE_MAX * paraScore * lengthFactor);
  criteria.push({
    id: 'structure',
    label: 'Structure & clarity',
    max: STRUCTURE_MAX,
    score: structureScore,
    hits: [],
    missing: structureScore < STRUCTURE_MAX ? ['structure'] : [],
  });

  const total = criteria.reduce((sum, c) => sum + c.score, 0);
  const grade = total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : total >= 40 ? 'D' : 'E';

  const strengths = criteria
    .filter((c) => c.hits.length && c.hits.length / (c.hits.length + c.missing.length) >= 0.5)
    .map((c) => `${c.label}: you correctly use ${c.hits.slice(0, 3).map((h) => `“${h}”`).join(', ')}.`);
  if (structureScore >= 11) strengths.push('Clear paragraph structure that is easy to follow.');

  const prompts = criteria
    .flatMap((c) => c.missing)
    .filter((m) => m !== 'structure')
    .map((m) => essaySocraticPrompts[m])
    .filter(Boolean)
    .slice(0, 4);
  if (words < minWords) prompts.push(`Your draft is ${words} words — the target is ${essayTask.targetWords.join('–')}. Which idea could you develop with an example?`);

  return { words, paragraphs, total, grade, criteria, strengths, prompts };
}
