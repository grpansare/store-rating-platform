import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import AdminDashboard from './components/admin/AdminDashboard'
import UserDashboard from './components/user/UserDashboard'
import StoreOwnerDashboard from './components/store-owner/StoreOwnerDashboard'
import Navbar from './components/layout/Navbar'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <>
      <Navbar />
      <Routes>
        {user.role === 'admin' && (
          <Route path="/admin/*" element={<AdminDashboard />} />
        )}
        {user.role === 'user' && (
          <Route path="/user/*" element={<UserDashboard />} />
        )}
        {user.role === 'store_owner' && (
          <Route path="/store-owner/*" element={<StoreOwnerDashboard />} />
        )}
        <Route 
          path="/" 
          element={
            <Navigate 
              to={
                user.role === 'admin' ? '/admin' :
                user.role === 'user' ? '/user' :
                '/store-owner'
              } 
              replace 
            />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                borderRadius: '8px',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
