# ARCHITECTURE.md — System Architecture

> Describes **what exists** in the system, how modules relate, and **why** key technical decisions were made.

---

## System Overview

**Project:** School Trainer
**Type:** Web app (mobile/tablet-first)
**Primary stack:** React (Vite, plain JavaScript) + Tailwind CSS + Supabase (Auth + PostgreSQL)
**Last updated:** 2026-05-13

---

## High-Level Architecture

```
[Browser — React SPA]
        │
        └── Supabase JS SDK
                ├── Auth (email/password)
                └── PostgreSQL (quizzes, quiz_attempts, profiles)
```

All quiz content is stored in the **`quizzes` table** in Supabase. The build artifact contains no quiz data — content is fetched at runtime.

---

## Module Inventory

### `src/lib/supabase.js`
**Purpose:** Initializes and exports the Supabase client singleton.
**Depends on:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` env vars.

### `src/lib/quiz-service.js`
**Purpose:** All runtime quiz data access via Supabase.
**Exposes:** `fetchSubjectsAndTopics()`, `fetchQuizzesByTopic(subject, topic)`, `fetchQuizById(id)`, `fetchAllQuizzes()`, `createQuiz(quiz)`, `updateQuiz(id, updates)`, `deleteQuiz(id)`.

### `src/hooks/useAuth.jsx`
**Purpose:** Provides auth state and actions via React Context.
**Exposes:** `{ user, role, signIn, signUp, signOut }` via `useAuth()` hook + `AuthProvider`. `role` is `'student'` | `'teacher'` | `null`.

### `src/pages/LoginPage.jsx`
Login and register form (email + password).

### `src/pages/HomePage.jsx`
Subject selection grid. Subjects are auto-discovered from quiz files.

### `src/pages/TopicPage.jsx`
Lists quizzes within a subject/topic. Fetches best score per quiz from Supabase.

### `src/pages/QuizPage.jsx`
Active quiz flow — one question at a time, saves attempt to Supabase on completion.

### `src/pages/HistoryPage.jsx`
Full attempt history for the current user, sorted newest first. Quiz titles resolved from DB.

### `src/pages/teacher/`
Teacher-only pages behind `TeacherRoute`: `TeacherDashboardPage`, `TeacherQuizListPage`, `TeacherQuizFormPage`, `TeacherProgressPage`.

---

## Data Flow

### Quiz loading (runtime)
```
HomePage mounts
  → fetchSubjectsAndTopics() → SELECT subject, topic FROM quizzes WHERE is_published
  → renders subject grid

TopicPage mounts
  → fetchQuizzesByTopic(subject, topic)
  → renders quiz cards

QuizPage mounts
  → fetchQuizById(id)
  → renders questions
```

### Quiz attempt (runtime)
```
User answers last question
  → score calculated client-side
  → supabase.from('quiz_attempts').insert(...)
  → ScoreSummary shown
```

### Auth flow
```
User submits LoginPage form
  → supabase.auth.signInWithPassword / signUp
  → onAuthStateChange → user state updated
  → profiles.role fetched → role state set
  → ProtectedRoute / TeacherRoute allows navigation
```

---

## Database Schema

See `supabase/migrations/`.

**`profiles`** — one row per user (trigger on `auth.users`). Fields: `user_id`, `display_name`, `email`, `role` (`student`|`teacher`).
**`quiz_attempts`** — one row per completed quiz attempt. RLS: users see only their own; teachers see all.
**`quizzes`** — quiz content. Fields: `id`, `title`, `subject`, `topic`, `subtopic`, `difficulty`, `questions` (jsonb), `is_published`, `created_by`. RLS: students see only published; teachers full CRUD on own quizzes.

---

## External Dependencies

| Dependency | Purpose |
|---|---|
| `@supabase/supabase-js` v2 | Auth + DB client |
| `echarts` + `echarts-for-react` | Progress charts in teacher view |
| `react-router-dom` v7 | Client-side routing |
| `tailwindcss` v3 | Utility CSS, mobile-first |
| `@vitejs/plugin-react` | React JSX transform |
