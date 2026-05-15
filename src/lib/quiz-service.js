import { supabase } from './supabase'

/**
 * Returns subjects from st_subjects joined with quiz counts (published only, filtered to those with quizzes).
 * @returns {Promise<Array<{id, label, emoji, color, quizCount}>>}
 */
export async function fetchSubjects() {
  const [{ data: subjects, error: subjectsError }, { data: counts, error: countsError }] =
    await Promise.all([
      supabase.from('st_subjects').select('id, label, emoji, color, sort_order').order('sort_order'),
      supabase.from('st_quizzes').select('subject').eq('is_published', true),
    ])
  if (subjectsError) throw subjectsError
  if (countsError) throw countsError
  const countMap = {}
  for (const { subject } of counts) {
    countMap[subject] = (countMap[subject] ?? 0) + 1
  }
  return subjects
    .filter((s) => countMap[s.id])
    .map((s) => ({ ...s, quizCount: countMap[s.id] ?? 0 }))
}

/**
 * Returns ALL subjects from st_subjects (no quiz-count filter). For teacher use.
 * @returns {Promise<Array<{id, label, emoji, color, sort_order}>>}
 */
export async function fetchAllSubjects() {
  const { data, error } = await supabase
    .from('st_subjects')
    .select('id, label, emoji, color, sort_order')
    .order('sort_order')
  if (error) throw error
  return data
}

/**
 * Creates a new subject in st_subjects.
 * @param {{ id, label, emoji }} subject
 */
export async function createSubject({ id, label, emoji }) {
  const { data: existing } = await supabase.from('st_subjects').select('sort_order').order('sort_order', { ascending: false }).limit(1).single()
  const sort_order = (existing?.sort_order ?? 0) + 10
  const { data, error } = await supabase
    .from('st_subjects')
    .insert({ id, label, emoji, color: 'slate', sort_order })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Deletes a subject, reassigning its quizzes to "varios".
 * @param {string} id
 */
export async function deleteSubject(id) {
  // Ensure "varios" subject exists
  await supabase.from('st_subjects').upsert(
    { id: 'varios', label: 'Varios', emoji: '📦', color: 'slate', sort_order: 999 },
    { onConflict: 'id', ignoreDuplicates: true }
  )
  // Move quizzes
  const { error: moveError } = await supabase
    .from('st_quizzes')
    .update({ subject: 'varios' })
    .eq('subject', id)
  if (moveError) throw moveError
  // Delete subject
  const { error } = await supabase.from('st_subjects').delete().eq('id', id)
  if (error) throw error
}

/**
 * Returns all quizzes for a given subject (published only).
 * @returns {Promise<Array>}
 */
export async function fetchQuizzesBySubject(subject) {
  const { data, error } = await supabase
    .from('st_quizzes')
    .select('id, title, subject, topic, subtopic, difficulty, questions')
    .eq('subject', subject)
    .eq('is_published', true)
    .order('topic')
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
    .from('st_quizzes')
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
    .from('st_quizzes')
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
    .from('st_quizzes')
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
    .from('st_quizzes')
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
  const { error } = await supabase.from('st_quizzes').delete().eq('id', id)
  if (error) throw error
}
