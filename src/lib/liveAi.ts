import type { Audience, QuizItem, TranscriptSegment } from '@/types';

/**
 * Live homework generation through Presight's on-prem Kimi model.
 *
 * The browser never sees the endpoint or key: it calls /api/llm/kimi/*, which
 * Nginx (Docker) or the Vite dev server proxies to KIMI_BASE_URL with the key
 * attached. When no model is configured the feature stays hidden, so the
 * simulated demo keeps working on any machine.
 */

export interface LiveAiConfig {
  enabled: boolean;
  model: string;
}

export interface LiveHomeworkResult {
  items: QuizItem[];
  model: string;
  latencyMs: number;
}

const CONFIG_URL = '/api/llm/config';
const KIMI_URL = '/api/llm/kimi/chat/completions';
// Reasoning models think before answering; give them room, but not forever.
const TIMEOUT_MS = 170_000;

const TYPES: QuizItem['type'][] = ['Multiple choice', 'Short answer', 'Picture choice', 'Voice answer', 'Extended response', 'Investigation'];
const BLOOMS: QuizItem['bloom'][] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate'];
const WITH_OPTIONS: QuizItem['type'][] = ['Multiple choice', 'Picture choice'];

const audienceBrief: Record<Audience, string> = {
  explorer:
    'Ages 6-9 (Explorer). Write exactly 3 questions, one idea each, in very simple words; a leading emoji is welcome. Use "Picture choice" (exactly 3 options) or "Voice answer". No marks.',
  standard:
    'Grade 5, ages 10-12. Write exactly 5 questions: mostly "Multiple choice" (exactly 4 options) plus at least one "Short answer" and one "Investigation". Use the word equation only, never chemical formulas. No marks.',
  scholar:
    'Ages 13+ (Scholar). Write exactly 4 exam-style questions using "Short answer", "Extended response" and "Investigation". Give each a "marks" value between 2 and 6. Symbol equations are allowed.',
};

const SYSTEM_PROMPT = `You write homework for a school teacher from a recording of their lesson.
Rules:
- Use ONLY content the teacher actually said in the transcript. Never add facts that were not taught.
- Every question cites the transcript segment id it comes from ("sourceSegment") and the syllabus objective id it assesses ("objective").
- Cover different objectives where the transcript allows.
Respond with one JSON object and nothing else, in this shape:
{"items":[{"type":"<${TYPES.join(' | ')}>","bloom":"<${BLOOMS.join(' | ')}>","question":"...","options":["..."],"answer":"...","sourceSegment":"s1","objective":"LO-3.1","marks":3}]}
"options" is only for Multiple choice and Picture choice, and must contain the answer word for word. "marks" is only for Scholar questions.`;

export async function loadLiveAiConfig(): Promise<LiveAiConfig> {
  try {
    const res = await fetch(CONFIG_URL, { cache: 'no-store' });
    if (!res.ok) return { enabled: false, model: '' };
    const data = await res.json();
    const model = String(data?.kimi?.model ?? '').trim();
    return { enabled: model.length > 0, model };
  } catch {
    // No proxy (e.g. a plain static host): the endpoint answers with HTML or not at all.
    return { enabled: false, model: '' };
  }
}

/** "unsloth/Kimi-K2.6-GGUF" -> "Kimi K2.6" */
export function displayModelName(model: string): string {
  const base = model.split('/').pop() ?? model;
  return base.replace(/-GGUF.*$/i, '').replace(/-/g, ' ').trim() || model;
}

export async function generateHomeworkLive(
  audience: Audience,
  model: string,
  transcript: TranscriptSegment[],
  objectives: { id: string; text: string }[],
): Promise<LiveHomeworkResult> {
  const user = [
    `Audience: ${audienceBrief[audience]}`,
    '',
    'Syllabus objectives:',
    ...objectives.map((o) => `${o.id}: ${o.text}`),
    '',
    'Lesson transcript:',
    ...transcript.map((s) => `[${s.id} ${s.t}] ${s.text}`),
  ].join('\n');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const start = performance.now();
  try {
    const res = await fetch(KIMI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: user },
        ],
        temperature: 0.3,
        // Headroom for the model's reasoning, which shares this budget.
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) throw new Error(`model endpoint returned ${res.status}`);
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? '';
    const items = normalizeItems(parseJsonObject(text), transcript, objectives);
    if (!items.length) throw new Error('the model returned no usable questions');
    return { items, model: data?.model || model, latencyMs: Math.round(performance.now() - start) };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw new Error(`no answer within ${TIMEOUT_MS / 1000}s`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Some local models wrap JSON in markdown fences despite JSON mode.
    const startIdx = trimmed.indexOf('{');
    const endIdx = trimmed.lastIndexOf('}');
    if (startIdx !== -1 && endIdx > startIdx) {
      try {
        return JSON.parse(trimmed.slice(startIdx, endIdx + 1));
      } catch {
        /* fall through */
      }
    }
    throw new Error('the model reply was not valid JSON');
  }
}

/** Keeps only well-formed questions and snaps their references to real segments and objectives. */
function normalizeItems(raw: unknown, transcript: TranscriptSegment[], objectives: { id: string }[]): QuizItem[] {
  const list: unknown[] = Array.isArray((raw as { items?: unknown })?.items) ? (raw as { items: unknown[] }).items : [];
  const segmentIds = new Set(transcript.map((s) => s.id));
  const objectiveIds = new Set(objectives.map((o) => o.id));

  return list.flatMap((entry, i): QuizItem[] => {
    const it = (entry ?? {}) as Record<string, unknown>;
    const question = String(it.question ?? '').trim();
    const answer = String(it.answer ?? '').trim();
    if (!question || !answer) return [];

    let type = TYPES.includes(it.type as QuizItem['type']) ? (it.type as QuizItem['type']) : 'Short answer';
    let options = Array.isArray(it.options) ? it.options.map((o) => String(o).trim()).filter(Boolean) : undefined;
    if (WITH_OPTIONS.includes(type)) {
      if (!options || options.length < 2 || !options.includes(answer)) {
        type = 'Short answer';
        options = undefined;
      }
    } else {
      options = undefined;
    }

    const sourceSegment = segmentIds.has(String(it.sourceSegment)) ? String(it.sourceSegment) : transcript[0].id;
    const segment = transcript.find((s) => s.id === sourceSegment);
    const objective = objectiveIds.has(String(it.objective)) ? String(it.objective) : segment?.matches[0]?.lo ?? objectives[0].id;
    const marks = Number(it.marks);

    return [
      {
        id: `live-${i + 1}`,
        type,
        bloom: BLOOMS.includes(it.bloom as QuizItem['bloom']) ? (it.bloom as QuizItem['bloom']) : 'Understand',
        question,
        options,
        answer,
        sourceSegment,
        objective,
        marks: Number.isFinite(marks) && marks > 0 ? Math.round(marks) : undefined,
      },
    ];
  });
}
