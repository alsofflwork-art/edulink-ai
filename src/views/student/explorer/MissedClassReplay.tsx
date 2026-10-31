import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Volume2 } from 'lucide-react';
import { explorerReplay, whiteboardCards } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

function speak(text: string) {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  u.pitch = 1.25;
  window.speechSynthesis.speak(u);
  return true;
}

export function MissedClassReplay() {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const addStars = useAppStore((s) => s.addStars);
  const pushToast = useAppStore((s) => s.pushToast);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= explorerReplay.durationSec) {
          setPlaying(false);
          return explorerReplay.durationSec;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing]);

  const caption = [...explorerReplay.captions].reverse().find((c) => elapsed >= c.at) ?? explorerReplay.captions[0];

  useEffect(() => {
    if (playing) setIdx(caption.card);
  }, [caption.card, playing]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const card = whiteboardCards[idx];

  const readAloud = () => {
    if (speak(card.narration)) {
      setSpeaking(true);
      setTimeout(() => setSpeaking(false), Math.max(2500, card.narration.length * 65));
    } else {
      pushToast({ title: 'Voice not available', description: 'This browser does not support speech playback.', tone: 'warning' });
    }
  };

  const gotIt = () => {
    if (!done.has(idx)) {
      setDone(new Set(done).add(idx));
      addStars(1);
    }
    if (idx < whiteboardCards.length - 1) setTimeout(() => setIdx(idx + 1), 350);
    else if (done.size + 1 >= whiteboardCards.length) pushToast({ title: 'Replay complete! 🎉', description: 'Layla watched every card from the missed class.', tone: 'success' });
  };

  const togglePlay = () => {
    if (elapsed >= explorerReplay.durationSec) setElapsed(0);
    setPlaying((p) => !p);
  };

  const mm = (s: number) => `0:${String(s).padStart(2, '0')}`;

  return (
    <div className="rounded-[1.75rem] border-4 border-white bg-white/70 p-4 shadow-xl shadow-emerald-100 backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-2xl font-bold text-slate-800">🎬 Missed Class Replay</h3>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-base font-medium text-emerald-700">
          {done.size}/{whiteboardCards.length} cards ⭐
        </span>
      </div>
      <p className="mt-1 text-base text-slate-500">Ms. Rivera’s photosynthesis lesson, made simple by Sprout 🌱</p>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-800 p-3 text-white">
        <button
          onClick={togglePlay}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-lg transition hover:scale-105 active:scale-95"
          aria-label={playing ? 'Pause replay' : 'Play replay'}
        >
          {playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ml-0.5 h-6 w-6 fill-current" />}
        </button>
        <div className="min-w-0 flex-1">
          <p key={caption.text} className="truncate text-lg animate-in fade-in-0">
            {caption.text}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-600">
              <div className="h-full rounded-full bg-amber-400 transition-all duration-1000 ease-linear" style={{ width: `${(elapsed / explorerReplay.durationSec) * 100}%` }} />
            </div>
            <span className="font-mono text-xs text-slate-300">
              {mm(elapsed)} / {mm(explorerReplay.durationSec)}
            </span>
          </div>
        </div>
      </div>

      <div
        key={idx}
        className={cn('relative mt-5 min-h-[280px] rounded-3xl border-4 bg-gradient-to-br p-6 text-center shadow-inner animate-in fade-in-0 zoom-in-95 sm:p-8', card.bg, card.border)}
      >
        <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-500">
          Card {idx + 1} of {whiteboardCards.length}
        </div>
        {done.has(idx) && <div className="absolute right-4 top-3 text-3xl animate-pop">⭐</div>}
        <div className="mt-6 text-7xl animate-float sm:text-8xl">{card.emoji}</div>
        <h4 className="mt-4 text-3xl font-bold text-slate-800">{card.title}</h4>
        <p className="mx-auto mt-3 max-w-lg text-xl leading-relaxed text-slate-700">{card.text}</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setIdx(Math.max(0, idx - 1))}
          disabled={idx === 0}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-40"
          aria-label="Previous card"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>

        <div className="flex flex-1 flex-wrap items-center justify-center gap-3">
          <button
            onClick={readAloud}
            className={cn(
              'flex items-center gap-2 rounded-2xl px-5 py-3 text-lg font-semibold shadow-md transition hover:scale-105 active:scale-95',
              speaking ? 'bg-sky-500 text-white' : 'bg-white text-sky-600',
            )}
          >
            <Volume2 className={cn('h-6 w-6', speaking && 'animate-pulse')} /> {speaking ? 'Reading…' : 'Read to me'}
          </button>
          <button
            onClick={gotIt}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 px-6 py-3 text-lg font-bold text-white shadow-lg shadow-emerald-200 transition hover:scale-105 active:scale-95"
          >
            {done.has(idx) ? 'Got it! ✅' : 'I got it! ⭐'}
          </button>
        </div>

        <button
          onClick={() => setIdx(Math.min(whiteboardCards.length - 1, idx + 1))}
          disabled={idx === whiteboardCards.length - 1}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-40"
          aria-label="Next card"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {whiteboardCards.map((c, i) => (
          <button
            key={c.title}
            onClick={() => setIdx(i)}
            aria-label={`Go to card ${i + 1}`}
            className={cn('h-3 rounded-full transition-all', i === idx ? 'w-8 bg-emerald-500' : done.has(i) ? 'w-3 bg-amber-400' : 'w-3 bg-slate-300')}
          />
        ))}
      </div>
    </div>
  );
}
