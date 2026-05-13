import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { TopicPage } from './pages/TopicPage'
import { QuizPage } from './pages/QuizPage'
import { HistoryPage } from './pages/HistoryPage'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (user === undefined) {
    // Still loading auth state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-lg animate-pulse">Cargando...</p>
      </div>
    )
  }
  if (user === null) return <Navigate to="/login" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { user } = useAuth()
  if (user === undefined) return null
  if (user !== null) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subject/:subject/:topic"
            element={
              <ProtectedRoute>
                <TopicPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
