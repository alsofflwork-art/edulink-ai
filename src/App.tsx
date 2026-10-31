import { AppHeader } from '@/components/AppHeader';
import { Toaster } from '@/components/Toaster';
import { useAppStore } from '@/store/useAppStore';
import { TeacherHub } from '@/views/teacher/TeacherHub';
import { StudentPortal } from '@/views/student/StudentPortal';
import { KnowledgeMatrix } from '@/views/matrix/KnowledgeMatrix';

export default function App() {
  const view = useAppStore((s) => s.view);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div key={view} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          {view === 'teacher' && <TeacherHub />}
          {view === 'student' && <StudentPortal />}
          {view === 'matrix' && <KnowledgeMatrix />}
        </div>
      </main>
      <footer className="mx-auto max-w-[1440px] px-4 pb-8 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
        EduLink AI · Interactive proof of concept · All data shown is simulated for demonstration
      </footer>
      <Toaster />
    </div>
  );
}
