import { supabase } from './supabase'

/**
 * Returns subject → topic → count map for the home page.
 * @returns {Promise<Record<string, Record<string, number>>>}
 */
export async function fetchSubjectsAndTopics() {
  const { data, error } = await supabase
    .from('quizzes')
    .select('subject, topic')
    .eq('is_published', true)
  if (error) throw error
  const index = {}
  for (const { subject, topic } of data) {
    if (!index[subject]) index[subject] = {}
    index[subject][topic] = (index[subject][topic] ?? 0) + 1
  }
  return index
}

/**
 * Returns all quizzes for a given subject + topic (published only).
 * @returns {Promise<Array>}
 */
export async function fetchQuizzesByTopic(subject, topic) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title, subject, topic, subtopic, difficulty, questions')
    .eq('subject', subject)
    .eq('topic', topic)
    .eq('is_published', true)
    .order('difficulty', { ascending: true })
  if (error) throw error
  return data
}

/**
 * Returns a single quiz by id (students see only published).
 * @returns {Promise<object|null>}
 */
export async function fetchQuizById(id) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

/**
 * Returns ALL quizzes regardless of published state (teacher use).
 * @returns {Promise<Array>}
 */
export async function fetchAllQuizzes() {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title, subject, topic, difficulty, is_published, created_at')
    .order('subject')
    .order('topic')
    .order('title')
  if (error) throw error
  return data
}

/**
 * Inserts a new quiz row.
 * @param {{ id, title, subject, topic, subtopic, difficulty, questions, is_published }} quiz
 */
export async function createQuiz(quiz) {
  const { data, error } = await supabase
    .from('quizzes')
    .insert(quiz)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Updates an existing quiz row.
 * @param {string} id
 * @param {Partial<object>} updates
 */
export async function updateQuiz(id, updates) {
  const { data, error } = await supabase
    .from('quizzes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Deletes a quiz row.
 * @param {string} id
 */
export async function deleteQuiz(id) {
  const { error } = await supabase.from('quizzes').delete().eq('id', id)
  if (error) throw error
}
