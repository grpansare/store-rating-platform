import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Search, Filter, Edit, Trash2, Eye, ArrowUpDown } from 'lucide-react'

const UserManagement = () => {
  return (
    <Routes>
      <Route path="/" element={<UserList />} />
      <Route path="/new" element={<UserForm />} />
      <Route path="/edit/:id" element={<UserForm />} />
      <Route path="/view/:id" element={<UserDetails />} />
    </Routes>
  )
}

const UserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    sortBy: 'name',
    sortOrder: 'ASC',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(filters)
      const response = await axios.get(`/users?${params}`)
      setUsers(response.data.users)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Error fetching users')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }))
  }

  const handleSort = (field) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: newOrder
    }))
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      await axios.delete(`/users/${userId}`)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error deleting user')
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'role-admin'
      case 'user': return 'role-user'
      case 'store_owner': return 'role-store-owner'
      default: return ''
    }
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Admin'
      case 'user': return 'User'
      case 'store_owner': return 'Store Owner'
      default: return ''
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <Link 
          to="/admin/users/new" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        >
          <Plus size={20} className="mr-2" />
          Add New User
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>

              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  handleFilterChange('sortBy', sortBy)
                  handleFilterChange('sortOrder', sortOrder)
                }}
              >
                <option value="name-ASC">Name A-Z</option>
                <option value="name-DESC">Name Z-A</option>
                <option value="email-ASC">Email A-Z</option>
                <option value="email-DESC">Email Z-A</option>
                <option value="created_at-DESC">Newest First</option>
                <option value="created_at-ASC">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'store_owner' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/admin/users/view/${user.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors duration-200"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors duration-200"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors duration-200"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {filters.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  disabled={filters.page === pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    
  )
}

const UserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const isEdit = window.location.pathname.includes('/edit/')
  const userId = isEdit ? window.location.pathname.split('/').pop() : null

  useEffect(() => {
    if (isEdit && userId) {
      fetchUser()
    }
  }, [isEdit, userId])

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/users/${userId}`)
      const user = response.data.user
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        address: user.address || '',
        role: user.role
      })
    } catch (error) {
      toast.error('Error fetching user details')
      navigate('/admin/users')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (formData.name.length < 20 || formData.name.length > 60) {
      newErrors.name = 'Name must be between 20 and 60 characters'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!isEdit || formData.password) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must be 8-16 characters with at least one uppercase letter and one special character'
      }
    }

    if (formData.address.length > 400) {
      newErrors.address = 'Address must not exceed 400 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const submitData = { ...formData }
      if (isEdit && !submitData.password) {
        delete submitData.password
      }

      if (isEdit) {
        await axios.put(`/users/${userId}`, submitData)
        toast.success('User updated successfully')
      } else {
        await axios.post('/users', submitData)
        toast.success('User created successfully')
      }
      
      navigate('/admin/users')
    } catch (error) {
      toast.error(error.response?.data?.error || `Error ${isEdit ? 'updating' : 'creating'} user`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                {isEdit ? 'Edit User' : 'Create New User'}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {isEdit ? 'Update user information and permissions' : 'Add a new user to the system'}
              </p>
            </div>
            <Link 
              to="/admin/users" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              ← Back to Users
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">User Information</h2>
            <p className="text-sm text-gray-600 mt-1">Please fill in the required information below</p>
          </div>
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name (20-60 characters)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password {isEdit ? '(leave blank to keep current)' : '*'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8-16 chars, uppercase & special character"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required={!isEdit}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address (optional, max 400 characters)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="user">Normal User</option>
              <option value="store_owner">Store Owner</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update User' : 'Create User')}
          </button>
        </div>
      </form>
    </div>
  </div>
  </div>
  )
}

const UserDetails = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const userId = window.location.pathname.split('/').pop()

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/users/${userId}`)
      setUser(response.data.user)
    } catch (error) {
      toast.error('Error fetching user details')
      navigate('/admin/users')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div className="user-details">
      <div className="page-header">
        <h1>User Details</h1>
        <div className="header-actions">
          <Link to={`/admin/users/edit/${user.id}`} className="btn btn-primary">
            <Edit size={20} />
            Edit User
          </Link>
          <Link to="/admin/users" className="btn btn-secondary">
            Back to Users
          </Link>
        </div>
      </div>

      <div className="details-container">
        <div className="details-card">
          <h3>Basic Information</h3>
          <div className="details-grid">
            <div className="detail-item">
              <label>Name:</label>
              <span>{user.name}</span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="detail-item">
              <label>Role:</label>
              <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : user.role === 'user' ? 'role-user' : 'role-store-owner'}`}>
                {user.role === 'admin' ? 'Administrator' :
                 user.role === 'user' ? 'User' :
                 'Store Owner'}
              </span>
            </div>
            <div className="detail-item">
              <label>Address:</label>
              <span>{user.address || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <label>Created:</label>
              <span>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            {user.role === 'store_owner' && user.average_rating && (
              <div className="detail-item">
                <label>Average Store Rating:</label>
                <span>{user.average_rating.toFixed(1)} / 5</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagement
