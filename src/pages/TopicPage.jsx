import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchQuizzesByTopic } from '../lib/quiz-service'
import { supabase } from '../lib/supabase'

const TOPIC_META = {
  ortografia: { label: 'Ortografía', emoji: '✏️' },
  tablas: { label: 'Tablas de multiplicar', emoji: '🔢' },
  multiplicacion: { label: 'Multiplicación', emoji: '✖️' },
  division: { label: 'División', emoji: '➗' },
}

function getTopicMeta(topic) {
  return (
    TOPIC_META[topic] ?? {
      label: topic.charAt(0).toUpperCase() + topic.slice(1),
      emoji: '📝',
    }
  )
}

export function TopicPage() {
  const { subject, topic } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState([])
  const [bestScores, setBestScores] = useState({})
  const [loading, setLoading] = useState(true)

  const meta = getTopicMeta(topic)

  useEffect(() => {
    fetchQuizzesByTopic(subject, topic)
      .then(setQuizzes)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [subject, topic])

  useEffect(() => {
    async function fetchBestScores() {
      if (!user || quizzes.length === 0) return
      const quizIds = quizzes.map((q) => q.id)
      const { data } = await supabase
        .from('st_quiz_attempts')
        .select('quiz_id, score')
        .eq('user_id', user.id)
        .in('quiz_id', quizIds)
      if (data) {
        const best = {}
        data.forEach(({ quiz_id, score }) => {
          if (best[quiz_id] === undefined || score > best[quiz_id]) {
            best[quiz_id] = score
          }
        })
        setBestScores(best)
      }
    }
    fetchBestScores()
  }, [user, quizzes])

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600 text-xl">
          ←
        </button>
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{subject}</p>
          <h1 className="text-xl font-extrabold text-slate-800">
            {meta.emoji} {meta.label}
          </h1>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-4">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <p className="text-slate-400 animate-pulse">Cargando quizzes...</p>
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-sm">
              {quizzes.length} {quizzes.length === 1 ? 'quiz disponible' : 'quizzes disponibles'}
            </p>

            {quizzes.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-slate-500">No hay quizzes en este tema todavía.</p>
              </div>
            )}

        {quizzes.map((quiz) => {
              const best = bestScores[quiz.id]
              const hasBest = best !== undefined
              const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0

              return (
                <button
                  key={quiz.id}
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                  className="w-full bg-white border-2 border-slate-200 rounded-2xl p-5 text-left flex items-center justify-between hover:border-indigo-300 transition-colors active:scale-95"
                >
                  <div>
                    <p className="font-bold text-slate-800">{quiz.title}</p>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {questionCount} preguntas · Nivel {quiz.difficulty}
                    </p>
                  </div>
                  {hasBest ? (
                    <div className="flex-shrink-0 ml-4 text-center">
                      <div className={`text-2xl font-extrabold ${best >= 8 ? 'text-emerald-500' : best >= 5 ? 'text-amber-500' : 'text-rose-400'}`}>
                        {best}/10
                      </div>
                      <p className="text-xs text-slate-400">mejor</p>
                    </div>
                  ) : (
                    <span className="flex-shrink-0 ml-4 text-xs font-bold text-indigo-400 bg-indigo-50 rounded-full px-3 py-1">
                      NUEVO
                    </span>
                  )}
                </button>
              )
            })}
          </>
        )}
      </main>
    </div>
  )
}
