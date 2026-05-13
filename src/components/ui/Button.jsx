export function Button({ children, onClick, disabled, variant = 'primary', className = '' }) {
  const base = 'w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-indigo-500 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-600',
    secondary: 'bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400',
    danger: 'bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600',
    ghost: 'bg-transparent text-slate-500 hover:text-slate-700',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
