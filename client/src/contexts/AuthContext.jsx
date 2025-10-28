import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Set up axios interceptor for auth token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    // Add response interceptor to handle token expiration
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout()
          toast.error('Session expired. Please login again.')
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [])

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await axios.get('/auth/verify')
        setUser(response.data.user)
      } catch (error) {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post(
      "/auth/login",
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
      const { token, user } = response.data

      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)

      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)

      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/auth/password', { currentPassword, newPassword })
      toast.success('Password updated successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Password update failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
