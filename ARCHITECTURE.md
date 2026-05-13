# ARCHITECTURE.md — System Architecture

> Describes **what exists** in the system, how modules relate, and **why** key technical decisions were made.

---

## System Overview

**Project:** School Trainer
**Type:** Web app (mobile/tablet-first)
**Primary stack:** React (Vite, plain JavaScript) + Tailwind CSS + Supabase (Auth + PostgreSQL)
**Last updated:** 2026-05-12

---

## High-Level Architecture

```
[Browser — React SPA]
        │
        ├── Reads .md quiz files (bundled at build time via import.meta.glob)
        │
        └── Supabase JS SDK
                ├── Auth (email/password)
                └── PostgreSQL (quiz_attempts, profiles)
```

All quiz content is **static** — bundled into the build artifact. The server only stores user accounts and score history.

---

## Module Inventory

### `src/lib/supabase.js`
**Purpose:** Initializes and exports the Supabase client singleton.
**Depends on:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` env vars.

### `src/lib/quiz-parser.js`
**Purpose:** Parses a raw `.md` string into a structured Quiz JS object.
**Exposes:** `parseQuiz(rawMarkdown) → { id, title, subject, topic, subtopic, difficulty, questions[] }`

### `src/lib/quiz-loader.js`
**Purpose:** Loads all `.md` files at build time via `import.meta.glob` and exposes a flat map and nested index.
**Exposes:** `quizMap` (id → Quiz), `quizIndex` (subject → topic → Quiz[]), `subjects` (string[]).

### `src/hooks/useAuth.jsx`
**Purpose:** Provides auth state and actions via React Context.
**Exposes:** `{ user, signIn, signUp, signOut }` via `useAuth()` hook + `AuthProvider`.

### `src/pages/LoginPage.jsx`
Login and register form (email + password).

### `src/pages/HomePage.jsx`
Subject selection grid. Subjects are auto-discovered from quiz files.

### `src/pages/TopicPage.jsx`
Lists quizzes within a subject/topic. Fetches best score per quiz from Supabase.

### `src/pages/QuizPage.jsx`
Active quiz flow — one question at a time, saves attempt to Supabase on completion.

### `src/pages/HistoryPage.jsx`
Full attempt history for the current user, sorted newest first.

---

## Data Flow

### Quiz loading (build time)
```
src/quizzes/**/*.md
  → import.meta.glob (Vite bundles raw strings)
  → quiz-loader.js → parseQuiz() per file
  → quizMap + quizIndex (in-memory, no network)
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
  → ProtectedRoute allows navigation to HomePage
```

---

## Database Schema

See `supabase/migrations/001_initial.sql`.

**`profiles`** — one row per user (auto-created on sign-up via trigger).
**`quiz_attempts`** — one row per completed quiz attempt. RLS enforces user isolation.

---

## External Dependencies

| Dependency | Purpose |
|---|---|
| `@supabase/supabase-js` v2 | Auth + DB client |
| `gray-matter` | Frontmatter parser for .md quiz files |
| `react-router-dom` v7 | Client-side routing |
| `tailwindcss` v3 | Utility CSS, mobile-first |
| `@vitejs/plugin-react` | React JSX transform |
