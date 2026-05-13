import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { fetchAllQuizzes } from '../lib/quiz-service'

function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function HistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [attempts, setAttempts] = useState([])
  const [quizTitles, setQuizTitles] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      const [{ data: attemptsData }, quizzes] = await Promise.all([
        supabase
          .from('st_quiz_attempts')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(100),
        fetchAllQuizzes().catch(() => []),
      ])
      const titles = {}
      for (const q of quizzes) titles[q.id] = q.title
      setQuizTitles(titles)
      setAttempts(attemptsData ?? [])
      setLoading(false)
    }
    fetchHistory()
  }, [user])

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600 text-xl">
          ←
        </button>
        <h1 className="text-xl font-extrabold text-slate-800">📊 Mi historial</h1>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-3">
        {loading && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3 animate-spin">⏳</p>
            <p className="text-slate-400">Cargando...</p>
          </div>
        )}

        {!loading && attempts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-slate-500">Todavía no completaste ningún quiz.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-indigo-500 font-semibold hover:underline"
            >
              ¡Empezá ahora!
            </button>
          </div>
        )}

        {attempts.map((attempt) => {
          const title = quizTitles[attempt.quiz_id] ?? attempt.quiz_id
          const pct = Math.round((attempt.score / attempt.total_questions) * 100)

          return (
            <div
              key={attempt.id}
              className="bg-white rounded-2xl border-2 border-slate-200 p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">{title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {attempt.subject} · {attempt.topic}
                </p>
                <p className="text-xs text-slate-400">{formatDate(attempt.completed_at)}</p>
              </div>
              <div className="flex-shrink-0 text-center">
                <p
                  className={`text-2xl font-extrabold ${
                    pct >= 80
                      ? 'text-emerald-500'
                      : pct >= 50
                      ? 'text-amber-500'
                      : 'text-rose-400'
                  }`}
                >
                  {attempt.score}/{attempt.total_questions}
                </p>
                <p className="text-xs text-slate-400">{pct}%</p>
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}
