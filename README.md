# EduLink AI — Interactive POC

AI-driven educational ecosystem that links a teacher's classroom mic, the school syllabus, and an age-adaptive student portal.

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS 3 · Radix UI (shadcn-style primitives) · Lucide · Zustand

## Quick start (Docker — recommended)

Requires only [Docker Desktop](https://www.docker.com/products/docker-desktop/). No Node.js needed.

```bash
git clone <repo-url> edulink-ai
cd edulink-ai
docker compose up -d --build
```

Open **http://localhost:3000**. Stop with `docker compose down`.

If port 3000 is taken, pick another one:

```bash
EDULINK_PORT=4000 docker compose up -d --build          # macOS / Linux
$env:EDULINK_PORT=4000; docker compose up -d --build    # Windows PowerShell
```

Without Compose:

```bash
docker build -t edulink-ai .
docker run -d -p 3000:80 --name edulink-ai edulink-ai
```

## Local development (Node.js 20+)

```bash
npm install
npm run dev        # http://localhost:5173 (hot reload)
npm run build      # type-check + production build
```

> Fonts load from Google Fonts, so the demo machine needs internet access for the intended typography (it falls back to system fonts offline).

## Structure

```
src/
├─ App.tsx                     # shell + view switcher
├─ types.ts                    # shared domain types
├─ data/mockData.ts            # ALL mock data (class, syllabus page, transcript, quizzes, tutor scripts)
├─ store/useAppStore.ts        # Zustand: view, age mode, mic state, publish state, stars, toasts
├─ lib/
│  ├─ tutorEngine.ts           # Socratic tutor: hint ladder, answer-seeking guardrail, star scoring
│  ├─ essayEngine.ts           # rubric scorer + Socratic improvement prompts
│  ├─ highlight.tsx            # concept highlighting
│  └─ utils.ts
├─ components/
│  ├─ ui/                      # button, card, badge, tabs, progress, skeleton, dialog
│  ├─ AppHeader.tsx, Toaster.tsx
│  └─ SyllabusDocument.tsx     # mock 1-page syllabus "PDF"
└─ views/
   ├─ teacher/                 # TeacherHub, MicStatusWidget, ActiveClasses, LessonTimeline, LessonDetail, HomeworkPanel
   ├─ student/
   │  ├─ StudentPortal.tsx     # Explorer ⇄ Scholar toggle
   │  ├─ explorer/             # ExplorerMode, MissedClassReplay, SocraticTutor
   │  └─ scholar/              # ScholarMode, LectureNotes, EssayFeedback
   └─ matrix/KnowledgeMatrix.tsx
```

## Suggested demo script (≈3 min)

1. **Teacher's Hub** — toggle the mic between *Charging* and *Syncing* (sync completes and shows a toast). Click the 08:15 lesson, then go through *AI Summary → Syllabus Match → Transcript*, and open **Syllabus page** to show the matched objectives highlighted. Click the 10:45 lesson to watch it finish processing live, and the 12:30 lesson to show live captions.
2. **Homework panel** — switch between *Explorer 6–9 / Grade 5 / Scholar 13+*, click **Regenerate**, then **Approve & publish**.
3. **Student Portal → Explorer** — the "New homework" banner appears. Play the replay, press **Read to me** (browser speech), and tap **I got it!** for stars. In the Sprout tutor, tap *"Just tell me the answer!"* (the tutor gives a hint instead), then answer `stomata`. The mic button simulates voice input.
4. **Scholar** — flip flashcards, then edit the essay and click **Analyse draft**. The rubric score and guiding questions update.
5. **Knowledge Matrix** — the pipeline auto-runs. Click a transcript segment to trace it to its syllabus objective and generated questions, switch age bands, and click **Replay pipeline**.
