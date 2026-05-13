import { parseQuiz } from './quiz-parser'

// Import all .md files under src/quizzes/ as raw strings at build time.
// The key is the file path relative to the project root.
const rawFiles = import.meta.glob('../quizzes/**/*.md', { query: '?raw', import: 'default', eager: true })

/**
 * Flat map of quizId → parsed Quiz object.
 * @type {Record<string, ReturnType<import('./quiz-parser').parseQuiz>>}
 */
export const quizMap = Object.fromEntries(
  Object.entries(rawFiles).map(([, raw]) => {
    const quiz = parseQuiz(raw)
    return [quiz.id, quiz]
  })
)

/**
 * Nested index: subject → topic → Quiz[]
 * @type {Record<string, Record<string, Array>>}
 */
export const quizIndex = Object.values(quizMap).reduce((acc, quiz) => {
  if (!acc[quiz.subject]) acc[quiz.subject] = {}
  if (!acc[quiz.subject][quiz.topic]) acc[quiz.subject][quiz.topic] = []
  acc[quiz.subject][quiz.topic].push(quiz)
  return acc
}, {})

/**
 * List of unique subjects.
 * @type {string[]}
 */
export const subjects = Object.keys(quizIndex)
