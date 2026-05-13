# CURRENT_STATE.md

> Snapshot of what is built and working as of the last update.

**Last updated:** 2026-05-12

---

## What exists

### Infrastructure
- [x] Vite + React (JavaScript) project scaffolded
- [x] Tailwind CSS configured (mobile-first, Nunito font)
- [x] React Router v7 with routes: `/login`, `/`, `/subject/:subject/:topic`, `/quiz/:quizId`, `/history`
- [x] Supabase client in `src/lib/supabase.js`
- [x] `.env.example` with required variables

### Auth
- [x] `useAuth` hook + `AuthProvider` (email/password via Supabase)
- [x] `LoginPage` with register toggle
- [x] `ProtectedRoute` / `PublicOnlyRoute` wrappers

### Quiz Engine
- [x] `quiz-parser.js` — parses .md frontmatter + 10-question body
- [x] `quiz-loader.js` — `import.meta.glob` loader, `quizMap`, `quizIndex`

### UI
- [x] `Button`, `Card`, `ProgressBar` components
- [x] `OptionButton`, `QuizCard`, `ScoreSummary` components
- [x] `HomePage` — subject grid
- [x] `TopicPage` — quiz list + best score badge
- [x] `QuizPage` — full quiz flow (one question at a time, saves on complete)
- [x] `HistoryPage` — past attempts sorted by date

### Score System
- [x] `supabase/migrations/001_initial.sql` — `profiles` + `quiz_attempts` tables + RLS + trigger
- [x] Score saved on quiz completion
- [x] Best score fetched per quiz on `TopicPage`
- [x] Full history on `HistoryPage`

### Content
- [x] Sample quiz: `src/quizzes/lengua/ortografia/vb-basico-01.md` (10 questions, uso de V vs B)

### Documentation
- [x] `docs/HOW_TO_CREATE_MODULE.md` — LLM instructions for generating new quizzes

---

## What is NOT done yet

- [ ] `npm install` — dependencies not yet installed
- [ ] `.env` file — Supabase credentials not set
- [ ] Supabase migration not yet run
- [ ] No deploy/CI configured
- [ ] No subject-level route (`/subject/:subject`) for subjects with multiple topics
- [ ] No image/audio support in quiz questions
- [ ] No offline mode
