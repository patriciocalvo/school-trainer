/**
 * @param {{ value: number, max: number, label?: string }} props
 * value and max are counts (e.g. 3 out of 10)
 */
export function ProgressBar({ value, max, label }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="w-full">
      {label && (
        <p className="text-sm text-slate-500 mb-1 text-right">{label}</p>
      )}
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
