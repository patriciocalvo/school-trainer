import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function TeacherDashboardPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">👩‍🏫 Panel Docente</h1>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-400 hover:text-slate-600 font-semibold"
          >
            Vista alumno
          </button>
          <button
            onClick={signOut}
            className="text-sm text-slate-400 hover:text-slate-600 font-semibold"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-4 max-w-lg mx-auto w-full">
        <div className="mb-2">
          <h2 className="text-2xl font-extrabold text-slate-800">¿Qué querés hacer?</h2>
        </div>

        <button
          onClick={() => navigate('/teacher/quizzes')}
          className="w-full bg-gradient-to-br from-indigo-400 to-violet-500 rounded-3xl p-6 text-left text-white shadow-lg transition-all active:scale-95"
        >
          <div className="text-5xl mb-3">📝</div>
          <h3 className="text-2xl font-extrabold">Gestionar Quizzes</h3>
          <p className="text-white/80 text-sm mt-1">Crear, editar y borrar quizzes</p>
        </button>

        <button
          onClick={() => navigate('/teacher/progress')}
          className="w-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-6 text-left text-white shadow-lg transition-all active:scale-95"
        >
          <div className="text-5xl mb-3">📊</div>
          <h3 className="text-2xl font-extrabold">Progreso de Alumnos</h3>
          <p className="text-white/80 text-sm mt-1">Ver intentos y puntajes de todos los alumnos</p>
        </button>
      </main>
    </div>
  )
}
