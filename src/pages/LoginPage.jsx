import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    const { error: authError } = isRegister
      ? await signUp(email, password)
      : await signIn(email, password)

    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else if (isRegister) {
      setSuccessMsg('¡Cuenta creada! Revisá tu email para confirmar.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-indigo-50 to-slate-50">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <div className="text-6xl mb-3">🎓</div>
          <h1 className="text-3xl font-extrabold text-slate-800">School Trainer</h1>
          <p className="text-slate-500 mt-1">¡Aprendé jugando!</p>
        </div>

        <Card>
          <h2 className="text-xl font-bold text-slate-700 mb-6">
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-400 transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-400 transition-colors"
                placeholder="••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-2">{error}</p>
            )}
            {successMsg && (
              <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-2">{successMsg}</p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Cargando...' : isRegister ? 'Registrarme' : 'Entrar'}
            </Button>
          </form>

          <button
            onClick={() => { setIsRegister(!isRegister); setError(null); setSuccessMsg(null) }}
            className="mt-4 w-full text-center text-sm text-indigo-500 font-semibold hover:underline"
          >
            {isRegister ? '¿Ya tenés cuenta? Iniciá sesión' : '¿No tenés cuenta? Registrate'}
          </button>
        </Card>
      </div>
    </div>
  )
}
