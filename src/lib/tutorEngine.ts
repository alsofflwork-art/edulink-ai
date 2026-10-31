import { conceptNudges, explorerQuestions, guardrailOpeners, tutorPersona, wrongAnswerOpeners } from '@/data/mockData';
import { pick } from '@/lib/utils';

export interface TutorState {
  questionIndex: number;
  hintLevel: number;
}

export type ReplyKind = 'hint' | 'praise' | 'guardrail' | 'nudge' | 'complete';

export interface TutorReply {
  text: string;
  kind: ReplyKind;
  stars: number;
  next: TutorState;
}

const ANSWER_SEEKING = /(just tell|tell me the answer|give me the answer|what('?s| is) the answer|answer please|i give up|give up|idk|i don'?t know|dont know|skip)/i;
const QUESTION_FORM = /^(what|why|how|where|when|who|explain|tell me about)\b/i;
const GREETING = /^(hi|hello|hey|yo|good (morning|afternoon))\b/i;

export const initialTutorState: TutorState = { questionIndex: 0, hintLevel: 0 };

function nextHint(state: TutorState) {
  const q = explorerQuestions[state.questionIndex];
  const hint = q.hints[Math.min(state.hintLevel, q.hints.length - 1)];
  return { hint, next: { ...state, hintLevel: Math.min(state.hintLevel + 1, q.hints.length - 1) } };
}

/**
 * Socratic tutor: never states the answer. It escalates hints, redirects
 * answer-seeking, and awards more stars the fewer hints were needed.
 */
export function respond(input: string, state: TutorState): TutorReply {
  const text = input.trim().toLowerCase();
  const q = explorerQuestions[state.questionIndex];
  if (!q) return { text: tutorPersona.completion, kind: 'complete', stars: 0, next: state };

  if (ANSWER_SEEKING.test(text)) {
    const { hint, next } = nextHint(state);
    return { text: `${pick(guardrailOpeners)} ${hint}`, kind: 'guardrail', stars: 0, next };
  }

  if (GREETING.test(text) && text.split(/\s+/).length <= 3) {
    return { text: `Hi there! 👋 Let's keep going. ${q.prompt}`, kind: 'nudge', stars: 0, next: state };
  }

  if (QUESTION_FORM.test(text)) {
    const nudge = conceptNudges.find((n) => n.match.test(text));
    if (nudge) return { text: nudge.reply, kind: 'nudge', stars: 0, next: state };
  }

  if (q.accept.some((a) => text.includes(a))) {
    const stars = state.hintLevel === 0 ? 3 : state.hintLevel === 1 ? 2 : 1;
    const nextIndex = state.questionIndex + 1;
    const nextQ = explorerQuestions[nextIndex];
    if (!nextQ) {
      return { text: `${q.praise} ${tutorPersona.completion}`, kind: 'complete', stars, next: { questionIndex: nextIndex, hintLevel: 0 } };
    }
    return {
      text: `${q.praise} You earned ${'⭐'.repeat(stars)}! Ready for the next one? ${nextQ.prompt}`,
      kind: 'praise',
      stars,
      next: { questionIndex: nextIndex, hintLevel: 0 },
    };
  }

  const { hint, next } = nextHint(state);
  const wantsHint = /(hint|help|clue|stuck)/i.test(text);
  return { text: wantsHint ? hint : `${pick(wrongAnswerOpeners)} ${hint}`, kind: 'hint', stars: 0, next };
}
