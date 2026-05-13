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

_(none yet)_
