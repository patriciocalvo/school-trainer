import { ProgressBar } from '../ui/ProgressBar'

/**
 * Displays a single quiz question with its options.
 * @param {{ question: object, questionIndex: number, totalQuestions: number, onAnswer: (key: string) => void }} props
 */
export function QuizCard({ question, questionIndex, totalQuestions, onAnswer }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <ProgressBar
          value={questionIndex}
          max={totalQuestions}
          label={`${questionIndex} / ${totalQuestions}`}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
          Pregunta {questionIndex + 1}
        </p>
        <p className="text-xl font-bold text-slate-800 leading-snug">{question.text}</p>
      </div>

      <div className="flex flex-col gap-3">
        {question.options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onAnswer(opt.key)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left font-semibold transition-all bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 active:scale-95"
          >
            <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold uppercase">
              {opt.key}
            </span>
            <span className="text-base leading-snug">{opt.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
