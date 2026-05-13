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

### Supabase Auth — email/password
**Context:** App is for children, parent/teacher manages account creation.
**Decision:** Standard email + password login via Supabase Auth.

### Unlimited quiz retries, full attempt history
**Context:** Educational tool — repetition is valuable.
**Decision:** Every completed quiz attempt is saved as a row in `quiz_attempts`. `TopicPage` shows the best score; `HistoryPage` shows all attempts.

### Tailwind CSS with Nunito font
**Context:** App targets mobile/tablet (vertical). Needs to feel friendly for children.
**Decision:** Tailwind for utility-first styling, Google Fonts Nunito for a rounded, readable feel.

### Quiz file format: Markdown with frontmatter + `## N.` question headers
**Context:** Format must be easy for an LLM to generate reliably.
**Decision:** YAML frontmatter (parsed by `gray-matter`) + body split by `## N.` regex. Options as `- x) text` list items. Answer as `**Respuesta: x**`.
**Rationale:** Simple, unambiguous, and grep-friendly. No custom DSL needed.
