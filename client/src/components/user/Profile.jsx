import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { User, Mail, MapPin, Lock, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updatePassword } = useAuth()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validatePasswordForm = () => {
    const newErrors = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/
    if (!passwordRegex.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must be 8-16 characters with at least one uppercase letter and one special character'
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) return

    setLoading(true)
    try {
      const result = await updatePassword(passwordData.currentPassword, passwordData.newPassword)
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setShowPasswordForm(false)
      }
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <h3>Account Information</h3>
          <div className="profile-info">
            <div className="info-item">
              <div className="info-icon">
                <User size={20} />
              </div>
              <div className="info-content">
                <label>Full Name</label>
                <span>{user?.name}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                user?.role === 'store_owner' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {getRoleDisplayName(user?.role)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Member Since</label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : 
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  }
                </button>
              </div>
              {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter new password (8-16 chars)"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : 
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  }
                </button>
              </div>
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : 
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  }
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
