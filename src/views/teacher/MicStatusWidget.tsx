import { useEffect, useState } from 'react';
import { BatteryCharging, Mic, RefreshCw, Signal, Speaker, Waves } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { micDevice } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { MicStatus } from '@/types';

const statusMeta = {
  connected: {
    label: 'Connected',
    desc: 'Streaming lesson audio to EduLink Cloud',
    badge: 'success' as const,
    icon: Mic,
    ping: 'bg-emerald-400',
    wrap: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    stroke: '#10b981',
  },
  charging: {
    label: 'Charging',
    desc: 'Docked in the classroom charging cradle',
    badge: 'warning' as const,
    icon: BatteryCharging,
    ping: 'bg-amber-400',
    wrap: 'bg-amber-50 text-amber-600 ring-amber-100',
    stroke: '#f59e0b',
  },
  syncing: {
    label: 'Syncing',
    desc: 'Uploading buffered audio for AI processing',
    badge: 'info' as const,
    icon: RefreshCw,
    ping: 'bg-sky-400',
    wrap: 'bg-sky-50 text-sky-600 ring-sky-100',
    stroke: '#0ea5e9',
  },
};

const BAR_COUNT = 28;

export function MicStatusWidget() {
  const status = useAppStore((s) => s.micStatus);
  const setStatus = useAppStore((s) => s.setMicStatus);
  const pushToast = useAppStore((s) => s.pushToast);
  const [battery, setBattery] = useState(micDevice.battery);
  const [sync, setSync] = useState(0);

  useEffect(() => {
    if (status === 'charging') {
      const id = setInterval(() => setBattery((b) => Math.min(100, b + 1)), 600);
      return () => clearInterval(id);
    }
    if (status === 'connected') {
      const id = setInterval(() => setBattery((b) => Math.max(5, b - 1)), 9000);
      return () => clearInterval(id);
    }
    setSync(0);
    const id = setInterval(() => setSync((p) => Math.min(100, p + 3)), 180);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== 'syncing' || sync < 100) return;
    const t = setTimeout(() => {
      setStatus('connected');
      pushToast({ title: 'Sync complete', description: '412 MB of lesson audio uploaded · AI processing queued', tone: 'success' });
    }, 500);
    return () => clearTimeout(t);
  }, [status, sync, setStatus, pushToast]);

  const meta = statusMeta[status];
  const Icon = meta.icon;
  const circumference = 2 * Math.PI * 26;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Smart Mic / Lapel Speaker</CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            {micDevice.model} · {micDevice.serial}
          </p>
        </div>
        <Badge variant={meta.badge}>
          <span className={cn('h-1.5 w-1.5 rounded-full', meta.ping)} />
          {meta.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className={cn('absolute inset-0 rounded-full opacity-60 animate-ping-slow', meta.ping)} />
            <div className={cn('relative flex h-16 w-16 items-center justify-center rounded-full ring-8', meta.wrap)}>
              <Icon className={cn('h-7 w-7', status === 'syncing' && 'animate-spin [animation-duration:2s]')} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">{meta.label}</p>
            <p className="text-sm text-slate-500">{meta.desc}</p>
          </div>
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="6" />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke={battery < 20 ? '#f43f5e' : meta.stroke}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - battery / 100)}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold tabular-nums">{battery}%</span>
              <span className="text-[9px] uppercase tracking-wide text-slate-400">battery</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          {status === 'syncing' ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-600">Uploading 3 recordings ({micDevice.bufferedMb} MB)</span>
                <span className="font-mono text-sky-600">{sync}%</span>
              </div>
              <Progress value={sync} indicatorClassName="bg-sky-500" />
              <p className="text-[11px] text-slate-400">End-to-end encrypted · PII redaction on-device</p>
            </div>
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Waves className="h-3.5 w-3.5" /> {status === 'connected' ? 'Live input level' : 'Mic idle while charging'}
                </span>
                {status === 'connected' && <span className="font-mono text-emerald-600">-18 dB</span>}
              </div>
              <div className="flex h-10 items-center gap-[3px]">
                {Array.from({ length: BAR_COUNT }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'w-full origin-center rounded-full transition-colors',
                      status === 'connected' ? 'animate-wave bg-gradient-to-t from-emerald-500 to-teal-300' : 'bg-slate-300',
                    )}
                    style={{
                      height: `${30 + ((i * 37) % 70)}%`,
                      animationDelay: `${(i % 7) * 0.12}s`,
                      transform: status === 'connected' ? undefined : 'scaleY(0.2)',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-slate-100 p-2.5">
            <dt className="flex items-center gap-1 text-slate-400">
              <Signal className="h-3 w-3" /> Signal
            </dt>
            <dd className="mt-1 flex items-end gap-0.5">
              {[1, 2, 3, 4].map((b) => (
                <span key={b} className={cn('w-1.5 rounded-sm', b <= Math.ceil(micDevice.signal / 25) ? 'bg-emerald-500' : 'bg-slate-200')} style={{ height: 4 + b * 3 }} />
              ))}
              <span className="ml-1.5 font-semibold text-slate-700">{micDevice.signal}%</span>
            </dd>
          </div>
          <div className="rounded-lg border border-slate-100 p-2.5">
            <dt className="flex items-center gap-1 text-slate-400">
              <Speaker className="h-3 w-3" /> Paired to
            </dt>
            <dd className="mt-1 truncate font-semibold text-slate-700">{micDevice.pairedTo}</dd>
          </div>
          <div className="rounded-lg border border-slate-100 p-2.5">
            <dt className="text-slate-400">Noise cancel</dt>
            <dd className="mt-1 font-semibold text-slate-700">{micDevice.noiseCancel}</dd>
          </div>
          <div className="rounded-lg border border-slate-100 p-2.5">
            <dt className="text-slate-400">Firmware</dt>
            <dd className="mt-1 font-semibold text-slate-700">{micDevice.firmware}</dd>
          </div>
        </dl>

        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">Simulate device state</p>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
            {(Object.keys(statusMeta) as MicStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'rounded-md py-1.5 text-xs font-medium capitalize transition',
                  status === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
