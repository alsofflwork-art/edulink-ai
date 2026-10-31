import { create } from 'zustand';
import type { AgeMode, Lesson, LessonStatus, MicStatus, View } from '@/types';

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone?: 'success' | 'info' | 'warning';
}

interface AppState {
  view: View;
  setView: (view: View) => void;
  ageMode: AgeMode;
  setAgeMode: (mode: AgeMode) => void;
  micStatus: MicStatus;
  setMicStatus: (status: MicStatus) => void;
  lessonStatus: Record<string, LessonStatus>;
  setLessonStatus: (id: string, status: LessonStatus) => void;
  homeworkPublished: boolean;
  publishedAt: string | null;
  publishHomework: () => void;
  stars: number;
  addStars: (n: number) => void;
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
}

let toastId = 0;

export const useAppStore = create<AppState>((set) => ({
  view: 'teacher',
  setView: (view) => set({ view }),
  ageMode: 'explorer',
  setAgeMode: (ageMode) => set({ ageMode }),
  micStatus: 'connected',
  setMicStatus: (micStatus) => set({ micStatus }),
  lessonStatus: {},
  setLessonStatus: (id, status) => set((s) => ({ lessonStatus: { ...s.lessonStatus, [id]: status } })),
  homeworkPublished: false,
  publishedAt: null,
  publishHomework: () =>
    set({
      homeworkPublished: true,
      publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }),
  stars: 12,
  addStars: (n) => set((s) => ({ stars: s.stars + n })),
  toasts: [],
  pushToast: (toast) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3800);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Live status for a lesson, honouring any runtime transitions (e.g. processing → processed). */
export function useLessonStatus(lesson: Lesson): LessonStatus {
  return useAppStore((s) => s.lessonStatus[lesson.id] ?? lesson.status);
}
