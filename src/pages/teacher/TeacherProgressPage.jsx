import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function TeacherProgressPage() {
  const navigate = useNavigate()
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterSubject, setFilterSubject] = useState('')
  const [filterStudent, setFilterStudent] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('quiz_attempts')
          .select(`
            id,
            quiz_id,
            subject,
            topic,
            score,
            total_questions,
            completed_at,
            profiles!inner(display_name, email)
          `)
          .order('completed_at', { ascending: false })
          .limit(500)
        if (error) throw error
        setAttempts(data ?? [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Compute best score per student+quiz for summary
  const bestMap = {}
  for (const a of attempts) {
    const key = `${a.profiles.email}__${a.quiz_id}`
    if (!bestMap[key] || a.score > bestMap[key].score) {
      bestMap[key] = a
    }
  }

  const subjects = [...new Set(attempts.map((a) => a.subject))].sort()
  const students = [...new Set(attempts.map((a) => a.profiles.email))].sort()

  const filtered = attempts.filter((a) => {
    if (filterSubject && a.subject !== filterSubject) return false
    if (filterStudent && a.profiles.email !== filterStudent) return false
    return true
  })

  function pctClass(score, total) {
    const pct = (score / total) * 100
    if (pct >= 80) return 'text-emerald-600 font-extrabold'
    if (pct >= 50) return 'text-amber-600 font-bold'
    return 'text-rose-500 font-bold'
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/teacher')} className="text-slate-400 hover:text-slate-600 text-xl">
          ←
        </button>
        <h1 className="text-xl font-extrabold text-slate-800">📊 Progreso de Alumnos</h1>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-4 max-w-4xl mx-auto w-full">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="">Todas las materias</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400"
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
          >
            <option value="">Todos los alumnos</option>
            {students.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {(filterSubject || filterStudent) && (
            <button
              onClick={() => { setFilterSubject(''); setFilterStudent('') }}
              className="text-sm text-slate-400 hover:text-slate-600 font-semibold"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-slate-400 animate-pulse">Cargando intentos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-500">No hay intentos todavía.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400">{filtered.length} intento{filtered.length !== 1 ? 's' : ''}</p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Alumno</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Quiz</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Materia</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Puntaje</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {a.profiles.display_name || a.profiles.email}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{a.quiz_id}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {a.subject} · {a.topic}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={pctClass(a.score, a.total_questions)}>
                          {a.score}/{a.total_questions}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(a.completed_at).toLocaleDateString('es-AR', {
                          day: '2-digit', month: '2-digit', year: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
