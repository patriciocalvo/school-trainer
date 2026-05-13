import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchSubjectsAndTopics } from '../lib/quiz-service'

const SUBJECT_META = {
  lengua:      { label: 'Lengua',      emoji: '📖', color: 'from-violet-400 to-indigo-500' },
  matematica:  { label: 'Matemática',  emoji: '🔢', color: 'from-emerald-400 to-teal-500' },
  ciencias:    { label: 'Ciencias',    emoji: '🔬', color: 'from-yellow-400 to-orange-500' },
  historia:    { label: 'Historia',    emoji: '🏛️', color: 'from-amber-400 to-yellow-500' },
  ingles:      { label: 'Inglés',      emoji: '🌎', color: 'from-sky-400 to-blue-500' },
  deportes:    { label: 'Deportes',    emoji: '⚽', color: 'from-rose-400 to-pink-500' },
}

function getSubjectMeta(subject) {
  return (
    SUBJECT_META[subject] ?? {
      label: subject.charAt(0).toUpperCase() + subject.slice(1),
      emoji: '📚',
      color: 'from-orange-400 to-amber-500',
    }
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { user, role, signOut } = useAuth()
  const [subjectIndex, setSubjectIndex] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubjectsAndTopics()
      .then(setSubjectIndex)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const subjects = Object.keys(subjectIndex)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">🎓 School Trainer</h1>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {role === 'teacher' && (
            <button
              onClick={() => navigate('/teacher')}
              className="text-sm font-bold text-indigo-500 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full"
            >
              👩‍🏫 Docente
            </button>
          )}
          <button onClick={signOut} className="text-sm text-slate-400 hover:text-slate-600 font-semibold">
            Salir
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">¿Qué querés practicar?</h2>
          <p className="text-slate-500 text-sm mt-1">Elegí una materia para empezar</p>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <p className="text-slate-400 animate-pulse">Cargando materias...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {subjects.map((subject) => {
              const meta = getSubjectMeta(subject)
              const topicCount = Object.keys(subjectIndex[subject]).length
              const quizCount = Object.values(subjectIndex[subject]).reduce((a, b) => a + b, 0)
              const topics = Object.keys(subjectIndex[subject])

              return (
                <button
                  key={subject}
                  onClick={() => {
                    if (topics.length === 1) {
                      navigate(`/subject/${subject}/${topics[0]}`)
                    } else {
                      navigate(`/subject/${subject}`)
                    }
                  }}
                  className={`w-full bg-gradient-to-br ${meta.color} rounded-3xl p-6 text-left text-white shadow-lg transition-all active:scale-95`}
                >
                  <div className="text-5xl mb-3">{meta.emoji}</div>
                  <h3 className="text-2xl font-extrabold">{meta.label}</h3>
                  <p className="text-white/80 text-sm mt-1">
                    {topicCount} {topicCount === 1 ? 'tema' : 'temas'} · {quizCount}{' '}
                    {quizCount === 1 ? 'quiz' : 'quizzes'}
                  </p>
                </button>
              )
            })}
          </div>
        )}

        <button
          onClick={() => navigate('/history')}
          className="mt-2 w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-left flex items-center gap-4 hover:border-indigo-300 transition-colors"
        >
          <span className="text-3xl">📊</span>
          <div>
            <p className="font-bold text-slate-700">Mi historial</p>
            <p className="text-sm text-slate-400">Ver mis puntajes anteriores</p>
          </div>
        </button>
      </main>
    </div>
  )
}
