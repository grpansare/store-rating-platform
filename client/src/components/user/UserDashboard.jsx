import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, Outlet, useLocation } from 'react-router-dom'
import axios from 'axios'
import { Store, Star, User, Settings } from 'lucide-react'
import StoreList from './StoreList'
import MyRatings from './MyRatings'
import Profile from './Profile'

const UserDashboard = () => {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">User Dashboard</h2>
        </div>
        <nav className="mt-6">
          <NavLink 
            to="/user" 
            end 
            className={({ isActive }) => `flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              isActive 
                ? 'text-violet-600 bg-violet-50 border-r-2 border-violet-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Store size={20} className="mr-3" />
            Browse Stores
          </NavLink>
          <NavLink 
            to="/user/ratings" 
            className={({ isActive }) => `flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              isActive 
                ? 'text-violet-600 bg-violet-50 border-r-2 border-violet-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Star size={20} className="mr-3" />
            My Ratings
          </NavLink>
          <NavLink 
            to="/user/profile" 
            className={({ isActive }) => `flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              isActive 
                ? 'text-violet-600 bg-violet-50 border-r-2 border-violet-600' 
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
          <Route index element={<StoreList />} />
          <Route path="ratings" element={<MyRatings />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  )
}

export default UserDashboard
