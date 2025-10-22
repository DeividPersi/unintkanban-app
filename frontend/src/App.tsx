import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Login from './pages/Login'
import Register from './pages/Register'
import BoardPage from './pages/BoardPage'
import Dashboard from './pages/Dashboard'

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  console.log('App render:', { isAuthenticated, isLoading, path: window.location.pathname })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/board/:id" 
              element={isAuthenticated ? <BoardPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
            />
          </Routes>
        </div>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App
