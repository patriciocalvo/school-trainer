# CURRENT_STATE.md

> Snapshot of what is built and working as of the last update.

**Last updated:** 2026-05-13

---

## What exists

### Infrastructure
- [x] Vite + React (JavaScript) project scaffolded
- [x] Tailwind CSS configured (mobile-first, Nunito font)
- [x] React Router v7 with routes: `/login`, `/`, `/subject/:subject/:topic`, `/quiz/:quizId`, `/history`, plus 5 teacher routes
- [x] Supabase client in `src/lib/supabase.js`
- [x] `.env.example` with required variables

### Auth & Roles
- [x] `useAuth` hook + `AuthProvider` (email/password via Supabase)
- [x] `LoginPage` with register toggle
- [x] `ProtectedRoute` / `PublicOnlyRoute` / `TeacherRoute` wrappers
- [x] `role` field on `profiles` (`student` | `teacher`). Default: `student`.

### Quiz Engine
- [x] `quiz-service.js` — all DB access: `fetchSubjectsAndTopics`, `fetchQuizzesByTopic`, `fetchQuizById`, `fetchAllQuizzes`, `createQuiz`, `updateQuiz`, `deleteQuiz`
- [x] Quizzes stored in `public.quizzes` table (Supabase). No static files at runtime.

### Student UI
- [x] `Button`, `Card`, `ProgressBar` components
- [x] `OptionButton`, `QuizCard`, `ScoreSummary` components
- [x] `HomePage` — subject grid (loaded from DB, `SUBJECT_META` for display config)
- [x] `TopicPage` — quiz list + best score badge per quiz
- [x] `QuizPage` — full quiz flow with gamification (streak counter, 🔥 milestones, toast feedback)
- [x] `HistoryPage` — past attempts sorted by date, titles resolved from DB

### Teacher UI
- [x] `TeacherDashboardPage` — entry point with navigation cards
- [x] `TeacherQuizListPage` — list all quizzes, toggle published/draft, edit, delete
- [x] `TeacherQuizFormPage` — create and edit quizzes (metadata + questions form)
- [x] `TeacherProgressPage` — attempts table with ECharts line chart (score % over time per quiz)

### Database
- [x] `001_initial.sql` — `profiles` + `quiz_attempts` tables, RLS, trigger
- [x] `002_quizzes_and_roles.sql` — `quizzes` table, teacher role, RLS policies, seed (3 quizzes)
- [x] Score saved on quiz completion
- [x] Best score fetched per quiz on `TopicPage`
- [x] Full history on `HistoryPage`

### Content (seed data)
- [x] `vb-basico-01` — Lengua / Ortografía: V vs B (10 preguntas)
- [x] `h-basico-01` — Lengua / Ortografía: La H muda (10 preguntas)
- [x] `matematica-tablas-01` — Matemática / Tablas del 2 al 5 (10 preguntas)
- Note: `.md` files in `src/quizzes/` are kept for reference/history only. Runtime uses DB.

### Documentation
- [x] `docs/HOW_TO_CREATE_MODULE.md` — guide for creating quizzes (now DB-insert focused)
- [x] `docs/quiz-config.md` — Argentina/9yr content config + Supabase MCP insert guide
- [x] `.vscode/mcp.json` — Supabase MCP config for LLM quiz generation

---

## What is NOT done yet

- [ ] No subject-level route (`/subject/:subject`) for subjects with multiple topics
- [ ] No image/audio support in quiz questions
- [ ] No offline mode
- [ ] No deploy/CI configured
