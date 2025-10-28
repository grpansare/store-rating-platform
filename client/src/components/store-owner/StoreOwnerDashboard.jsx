import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import axios from 'axios'
import { BarChart3, Star, Users, User } from 'lucide-react'
import StoreAnalytics from './StoreAnalytics'
import Profile from '../user/Profile'

const StoreOwnerDashboard = () => {
  const location = useLocation()

  const isActiveRoute = (path) => {
    return location.pathname.includes(path)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Store Owner Panel</h2>
        </div>
        <nav className="mt-6">
          <NavLink 
            to="/store-owner" 
            end 
            className={({ isActive }) => `flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              isActive 
                ? 'text-primary-600 bg-primary-50 border-r-2 border-primary-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BarChart3 size={20} className="mr-3" />
            Analytics
          </NavLink>
          <NavLink 
            to="/store-owner/profile" 
            className={({ isActive }) => `flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              isActive 
                ? 'text-primary-600 bg-primary-50 border-r-2 border-primary-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <User size={20} className="mr-3" />
            Profile
          </NavLink>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<StoreAnalytics />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  )
}

export default StoreOwnerDashboard
