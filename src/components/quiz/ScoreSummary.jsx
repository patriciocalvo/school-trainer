import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'

/**
 * Score summary screen shown after completing a quiz.
 * @param {{ score: number, total: number, quizTitle: string, subject: string, topic: string, wrongQuestions: Array, onRetry: () => void }} props
 */
export function ScoreSummary({ score, total, quizTitle, subject, topic, wrongQuestions = [], onRetry }) {
  const navigate = useNavigate()
  const [showReview, setShowReview] = useState(false)
  const pct = Math.round((score / total) * 100)

  const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '⭐' : pct >= 50 ? '💪' : '📚'
  const message =
    pct >= 90
      ? '¡Excelente trabajo!'
      : pct >= 70
      ? '¡Muy bien!'
      : pct >= 50
      ? '¡Sigue practicando!'
      : '¡Vamos a repasar más!'

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-8xl">{emoji}</div>

      <div className="text-center">
        <p className="text-2xl font-extrabold text-slate-800">{message}</p>
        <p className="text-slate-500 mt-1">{quizTitle}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 w-full text-center">
        <p className="text-7xl font-extrabold text-indigo-600">{score}</p>
        <p className="text-slate-400 text-lg">de {total} correctas</p>
        {wrongQuestions.length === 0 ? (
          <p className="text-emerald-500 font-semibold mt-2 text-sm">¡Sin errores! 🎯</p>
        ) : (
          <p className="text-rose-400 font-semibold mt-2 text-sm">
            {wrongQuestions.length} {wrongQuestions.length === 1 ? 'error' : 'errores'}
          </p>
        )}
      </div>

      {/* Wrong answers review */}
      {wrongQuestions.length > 0 && (
        <div className="w-full">
          <button
            onClick={() => setShowReview((v) => !v)}
            className="w-full flex items-center justify-between bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 text-rose-600 font-semibold text-sm"
          >
            <span>📋 Ver en qué me equivoqué</span>
            <span>{showReview ? '▲' : '▼'}</span>
          </button>

          {showReview && (
            <div className="mt-2 flex flex-col gap-3">
              {wrongQuestions.map((q, i) => {
                const correctOpt = q.options.find((o) => o.key === q.answer)
                const givenOpt = q.options.find((o) => o.key === q.given)
                return (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                    <p className="text-sm font-semibold text-slate-700 leading-snug">{q.text}</p>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wide w-16 flex-shrink-0 pt-0.5">
                          Tu resp.
                        </span>
                        <span className="text-sm text-rose-500 flex items-start gap-1">
                          <span className="font-bold">{q.given})</span>
                          <span>{givenOpt?.text}</span>
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide w-16 flex-shrink-0 pt-0.5">
                          Correcta
                        </span>
                        <span className="text-sm text-emerald-600 flex items-start gap-1 font-semibold">
                          <span className="font-bold">{q.answer})</span>
                          <span>{correctOpt?.text}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="w-full flex flex-col gap-3">
        <Button onClick={onRetry}>Intentar de nuevo</Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/subject/${subject}`)}
        >
          Volver a la materia
        </Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Inicio
        </Button>
      </div>
    </div>
  )
}
