import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'

/**
 * Score summary screen shown after completing a quiz.
 * @param {{ score: number, total: number, quizTitle: string, subject: string, topic: string, onRetry: () => void }} props
 */
export function ScoreSummary({ score, total, quizTitle, subject, topic, onRetry }) {
  const navigate = useNavigate()
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
      </div>

      <div className="w-full flex flex-col gap-3">
        <Button onClick={onRetry}>Intentar de nuevo</Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/subject/${subject}/${topic}`)}
        >
          Volver al tema
        </Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Inicio
        </Button>
      </div>
    </div>
  )
}
