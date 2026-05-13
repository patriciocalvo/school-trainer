# GLOSSARY.md

| Term | Definition |
|------|------------|
| **subject** | Top-level category for quizzes. Slug-format string. E.g.: `lengua`, `matematica`. Corresponds to a folder under `src/quizzes/`. |
| **topic** | Sub-category within a subject. E.g.: `ortografia`, `multiplicacion`. Corresponds to a folder under `src/quizzes/<subject>/`. |
| **subtopic** | Optional finer grouping within a topic. Stored in quiz frontmatter only; not used for folder structure. E.g.: `v-vs-b`. |
| **quiz** | A single `.md` file containing 10 multiple-choice questions. Identified by a unique `id` slug. |
| **quiz attempt** | One completed run of a quiz by a user. Stored in `quiz_attempts` table. |
| **quizMap** | In-memory flat map of `quizId → Quiz object`, built from all `.md` files at build time. |
| **quizIndex** | In-memory nested map of `subject → topic → Quiz[]`, derived from `quizMap`. |
| **difficulty** | Integer 1–5 on a quiz, set in frontmatter. 1 = easiest. Used for display only (no gameplay effect yet). |
| **score** | Number of correctly answered questions in a quiz attempt (integer, 0–10). |
| **RLS** | Row Level Security — Supabase/PostgreSQL feature ensuring users can only access their own rows. |
| **frontmatter** | YAML block at the top of a `.md` file, delimited by `---`, containing quiz metadata. |
