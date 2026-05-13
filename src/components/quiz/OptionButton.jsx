/**
 * A single option button in a quiz question.
 * @param {{ optionKey: string, text: string, state: 'idle'|'selected'|'correct'|'wrong', onClick: () => void }} props
 */
export function OptionButton({ optionKey, text, state, onClick }) {
  const stateStyles = {
    idle: 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 active:scale-95',
    selected: 'bg-indigo-500 border-2 border-indigo-500 text-white shadow-lg shadow-indigo-200',
    correct: 'bg-emerald-500 border-2 border-emerald-500 text-white shadow-lg shadow-emerald-200',
    wrong: 'bg-rose-500 border-2 border-rose-500 text-white shadow-lg shadow-rose-200',
  }

  return (
    <button
      onClick={onClick}
      disabled={state !== 'idle'}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left font-semibold transition-all ${stateStyles[state]}`}
    >
      <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold uppercase">
        {optionKey}
      </span>
      <span className="text-base leading-snug">{text}</span>
    </button>
  )
}
