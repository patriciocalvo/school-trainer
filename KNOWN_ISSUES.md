# KNOWN_ISSUES.md

> Tracks known limitations, bugs, and missing features.

---

## Open

### No subject-level route for subjects with multiple topics
**File:** `src/pages/HomePage.jsx`
**Detail:** When a subject has only one topic, `HomePage` navigates directly to that topic page. When it has multiple topics, it navigates to `/subject/:subject` — but no page handles that route yet.
**Workaround:** All current subjects have only one topic. Add a `SubjectPage` when needed.

### No `.env` validation at runtime
**Detail:** If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing, `supabase.js` throws during module initialization, which causes a blank screen. The error is visible in the browser console.
**Workaround:** Always copy `.env.example` to `.env` and fill in credentials before running.

---

## Resolved

### `gray-matter` `Buffer is not defined` in browser
**Resolution:** Removed `gray-matter` dependency. Replaced with inline `parseFrontmatter()` in `quiz-parser.js`. Later `quiz-parser.js` and `quiz-loader.js` were removed entirely when quizzes were migrated to the DB.

### Vite `import.meta.glob` deprecation warning (`as: 'raw'`)
**Resolution:** Updated to `{ query: '?raw', import: 'default' }`. Later removed entirely with DB migration.

### `quiz_attempts` join with `profiles` fails in Supabase
**Detail:** `quiz_attempts.user_id` references `auth.users`, not `profiles` directly — PostgREST cannot infer the join.
**Resolution:** Replaced single joined query with two parallel queries + client-side merge in `TeacherProgressPage`.
