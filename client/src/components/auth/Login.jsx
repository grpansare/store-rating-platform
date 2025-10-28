import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(formData.email, formData.password)
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Rating System</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Sign In</h2>
            <p className="text-gray-600">Welcome back! Please sign in to your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : 
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4 text-center">Demo Credentials:</h3>
            <div className="grid grid-cols-1 gap-4 text-xs">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="font-medium text-red-800 mb-1">Admin:</div>
                <div className="text-red-700">admin@storerating.com</div>
                <div className="text-red-700">Admin@123</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="font-medium text-blue-800 mb-1">User:</div>
                <div className="text-blue-700">john@example.com</div>
                <div className="text-blue-700">password</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="font-medium text-green-800 mb-1">Store Owner:</div>
                <div className="text-green-700">mike@storeowner.com</div>
                <div className="text-green-700">password</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
