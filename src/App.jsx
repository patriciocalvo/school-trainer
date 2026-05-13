import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { TopicPage } from './pages/TopicPage'
import { QuizPage } from './pages/QuizPage'
import { HistoryPage } from './pages/HistoryPage'
import { TeacherDashboardPage } from './pages/teacher/TeacherDashboardPage'
import { TeacherQuizListPage } from './pages/teacher/TeacherQuizListPage'
import { TeacherQuizFormPage } from './pages/teacher/TeacherQuizFormPage'
import { TeacherProgressPage } from './pages/teacher/TeacherProgressPage'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (user === undefined) {
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

function TeacherRoute({ children }) {
  const { user, role } = useAuth()
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-lg animate-pulse">Cargando...</p>
      </div>
    )
  }
  if (user === null) return <Navigate to="/login" replace />
  if (role !== 'teacher') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/subject/:subject/:topic" element={<ProtectedRoute><TopicPage /></ProtectedRoute>} />
          <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/teacher" element={<TeacherRoute><TeacherDashboardPage /></TeacherRoute>} />
          <Route path="/teacher/quizzes" element={<TeacherRoute><TeacherQuizListPage /></TeacherRoute>} />
          <Route path="/teacher/quizzes/new" element={<TeacherRoute><TeacherQuizFormPage /></TeacherRoute>} />
          <Route path="/teacher/quizzes/:id/edit" element={<TeacherRoute><TeacherQuizFormPage /></TeacherRoute>} />
          <Route path="/teacher/progress" element={<TeacherRoute><TeacherProgressPage /></TeacherRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
