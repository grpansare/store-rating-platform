import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { LogOut, User, Settings, Menu, X } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'System Administrator'
      case 'user':
        return 'User'
      case 'store_owner':
        return 'Store Owner'
      default:
        return role
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-900">Store Rating System</h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role)}</p>
              </div>
            </div>
            
            <div className="relative">
              <button
                className="flex items-center p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User size={20} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{getRoleDisplayName(user?.role)}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-base font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{getRoleDisplayName(user?.role)}</p>
          </div>
          <div className="py-1">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
