import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { fetchQuizById, createQuiz, updateQuiz } from '../../lib/quiz-service'

const EMPTY_OPTION = (key) => ({ key, text: '' })
const EMPTY_QUESTION = () => ({
  text: '',
  options: ['a', 'b', 'c', 'd', 'e'].map(EMPTY_OPTION),
  answer: 'a',
})

export function TeacherQuizFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [meta, setMeta] = useState({
    id: '',
    title: '',
    subject: '',
    topic: '',
    subtopic: '',
    difficulty: 1,
    is_published: true,
  })
  const [questions, setQuestions] = useState([EMPTY_QUESTION()])

  useEffect(() => {
    if (!isEdit) return
    fetchQuizById(id)
      .then((quiz) => {
        if (!quiz) { navigate('/teacher/quizzes'); return }
        setMeta({
          id: quiz.id,
          title: quiz.title,
          subject: quiz.subject,
          topic: quiz.topic,
          subtopic: quiz.subtopic ?? '',
          difficulty: quiz.difficulty,
          is_published: quiz.is_published,
        })
        setQuestions(
          quiz.questions.length > 0
            ? quiz.questions.map((q) => ({
                text: q.text,
                options: ['a', 'b', 'c', 'd', 'e'].map((k) => ({
                  key: k,
                  text: q.options.find((o) => o.key === k)?.text ?? '',
                })),
                answer: q.answer,
              }))
            : [EMPTY_QUESTION()]
        )
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function setMetaField(field, value) {
    setMeta((m) => ({ ...m, [field]: value }))
  }

  function setQuestionField(qIdx, field, value) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qIdx ? { ...q, [field]: value } : q))
    )
  }

  function setOptionText(qIdx, key, text) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o) => (o.key === key ? { ...o, text } : o)) }
          : q
      )
    )
  }

  function addQuestion() {
    if (questions.length >= 10) return
    setQuestions((qs) => [...qs, EMPTY_QUESTION()])
  }

  function removeQuestion(qIdx) {
    if (questions.length <= 1) return
    setQuestions((qs) => qs.filter((_, i) => i !== qIdx))
  }

  async function handleSave() {
    setError(null)

    // Basic validation
    if (!meta.id.trim()) return setError('El ID del quiz es obligatorio.')
    if (!meta.title.trim()) return setError('El título es obligatorio.')
    if (!meta.subject.trim()) return setError('La materia es obligatoria.')
    if (!meta.topic.trim()) return setError('El tema es obligatorio.')
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) return setError(`La pregunta ${i + 1} no tiene enunciado.`)
      for (const opt of q.options) {
        if (!opt.text.trim()) return setError(`La opción ${opt.key.toUpperCase()} de la pregunta ${i + 1} está vacía.`)
      }
    }

    const payload = {
      id: meta.id.trim(),
      title: meta.title.trim(),
      subject: meta.subject.trim().toLowerCase(),
      topic: meta.topic.trim().toLowerCase(),
      subtopic: meta.subtopic.trim() || null,
      difficulty: Number(meta.difficulty),
      is_published: meta.is_published,
      questions: questions.map((q) => ({
        text: q.text.trim(),
        options: q.options.map((o) => ({ key: o.key, text: o.text.trim() })),
        answer: q.answer,
      })),
    }

    try {
      setSaving(true)
      if (isEdit) {
        const { id: _id, ...updates } = payload
        await updateQuiz(meta.id, updates)
      } else {
        await createQuiz({ ...payload, created_by: user.id })
      }
      navigate('/teacher/quizzes')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/teacher/quizzes')} className="text-slate-400 hover:text-slate-600 text-xl">
          ←
        </button>
        <h1 className="text-xl font-extrabold text-slate-800 flex-1">
          {isEdit ? '✏️ Editar quiz' : '➕ Nuevo quiz'}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Metadata */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Información general</h2>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">ID del quiz *</label>
            <input
              className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 disabled:bg-slate-50 disabled:text-slate-400"
              value={meta.id}
              onChange={(e) => setMetaField('id', e.target.value)}
              disabled={isEdit}
              placeholder="ej: lengua-ortografia-01"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Título *</label>
            <input
              className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              value={meta.title}
              onChange={(e) => setMetaField('title', e.target.value)}
              placeholder="ej: ✏️ La H: palabras que sí y que no"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Materia *</label>
              <input
                className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                value={meta.subject}
                onChange={(e) => setMetaField('subject', e.target.value)}
                placeholder="ej: lengua"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Tema *</label>
              <input
                className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                value={meta.topic}
                onChange={(e) => setMetaField('topic', e.target.value)}
                placeholder="ej: ortografia"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Subtema</label>
              <input
                className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                value={meta.subtopic}
                onChange={(e) => setMetaField('subtopic', e.target.value)}
                placeholder="ej: letra-h"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Dificultad</label>
              <select
                className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                value={meta.difficulty}
                onChange={(e) => setMetaField('difficulty', Number(e.target.value))}
              >
                <option value={1}>1 — Básico</option>
                <option value={2}>2 — Intermedio</option>
                <option value={3}>3 — Avanzado</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-indigo-500"
              checked={meta.is_published}
              onChange={(e) => setMetaField('is_published', e.target.checked)}
            />
            <span className="text-sm font-semibold text-slate-700">Publicado (visible para alumnos)</span>
          </label>
        </section>

        {/* Questions */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
              Preguntas ({questions.length}/10)
            </h2>
            {questions.length < 10 && (
              <button
                onClick={addQuestion}
                className="text-sm font-bold text-indigo-500 hover:text-indigo-700"
              >
                + Agregar pregunta
              </button>
            )}
          </div>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Pregunta {qIdx + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIdx)}
                    className="text-red-400 hover:text-red-600 text-sm font-bold"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Enunciado *</label>
                <textarea
                  rows={3}
                  className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none"
                  value={q.text}
                  onChange={(e) => setQuestionField(qIdx, 'text', e.target.value)}
                  placeholder="Escribí la pregunta aquí..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">Opciones</label>
                {q.options.map((opt) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`answer-${qIdx}`}
                      value={opt.key}
                      checked={q.answer === opt.key}
                      onChange={() => setQuestionField(qIdx, 'answer', opt.key)}
                      className="w-4 h-4 accent-emerald-500 shrink-0"
                    />
                    <span className="w-5 text-sm font-bold text-slate-500 shrink-0">{opt.key})</span>
                    <input
                      className="flex-1 border border-slate-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
                      value={opt.text}
                      onChange={(e) => setOptionText(qIdx, opt.key, e.target.value)}
                      placeholder={`Opción ${opt.key.toUpperCase()}`}
                    />
                  </div>
                ))}
                <p className="text-xs text-slate-400 mt-1">
                  🟢 Seleccioná el radio de la respuesta correcta
                </p>
              </div>
            </div>
          ))}

          {questions.length < 10 && (
            <button
              onClick={addQuestion}
              className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-300 text-slate-400 hover:text-indigo-400 rounded-2xl py-4 text-sm font-bold transition-colors"
            >
              + Agregar pregunta
            </button>
          )}
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl text-lg transition-colors"
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear quiz'}
        </button>
      </main>
    </div>
  )
}
