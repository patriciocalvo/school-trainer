# DECISION_LOG.md

> Records significant technical decisions, their context, and rationale.

---

## 2026-05-12 — Initial project setup

### Use plain JavaScript, not TypeScript
**Context:** User preference.
**Decision:** JavaScript + JSDoc comments where helpful. No `tsconfig.json`.

### Quiz content as static .md files in the repo
**Context:** Two options considered — in-repo static files vs Supabase Storage.
**Decision:** In-repo files, bundled at build time via `import.meta.glob(..., { as: 'raw', eager: true })`.
**Rationale:** Simpler architecture; no extra network request to load quiz content; quiz changes are tracked in git; easier local development.
**Trade-off:** Adding new quizzes requires a rebuild and redeploy.
**Superseded by:** 2026-05-13 decision below.

### Quiz content format: Markdown with frontmatter
**Context:** Format must be easy for an LLM to generate reliably.
**Decision:** YAML frontmatter + body split by `## N.` regex. Options as `- x) text` list items. Answer as `**Respuesta: x**`.
**Superseded by:** 2026-05-13 decision below.

### Supabase Auth — email/password
**Context:** App is for children, parent/teacher manages account creation.
**Decision:** Standard email + password login via Supabase Auth.

### Unlimited quiz retries, full attempt history
**Context:** Educational tool — repetition is valuable.
**Decision:** Every completed quiz attempt is saved as a row in `quiz_attempts`. `TopicPage` shows the best score; `HistoryPage` shows all attempts.

## 2026-05-13 — Migrate quizzes to Supabase DB + teacher role

### Quiz content migrated from static .md files to `quizzes` table
**Context:** Static files required a rebuild to add content. Teachers needed a way to create quizzes without touching code or git.
**Decision:** Move all quiz content to a `quizzes` table in Supabase. `quiz-loader.js` and `quiz-parser.js` removed. New `quiz-service.js` handles all DB access.
**Rationale:** Enables teacher CRUD UI, LLM-generated quizzes via MCP, and no-redeploy content updates.
**Trade-off:** Quiz content is no longer in git history; requires Supabase to be running.

### Teacher role on profiles
**Context:** Needed to distinguish teachers (who can manage quizzes/view all progress) from students.
**Decision:** `role text check (role in ('student','teacher'))` on `profiles`. Default: `student`. RLS policies enforce role-based access.

### LLM quiz generation via Supabase MCP
**Context:** Teachers (or devs) should be able to generate quizzes with an LLM and insert them directly into the DB.
**Decision:** Document the `quizzes` table shape and provide a prompt template in `docs/quiz-config.md`. Configure Supabase MCP in `.vscode/mcp.json`.

---

### Tailwind CSS with Nunito font
**Context:** App targets mobile/tablet (vertical). Needs to feel friendly for children.
**Decision:** Tailwind for utility-first styling, Google Fonts Nunito for a rounded, readable feel.
