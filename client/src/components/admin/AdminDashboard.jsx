import { useState, useEffect } from 'react'
import { Routes, Route, Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import axios from 'axios'
import { Users, Store, Star, BarChart3, Plus, Search, Filter, TrendingUp } from 'lucide-react'
import UserManagement from './UserManagement'
import StoreManagement from './StoreManagement'
import DashboardHome from './DashboardHome'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    usersByRole: []
  })
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/users/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const isActiveRoute = (path) => {
    return location.pathname.includes(path)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          <NavLink 
            to="/admin" 
            end 
            className={({ isActive }) => `flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              isActive 
                ? 'text-primary-600 bg-primary-50 border-r-2 border-primary-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BarChart3 size={20} className="mr-3" />
            Dashboard
          </NavLink>
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              isActive 
                ? 'text-primary-600 bg-primary-50 border-r-2 border-primary-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Users size={20} className="mr-3" />
            User Management
          </NavLink>
          <NavLink 
            to="/admin/stores" 
            className={({ isActive }) => `flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              isActive 
                ? 'text-primary-600 bg-primary-50 border-r-2 border-primary-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Store size={20} className="mr-3" />
            Store Management
          </NavLink>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your platform</p>
        </div>

        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardHome stats={stats} />} />
            <Route path="/users/*" element={<UserManagement />} />
            <Route path="/stores/*" element={<StoreManagement />} />
          </Routes>

          <Routes>
            <Route index element={
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-blue-100">
                        <Users size={24} className="text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
                        <p className="text-sm text-gray-600">Total Users</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-green-100">
                        <Store size={24} className="text-green-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalStores}</h3>
                        <p className="text-sm text-gray-600">Total Stores</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-yellow-100">
                        <Star size={24} className="text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalRatings}</h3>
                        <p className="text-sm text-gray-600">Total Ratings</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-lg bg-purple-100">
                        <TrendingUp size={24} className="text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{stats.averageRating}</h3>
                        <p className="text-sm text-gray-600">Average Rating</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link 
                      to="/admin/users" 
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Users size={20} className="text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">Manage Users</span>
                    </Link>
                    <Link 
                      to="/admin/stores" 
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Store size={20} className="text-purple-600 mr-3" />
                      <span className="font-medium text-gray-900">Manage Stores</span>
                    </Link>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
