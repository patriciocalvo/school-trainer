import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { supabase } from '../../lib/supabase'

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899',
]

function pctClass(score, total) {
  const pct = (score / total) * 100
  if (pct >= 80) return 'text-emerald-600 font-extrabold'
  if (pct >= 50) return 'text-amber-600 font-bold'
  return 'text-rose-500 font-bold'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

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
        const [attemptsRes, profilesRes] = await Promise.all([
          supabase
            .from('quiz_attempts')
            .select('id, user_id, quiz_id, subject, topic, score, total_questions, completed_at')
            .order('completed_at', { ascending: true })
            .limit(500),
          supabase
            .from('profiles')
            .select('user_id, display_name, email'),
        ])
        if (attemptsRes.error) throw attemptsRes.error
        if (profilesRes.error) throw profilesRes.error

        const profileMap = {}
        for (const p of profilesRes.data ?? []) profileMap[p.user_id] = p

        const merged = (attemptsRes.data ?? []).map((a) => ({
          ...a,
          profiles: profileMap[a.user_id] ?? { display_name: null, email: null },
        }))
        setAttempts(merged)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function studentLabel(a) {
    return a.profiles.email || a.profiles.display_name || `${a.user_id.slice(0, 8)}…`
  }

  const subjects = useMemo(() => [...new Set(attempts.map((a) => a.subject))].sort(), [attempts])

  const students = useMemo(() => {
    const seen = new Set()
    return attempts.filter((a) => {
      if (seen.has(a.user_id)) return false
      seen.add(a.user_id); return true
    }).sort((a, b) => studentLabel(a).localeCompare(studentLabel(b)))
  }, [attempts])

  const filtered = useMemo(() =>
    [...attempts]
      .sort((a, b) => b.completed_at.localeCompare(a.completed_at))
      .filter((a) => {
        if (filterSubject && a.subject !== filterSubject) return false
        if (filterStudent && a.user_id !== filterStudent) return false
        return true
      }),
  [attempts, filterSubject, filterStudent])

  // Chart: one series per quiz, X=attempt order, Y=score%
  const chartOption = useMemo(() => {
    const data = attempts.filter((a) => {
      if (filterSubject && a.subject !== filterSubject) return false
      if (filterStudent && a.user_id !== filterStudent) return false
      return true
    })

    const quizIds = [...new Set(data.map((a) => a.quiz_id))].sort()

    const series = quizIds.map((qid, i) => ({
      name: qid,
      type: 'line',
      smooth: true,
      symbolSize: 8,
      color: COLORS[i % COLORS.length],
      data: data
        .filter((a) => a.quiz_id === qid)
        .map((a) => ({
          value: [a.completed_at, Math.round((a.score / a.total_questions) * 100)],
          student: studentLabel(a),
          raw: `${a.score}/${a.total_questions}`,
        })),
    }))

    return {
      backgroundColor: 'transparent',
      grid: { top: 16, right: 16, bottom: 64, left: 48, containLabel: true },
      tooltip: {
        trigger: 'item',
        formatter: (p) =>
          `<b>${p.seriesName}</b><br/>${p.data.student}<br/>${formatDate(p.data.value[0])}<br/><b>${p.data.value[1]}% (${p.data.raw})</b>`,
      },
      legend: { bottom: 0, type: 'scroll', textStyle: { fontSize: 11 } },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (val) => new Date(val).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
          rotate: 30,
          fontSize: 10,
        },
      },
      yAxis: {
        type: 'value', min: 0, max: 100,
        axisLabel: { formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      series,
    }
  }, [attempts, filterSubject, filterStudent])

  const hasChartData = chartOption.series?.some((s) => s.data.length > 0)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/teacher')} className="text-slate-400 hover:text-slate-600 text-xl">←</button>
        <h1 className="text-xl font-extrabold text-slate-800">📊 Progreso de Alumnos</h1>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-5 max-w-4xl mx-auto w-full">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        <div className="flex gap-3 flex-wrap items-center">
          <select
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400"
            value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="">Todas las materias</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400"
            value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)}
          >
            <option value="">Todos los alumnos</option>
            {students.map((a) => <option key={a.user_id} value={a.user_id}>{studentLabel(a)}</option>)}
          </select>

          {(filterSubject || filterStudent) && (
            <button onClick={() => { setFilterSubject(''); setFilterStudent('') }}
              className="text-sm text-slate-400 hover:text-slate-600 font-semibold">
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-slate-400 animate-pulse">Cargando...</p>
          </div>
        ) : attempts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-500">No hay intentos todavía.</p>
          </div>
        ) : (
          <>
            {hasChartData && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Evolución de puntajes</h2>
                <ReactECharts option={chartOption} style={{ height: 280 }} opts={{ renderer: 'svg' }} />
              </div>
            )}

            <div>
              <p className="text-xs text-slate-400 mb-2">{filtered.length} intento{filtered.length !== 1 ? 's' : ''}</p>
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
                        <td className="px-4 py-3 text-slate-700 font-medium">{studentLabel(a)}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{a.quiz_id}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{a.subject} · {a.topic}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={pctClass(a.score, a.total_questions)}>{a.score}/{a.total_questions}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDate(a.completed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
