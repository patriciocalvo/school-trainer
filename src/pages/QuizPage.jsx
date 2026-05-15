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
  const [phase, setPhase] = useState('quiz') // 'preview' | 'quiz'
  const [lastAttempt, setLastAttempt] = useState(null)
  const [lastMistakes, setLastMistakes] = useState([])
  const [showMistakes, setShowMistakes] = useState(false)
  const [loadingMistakes, setLoadingMistakes] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [streak, setStreak] = useState(0)
  const [locked, setLocked] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const q = await fetchQuizById(quizId)
        setQuiz(q)
        if (user && q) {
          const { data } = await supabase
            .from('st_quiz_attempts')
            .select('score, total_questions, completed_at')
            .eq('user_id', user.id)
            .eq('quiz_id', quizId)
            .order('completed_at', { ascending: false })
            .limit(1)
          if (data && data.length > 0) {
            setLastAttempt(data[0])
            setPhase('preview')
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingQuiz(false)
      }
    }
    load()
  }, [quizId, user])

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

  async function handleShowMistakes() {
    if (lastMistakes.length > 0) { setShowMistakes(true); return }
    setLoadingMistakes(true)
    try {
      const { data } = await supabase
        .from('st_quiz_mistakes')
        .select('question_text, correct_key, correct_text, given_key, given_text')
        .eq('user_id', user.id)
        .eq('quiz_id', quizId)
        .gte('created_at', lastAttempt.completed_at)
        .order('question_idx', { ascending: true })
      setLastMistakes(data ?? [])
      setShowMistakes(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMistakes(false)
    }
  }

  if (phase === 'preview') {
    const pct = Math.round((lastAttempt.score / lastAttempt.total_questions) * 100)
    const scoreColor = pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-amber-500' : 'text-rose-400'
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 text-xl">←</button>
          <div>
            <h1 className="text-base font-bold text-slate-800">{quiz.title}</h1>
            <p className="text-xs text-slate-400">{quiz.subject} · {quiz.topic}</p>
          </div>
        </header>
        <main className="flex-1 p-6 flex flex-col gap-5 max-w-lg mx-auto w-full">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-center">
            <p className="text-sm text-slate-400 mb-1">Tu último puntaje</p>
            <p className={`text-6xl font-extrabold ${scoreColor}`}>{lastAttempt.score}</p>
            <p className="text-slate-400 text-base">de {lastAttempt.total_questions} correctas</p>
          </div>

          <button
            onClick={() => setPhase('quiz')}
            className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold rounded-2xl py-4 text-lg transition-all"
          >
            🔄 Rehacer el quiz
          </button>

          <button
            onClick={handleShowMistakes}
            disabled={loadingMistakes}
            className="w-full bg-rose-50 border-2 border-rose-200 hover:border-rose-400 active:scale-95 text-rose-600 font-bold rounded-2xl py-4 text-lg transition-all disabled:opacity-50"
          >
            {loadingMistakes ? 'Cargando...' : '📋 Ver errores de la última vez'}
          </button>

          {showMistakes && (
            <div className="flex flex-col gap-3">
              {lastMistakes.length === 0 ? (
                lastAttempt.score === lastAttempt.total_questions
                  ? <p className="text-center text-emerald-500 font-semibold py-4">¡Sin errores la última vez! 🎯</p>
                  : <p className="text-center text-slate-400 font-semibold py-4">No hay información disponible de los errores 📭</p>
              ) : (
                lastMistakes.map((m, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                    <p className="text-sm font-semibold text-slate-700 leading-snug">{m.question_text}</p>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wide w-16 flex-shrink-0 pt-0.5">Tu resp.</span>
                        <span className="text-sm text-rose-500 flex items-start gap-1">
                          <span className="font-bold">{m.given_key})</span>
                          <span>{m.given_text}</span>
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide w-16 flex-shrink-0 pt-0.5">Correcta</span>
                        <span className="text-sm text-emerald-600 flex items-start gap-1 font-semibold">
                          <span className="font-bold">{m.correct_key})</span>
                          <span>{m.correct_text}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    )
  }

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
        await supabase.from('st_quiz_attempts').insert({
          user_id: user.id,
          quiz_id: quiz.id,
          subject: quiz.subject,
          topic: quiz.topic,
          score,
          total_questions: totalQuestions,
          answers_json: newAnswers,
        })
        // Save individual mistakes
        const mistakes = quiz.questions
          .map((q, i) => ({ q, i, given: newAnswers[i] }))
          .filter(({ q, given }) => given !== q.answer)
          .map(({ q, i, given }) => ({
            user_id: user.id,
            quiz_id: quiz.id,
            subject: quiz.subject,
            topic: quiz.topic,
            question_idx: i,
            question_text: q.text,
            correct_key: q.answer,
            correct_text: q.options.find((o) => o.key === q.answer)?.text ?? '',
            given_key: given,
            given_text: q.options.find((o) => o.key === given)?.text ?? '',
          }))
        if (mistakes.length > 0) {
          await supabase.from('st_quiz_mistakes').insert(mistakes)
        }
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
    const wrongQuestions = quiz.questions
      .map((q, i) => ({ ...q, idx: i, given: answers[i] }))
      .filter((q) => q.given !== q.answer)

    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-1 p-6 flex flex-col justify-center max-w-lg mx-auto w-full">
          <ScoreSummary
            score={score}
            total={totalQuestions}
            quizTitle={quiz.title}
            subject={quiz.subject}
            topic={quiz.topic}
            wrongQuestions={wrongQuestions}
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
