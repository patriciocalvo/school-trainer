import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAllQuizzes, updateQuiz, deleteQuiz } from '../../lib/quiz-service'

const DIFFICULTY_LABEL = { 1: 'Básico', 2: 'Intermedio', 3: 'Avanzado' }

export function TeacherQuizListPage() {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)
      const data = await fetchAllQuizzes()
      setQuizzes(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleTogglePublished(quiz) {
    try {
      await updateQuiz(quiz.id, { is_published: !quiz.is_published })
      setQuizzes(qs => qs.map(q => q.id === quiz.id ? { ...q, is_published: !q.is_published } : q))
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete(quiz) {
    if (!window.confirm(`¿Borrar el quiz "${quiz.title}"? Esta acción no se puede deshacer.`)) return
    try {
      setDeletingId(quiz.id)
      await deleteQuiz(quiz.id)
      setQuizzes(qs => qs.filter(q => q.id !== quiz.id))
    } catch (e) {
      setError(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/teacher')} className="text-slate-400 hover:text-slate-600 text-xl">
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-slate-800">📝 Quizzes</h1>
        </div>
        <button
          onClick={() => navigate('/teacher/quizzes/new')}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          + Nuevo
        </button>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-3 max-w-2xl mx-auto w-full">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-slate-400 animate-pulse">Cargando quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-500">No hay quizzes todavía.</p>
            <button
              onClick={() => navigate('/teacher/quizzes/new')}
              className="mt-4 text-indigo-500 font-semibold"
            >
              Crear el primero
            </button>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{quiz.title}</p>
                <p className="text-sm text-slate-400 mt-0.5">
                  {quiz.subject} · {quiz.topic} · {DIFFICULTY_LABEL[quiz.difficulty] ?? quiz.difficulty}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Published toggle */}
                <button
                  onClick={() => handleTogglePublished(quiz)}
                  title={quiz.is_published ? 'Publicado — click para ocultar' : 'Borrador — click para publicar'}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
                    quiz.is_published
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {quiz.is_published ? '✅ Público' : '⚫ Borrador'}
                </button>

                {/* Edit */}
                <button
                  onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}
                  className="text-indigo-500 hover:text-indigo-700 font-bold text-sm px-2 py-1 rounded-lg hover:bg-indigo-50"
                >
                  ✏️
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(quiz)}
                  disabled={deletingId === quiz.id}
                  className="text-red-400 hover:text-red-600 font-bold text-sm px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-40"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}
