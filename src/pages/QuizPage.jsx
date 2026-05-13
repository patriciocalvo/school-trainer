import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchQuizById } from '../lib/quiz-service'
import { supabase } from '../lib/supabase'
import { QuizCard } from '../components/quiz/QuizCard'
import { ScoreSummary } from '../components/quiz/ScoreSummary'
import { ProgressBar } from '../components/ui/ProgressBar'

const CORRECT_MESSAGES = ['¡Correcto! ⭐', '¡Muy bien! 🎉', '¡Genial! 💪', '¡Exacto! 🌟', '¡Excelente! 🏆']
const WRONG_MESSAGES = ['¡Casi! 😅', 'No era esa 😬', '¡La próxima! 💪', 'Seguí intentando 🎯']

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function QuizPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [quiz, setQuiz] = useState(null)
  const [loadingQuiz, setLoadingQuiz] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [streak, setStreak] = useState(0)
  const [locked, setLocked] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchQuizById(quizId)
      .then(setQuiz)
      .catch(console.error)
      .finally(() => setLoadingQuiz(false))
  }, [quizId])

  if (loadingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Cargando quiz...</p>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-500">Quiz no encontrado.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-indigo-500 font-semibold">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const question = quiz.questions[currentIndex]
  const totalQuestions = quiz.questions.length

  async function handleAnswer(chosenKey) {
    if (locked) return
    setLocked(true)

    const isCorrect = chosenKey === question.answer
    const newStreak = isCorrect ? streak + 1 : 0
    setStreak(newStreak)

    const newAnswers = { ...answers, [currentIndex]: chosenKey }
    setAnswers(newAnswers)

    const isMilestone = newStreak > 0 && newStreak % 3 === 0
    const toastDelay = isMilestone ? 1800 : 1100

    setToast({
      correct: isCorrect,
      milestone: isMilestone,
      streakCount: newStreak,
      message: isCorrect ? randomFrom(CORRECT_MESSAGES) : randomFrom(WRONG_MESSAGES),
    })

    const isLast = currentIndex === totalQuestions - 1

    setTimeout(async () => {
      setToast(null)
      if (isLast) {
        const score = quiz.questions.reduce((acc, q, i) => {
          return acc + (newAnswers[i] === q.answer ? 1 : 0)
        }, 0)
        setSaving(true)
        await supabase.from('quiz_attempts').insert({
          user_id: user.id,
          quiz_id: quiz.id,
          subject: quiz.subject,
          topic: quiz.topic,
          score,
          total_questions: totalQuestions,
          answers_json: newAnswers,
        })
        setSaving(false)
        setFinished(true)
      } else {
        setCurrentIndex(currentIndex + 1)
        setLocked(false)
      }
    }, toastDelay)
  }

  function handleRetry() {
    setCurrentIndex(0)
    setAnswers({})
    setFinished(false)
    setStreak(0)
    setLocked(false)
    setToast(null)
  }

  if (finished) {
    const score = quiz.questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
      0
    )
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-1 p-6 flex flex-col justify-center max-w-lg mx-auto w-full">
          <ScoreSummary
            score={score}
            total={totalQuestions}
            quizTitle={quiz.title}
            subject={quiz.subject}
            topic={quiz.topic}
            onRetry={handleRetry}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* Answer toast overlay */}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className={`flex flex-col items-center gap-3 rounded-3xl shadow-2xl px-12 py-8 border-2 ${
              toast.milestone
                ? 'bg-orange-50 border-orange-300'
                : toast.correct
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-200'
            }`}
          >
            {toast.milestone ? (
              <>
                <span className="text-7xl animate-bounce">🔥</span>
                <p className="text-3xl font-black text-orange-500">¡En llamas!</p>
                <p className="text-lg font-bold text-orange-400">{toast.streakCount} seguidas 🎯</p>
              </>
            ) : (
              <>
                <span className="text-7xl animate-bounce">{toast.correct ? '⭐' : '😅'}</span>
                <p className={`text-2xl font-black ${toast.correct ? 'text-green-600' : 'text-red-500'}`}>
                  {toast.message}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 text-xl">
          ←
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider truncate">
            {quiz.subject} · {quiz.topic}
          </p>
          <h1 className="text-base font-bold text-slate-800 truncate">{quiz.title}</h1>
        </div>
        {streak >= 3 && (
          <div className="flex items-center gap-1 bg-orange-100 text-orange-600 font-black px-3 py-1.5 rounded-full text-sm shrink-0">
            🔥 {streak}
          </div>
        )}
      </header>

      <main className="flex-1 p-6 flex flex-col justify-center max-w-lg mx-auto w-full">
        {saving ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3 animate-bounce">💾</p>
            <p className="text-slate-500">Guardando puntaje...</p>
          </div>
        ) : (
          <QuizCard
            question={question}
            questionIndex={currentIndex}
            totalQuestions={totalQuestions}
            onAnswer={handleAnswer}
          />
        )}
      </main>
    </div>
  )
}
