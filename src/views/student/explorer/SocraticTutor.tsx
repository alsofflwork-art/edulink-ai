import { useEffect, useRef, useState } from 'react';
import { Mic, RotateCcw, Send, Volume2, VolumeX } from 'lucide-react';
import { explorerQuestions, tutorPersona } from '@/data/mockData';
import { initialTutorState, respond, type ReplyKind, type TutorState } from '@/lib/tutorEngine';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  role: 'bot' | 'kid';
  text: string;
  kind?: ReplyKind;
}

const quickChips = ['💡 Give me a hint', '🙋 Just tell me the answer!', '🤔 Why do leaves need doors?'];

let msgId = 0;
const initialMessages = (): Message[] => [
  { id: ++msgId, role: 'bot', text: tutorPersona.greeting },
  { id: ++msgId, role: 'bot', text: `Question 1: ${explorerQuestions[0].prompt}`, kind: 'hint' },
];

export function SocraticTutor() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [state, setState] = useState<TutorState>(initialTutorState);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceTurn, setVoiceTurn] = useState(0);
  const [burst, setBurst] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const addStars = useAppStore((s) => s.addStars);

  const finished = state.questionIndex >= explorerQuestions.length;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing || finished) return;
    setMessages((m) => [...m, { id: ++msgId, role: 'kid', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = respond(text.replace(/^[^\w]+/, ''), state);
      setState(reply.next);
      setMessages((m) => [...m, { id: ++msgId, role: 'bot', text: reply.text, kind: reply.kind }]);
      setTyping(false);
      if (reply.stars) {
        addStars(reply.stars);
        setBurst((b) => b + 1);
      }
      if (voiceOn && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(reply.text.replace(/\p{Extended_Pictographic}/gu, ''));
        u.pitch = 1.3;
        window.speechSynthesis.speak(u);
      }
    }, 850 + Math.random() * 500);
  };

  // Voice-first demo: simulates speech capture with a scripted phrase for the current question.
  const startVoice = () => {
    if (listening || typing || finished) return;
    setListening(true);
    const samples = explorerQuestions[state.questionIndex].voiceSamples;
    const phrase = samples[voiceTurn % samples.length];
    setTimeout(() => setInput(phrase), 900);
    setTimeout(() => {
      setListening(false);
      setVoiceTurn((v) => v + 1);
      send(phrase);
    }, 1700);
  };

  const reset = () => {
    setMessages(initialMessages());
    setState(initialTutorState);
    setVoiceTurn(0);
  };

  return (
    <div className="flex h-full min-h-[640px] flex-col rounded-[1.75rem] border-4 border-white bg-white/80 shadow-xl shadow-sky-100 backdrop-blur">
      <div className="flex items-center gap-3 border-b-2 border-dashed border-emerald-100 p-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 to-lime-300 text-3xl shadow-md">
          {tutorPersona.emoji}
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-800">{tutorPersona.name}</h3>
          <p className="text-sm text-slate-500">Homework buddy · gives hints, not answers</p>
        </div>
        <button
          onClick={() => setVoiceOn((v) => !v)}
          className={cn('rounded-xl p-2.5 transition', voiceOn ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400')}
          aria-label={voiceOn ? 'Mute Sprout' : 'Let Sprout talk'}
          title={voiceOn ? 'Sprout talks out loud' : 'Sprout is muted'}
        >
          {voiceOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex items-center justify-center gap-3 bg-emerald-50/70 px-4 py-2.5">
        {explorerQuestions.map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-base font-bold transition-all',
                i < state.questionIndex ? 'bg-amber-400 text-white' : i === state.questionIndex ? 'bg-emerald-500 text-white ring-4 ring-emerald-200' : 'bg-white text-slate-400',
              )}
            >
              {i < state.questionIndex ? '★' : i + 1}
            </span>
            {i < explorerQuestions.length - 1 && <span className={cn('h-1 w-6 rounded-full', i < state.questionIndex ? 'bg-amber-300' : 'bg-slate-200')} />}
          </div>
        ))}
      </div>

      <div ref={scrollRef} className="scrollbar-thin relative flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: 420 }}>
        {messages.map((m) => (
          <div key={m.id} className={cn('flex animate-in fade-in-0 slide-in-from-bottom-2', m.role === 'kid' ? 'justify-end' : 'justify-start')}>
            {m.role === 'bot' && <span className="mr-2 mt-1 text-2xl">{tutorPersona.emoji}</span>}
            <div
              className={cn(
                'max-w-[85%] rounded-3xl px-4 py-3 text-lg leading-snug',
                m.role === 'kid'
                  ? 'rounded-br-md bg-gradient-to-br from-sky-500 to-indigo-500 text-white'
                  : m.kind === 'praise' || m.kind === 'complete'
                    ? 'rounded-bl-md border-2 border-amber-200 bg-amber-50 text-slate-800'
                    : m.kind === 'guardrail'
                      ? 'rounded-bl-md border-2 border-violet-200 bg-violet-50 text-slate-800'
                      : 'rounded-bl-md bg-slate-100 text-slate-800',
              )}
            >
              {m.kind === 'guardrail' && (
                <span className="mb-1 inline-block rounded-full bg-violet-200 px-2 py-0.5 text-xs font-semibold text-violet-800">🛡️ Hint, not answer</span>
              )}
              <p>{m.text}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{tutorPersona.emoji}</span>
            <div className="flex gap-1.5 rounded-3xl rounded-bl-md bg-slate-100 px-4 py-4">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        {burst > 0 && (
          <div key={burst} className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center text-6xl animate-out fade-out-0 zoom-out-150 duration-1000 fill-mode-forwards">
            ⭐🎉⭐
          </div>
        )}
      </div>

      <div className="border-t-2 border-dashed border-emerald-100 p-4">
        {finished ? (
          <button
            onClick={reset}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 py-3 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02]"
          >
            <RotateCcw className="h-5 w-5" /> Play again
          </button>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {quickChips.map((c) => (
                <button
                  key={c}
                  onClick={() => send(c)}
                  disabled={typing}
                  className="rounded-full border-2 border-emerald-200 bg-white px-3 py-1.5 text-base text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-50 disabled:opacity-50"
                >
                  {c}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={startVoice}
                className={cn(
                  'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 active:scale-95',
                  listening ? 'bg-rose-500' : 'bg-gradient-to-br from-orange-400 to-rose-400',
                )}
                aria-label="Talk to Sprout"
              >
                {listening && <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping-slow" />}
                <Mic className="relative h-7 w-7" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? 'Listening… 👂' : 'Type or tap the mic to talk!'}
                className="h-14 min-w-0 flex-1 rounded-full border-2 border-slate-200 bg-white px-5 text-lg outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-6 w-6" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
