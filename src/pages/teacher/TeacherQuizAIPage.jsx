import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { fetchAllSubjects, createSubject, deleteSubject, createQuiz } from '../../lib/quiz-service'

const DIFFICULTY_LABEL = { 1: 'Básico', 2: 'Intermedio', 3: 'Avanzado' }
const QUESTION_COUNT = 10

function generateId(subject, subtopic) {
  const base = `${subject}-${subtopic || 'quiz'}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  return `${base}-${Date.now().toString(36)}`
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 32)
}

export function TeacherQuizAIPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [subjects, setSubjects] = useState([])
  const [form, setForm] = useState({
    subject: '',
    topic: '',
    subtopic: '',
    difficulty: 1,
    extraContext: '',
  })

  // Subject management UI state
  const [addingSubject, setAddingSubject] = useState(false)
  const [newEmoji, setNewEmoji] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [subjectActionLoading, setSubjectActionLoading] = useState(false)

  const [status, setStatus] = useState('idle') // idle | generating | preview | saving | saved | error
  const [error, setError] = useState(null)
  const [editingQuiz, setEditingQuiz] = useState(null)

  useEffect(() => {
    loadSubjects()
  }, [])

  function loadSubjects() {
    fetchAllSubjects().then(setSubjects).catch(console.error)
  }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleAddSubject() {
    if (!newLabel.trim()) return
    setSubjectActionLoading(true)
    try {
      const id = slugify(newLabel)
      await createSubject({ id, label: newLabel.trim(), emoji: newEmoji.trim() || '📚' })
      setNewLabel('')
      setNewEmoji('')
      setAddingSubject(false)
      loadSubjects()
      setField('subject', id)
    } catch (err) {
      alert('Error al crear la materia: ' + err.message)
    } finally {
      setSubjectActionLoading(false)
    }
  }

  async function handleDeleteSubject() {
    const subject = subjects.find((s) => s.id === form.subject)
    if (!subject) return
    const ok = window.confirm(
      `¿Eliminar la materia "${subject.emoji} ${subject.label}"?\n\nTodos sus quizzes se moverán a "Varios".`
    )
    if (!ok) return
    setSubjectActionLoading(true)
    try {
      await deleteSubject(form.subject)
      setField('subject', '')
      loadSubjects()
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    } finally {
      setSubjectActionLoading(false)
    }
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setStatus('generating')
    setError(null)
    setEditingQuiz(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject: form.subject,
            topic: form.topic,
            subtopic: form.subtopic || undefined,
            difficulty: Number(form.difficulty),
            questionCount: QUESTION_COUNT,
            style: 'mixed',
            extraContext: form.extraContext || undefined,
          }),
        }
      )

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error generando el quiz')

      setEditingQuiz(JSON.parse(JSON.stringify(json.quiz)))
      setStatus('preview')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  async function handleSave() {
    setStatus('saving')
    try {
      const quizId = generateId(form.subject, form.subtopic || form.topic)
      await createQuiz({
        id: quizId,
        title: editingQuiz.title,
        subject: form.subject,
        topic: form.topic,
        subtopic: form.subtopic || null,
        difficulty: Number(form.difficulty),
        questions: editingQuiz.questions,
        is_published: false,
        created_by: user?.id,
      })
      setStatus('saved')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  function updateQuestion(qIdx, field, value) {
    setEditingQuiz((prev) => {
      const questions = prev.questions.map((q, i) =>
        i === qIdx ? { ...q, [field]: value } : q
      )
      return { ...prev, questions }
    })
  }

  function updateOption(qIdx, optKey, value) {
    setEditingQuiz((prev) => {
      const questions = prev.questions.map((q, i) => {
        if (i !== qIdx) return q
        return {
          ...q,
          options: q.options.map((o) => (o.key === optKey ? { ...o, text: value } : o)),
        }
      })
      return { ...prev, questions }
    })
  }

  const selectedSubject = subjects.find((s) => s.id === form.subject)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/teacher')} className="text-slate-400 hover:text-slate-600 text-xl">
          ←
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">✨ Generar Quiz con IA</h1>
          <p className="text-xs text-slate-400">El quiz queda sin publicar hasta que lo revisés · Siempre {QUESTION_COUNT} preguntas</p>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">

        {/* FORM */}
        {(status === 'idle' || status === 'error' || status === 'generating') && (
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">

            {/* Subject row */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Materia *</label>
              <div className="flex gap-2">
                <select
                  required
                  value={form.subject}
                  onChange={(e) => setField('subject', e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">Elegí una materia</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => { setAddingSubject((v) => !v); setNewLabel(''); setNewEmoji('') }}
                  title="Agregar materia"
                  className="px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold text-lg leading-none transition-colors"
                >
                  ➕
                </button>
                {form.subject && form.subject !== 'varios' && (
                  <button
                    type="button"
                    onClick={handleDeleteSubject}
                    disabled={subjectActionLoading}
                    title={`Eliminar ${selectedSubject?.label}`}
                    className="px-3 py-2 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl font-bold text-lg leading-none transition-colors disabled:opacity-40"
                  >
                    🗑️
                  </button>
                )}
              </div>

              {/* Inline add-subject form */}
              {addingSubject && (
                <div className="flex gap-2 mt-1 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <input
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    placeholder="🔬"
                    maxLength={4}
                    className="w-14 border border-slate-200 rounded-lg px-2 py-1.5 text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Nombre de la materia"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                  />
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    disabled={!newLabel.trim() || subjectActionLoading}
                    className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg font-bold disabled:opacity-40"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingSubject(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-lg font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tema *</label>
                <input
                  required
                  value={form.topic}
                  onChange={(e) => setField('topic', e.target.value)}
                  placeholder="ej: fracciones, ortografía"
                  className="border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Subtema</label>
                <input
                  value={form.subtopic}
                  onChange={(e) => setField('subtopic', e.target.value)}
                  placeholder="ej: suma de fracciones"
                  className="border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dificultad</label>
              <select
                value={form.difficulty}
                onChange={(e) => setField('difficulty', e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value={1}>1 — Básico</option>
                <option value={2}>2 — Intermedio</option>
                <option value={3}>3 — Avanzado</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contexto adicional</label>
              <textarea
                value={form.extraContext}
                onChange={(e) => setField('extraContext', e.target.value)}
                placeholder="ej: Los alumnos están viendo los Mayas. Es para 4to grado."
                rows={2}
                className="border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>

            {status === 'error' && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'generating'}
              className="w-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-extrabold rounded-2xl py-4 text-lg shadow-lg disabled:opacity-60 transition-all active:scale-95"
            >
              {status === 'generating' ? '✨ Generando…' : `✨ Generar Quiz (${QUESTION_COUNT} preguntas)`}
            </button>
          </form>
        )}

        {/* PREVIEW */}
        {(status === 'preview' || status === 'saving' || status === 'saved') && editingQuiz && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setStatus('idle'); setEditingQuiz(null) }}
                className="text-sm text-slate-400 hover:text-slate-600 font-semibold"
              >
                ← Volver a editar parámetros
              </button>
              <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-3 py-1">
                {DIFFICULTY_LABEL[form.difficulty]} · {selectedSubject?.emoji} {selectedSubject?.label} / {form.topic}
              </span>
            </div>

            {/* Editable title */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Título del quiz</label>
              <input
                value={editingQuiz.title}
                onChange={(e) => setEditingQuiz((p) => ({ ...p, title: e.target.value }))}
                className="border-2 border-indigo-200 rounded-xl px-3 py-2 text-slate-800 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Questions */}
            {editingQuiz.questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-extrabold text-indigo-400 bg-indigo-50 rounded-full px-2 py-0.5 mt-0.5 flex-shrink-0">
                    {qIdx + 1}
                  </span>
                  <textarea
                    value={q.text}
                    onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                    rows={2}
                    className="flex-1 text-sm font-semibold text-slate-800 border border-slate-200 rounded-lg px-2 py-1 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5 pl-7">
                  {q.options.map((opt) => (
                    <div key={opt.key} className="flex items-center gap-2">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`answer-${qIdx}`}
                          checked={q.answer === opt.key}
                          onChange={() => updateQuestion(qIdx, 'answer', opt.key)}
                          className="accent-indigo-500"
                        />
                        <span className={`text-xs font-bold w-4 ${q.answer === opt.key ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {opt.key}
                        </span>
                      </label>
                      <input
                        value={opt.text}
                        onChange={(e) => updateOption(qIdx, opt.key, e.target.value)}
                        className={`flex-1 text-sm border rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-200 ${q.answer === opt.key ? 'border-indigo-300 bg-indigo-50 text-indigo-800 font-semibold' : 'border-slate-200 text-slate-700'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {status === 'error' && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            {status === 'saved' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">🎉</p>
                <p className="font-bold text-emerald-700">¡Quiz guardado!</p>
                <p className="text-sm text-emerald-600 mb-3">Quedó sin publicar. Podés revisarlo y publicarlo desde la lista de quizzes.</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => navigate('/teacher/quizzes')}
                    className="bg-emerald-500 text-white font-bold rounded-xl px-4 py-2 text-sm"
                  >
                    Ver mis quizzes
                  </button>
                  <button
                    onClick={() => { setStatus('idle'); setEditingQuiz(null) }}
                    className="bg-white border border-slate-200 text-slate-600 font-bold rounded-xl px-4 py-2 text-sm"
                  >
                    Generar otro
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSave}
                disabled={status === 'saving'}
                className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-extrabold rounded-2xl py-4 text-lg shadow-lg disabled:opacity-60 transition-all active:scale-95"
              >
                {status === 'saving' ? 'Guardando…' : '💾 Guardar quiz (sin publicar)'}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

