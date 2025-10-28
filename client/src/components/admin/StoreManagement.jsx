import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Search, Edit, Trash2, Eye, ArrowUpDown, Star } from 'lucide-react'

const StoreManagement = () => {
  return (
    <Routes>
      <Route index element={<StoreList />} />
      <Route path="new" element={<StoreForm />} />
      <Route path="edit/:id" element={<StoreForm />} />
      <Route path="view/:id" element={<StoreDetails />} />
    </Routes>
  )
}

const StoreList = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'name',
    sortOrder: 'ASC',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    fetchStores()
  }, [filters])

  const fetchStores = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(filters)
      const response = await axios.get(`/stores?${params}`)
      setStores(response.data.stores)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Error fetching stores')
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

  const handleDelete = async (storeId) => {
    if (!window.confirm('Are you sure you want to delete this store?')) return

    try {
      await axios.delete(`/stores/${storeId}`)
      toast.success('Store deleted successfully')
      fetchStores()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error deleting store')
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={16} className="star filled" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} size={16} className="star half" />)
      } else {
        stars.push(<Star key={i} size={16} className="star empty" />)
      }
    }
    return stars
  }

  return (
    <div className="store-management" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="header-content">
          <h1 style={{ fontSize: '24px', margin: '0 0 5px 0' }}>Store Management</h1>
          <p style={{ margin: '0', color: '#666' }}>Manage all stores in the system</p>
        </div>
        <Link to="/admin/stores/new" className="btn btn-primary" style={{ 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          padding: '8px 16px', 
          borderRadius: '4px',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <Plus size={20} />
          Add New Store
        </Link>
      </div>

      <div className="filters-section" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div className="search-box" style={{ position: 'relative', width: '60%' }}>
          <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input
            type="text"
            placeholder="Search by name or address..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 10px 10px 40px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', e.target.value)}
            style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              backgroundColor: 'white',
              fontSize: '14px'
            }}
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', cursor: 'pointer' }} onClick={() => handleSort('name')} className="sortable">
                    Name <ArrowUpDown size={16} />
                  </th>
                  <th style={{ padding: '12px 8px', cursor: 'pointer' }} onClick={() => handleSort('email')} className="sortable">
                    Email <ArrowUpDown size={16} />
                  </th>
                  <th style={{ padding: '12px 8px', width: '30%' }}>Address</th>
                  <th style={{ padding: '12px 8px', cursor: 'pointer' }} onClick={() => handleSort('average_rating')} className="sortable">
                    Rating <ArrowUpDown size={16} />
                  </th>
                  <th style={{ padding: '12px 8px' }}>Total Ratings</th>
                  <th style={{ padding: '12px 8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 8px' }}>{store.name}</td>
                    <td style={{ padding: '12px 8px' }}>{store.email}</td>
                    <td style={{ padding: '12px 8px' }} className="address-cell">
                      {store.address ? store.address.substring(0, 50) + (store.address.length > 50 ? '...' : '') : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div className="rating-display" style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="stars" style={{ display: 'flex', marginRight: '5px' }}>
                          {renderStars(store.average_rating)}
                        </div>
                        <span className="rating-text">
                          {store.average_rating !== null && !isNaN(store.average_rating) ? Number(store.average_rating).toFixed(1) : '0.0'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>{store.total_ratings}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div className="action-buttons" style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => navigate(`/admin/stores/view/${store.id}`)}
                          className="btn btn-sm btn-secondary"
                          title="View Details"
                          style={{ padding: '5px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/stores/edit/${store.id}`)}
                          className="btn btn-sm btn-primary"
                          title="Edit Store"
                          style={{ padding: '5px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(store.id)}
                          className="btn btn-sm btn-danger"
                          title="Delete Store"
                          style={{ padding: '5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handleFilterChange('page', pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              
              <button
                onClick={() => handleFilterChange('page', pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const StoreForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  })
  const [storeOwners, setStoreOwners] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const isEdit = window.location.pathname.includes('/edit/')
  const storeId = isEdit ? window.location.pathname.split('/').pop() : null

  useEffect(() => {
    fetchStoreOwners()
    if (isEdit && storeId) {
      fetchStore()
    }
  }, [isEdit, storeId])

  const fetchStoreOwners = async () => {
    try {
      const response = await axios.get('/users?role=store_owner&limit=100')
      setStoreOwners(response.data.users)
    } catch (error) {
      console.error('Error fetching store owners:', error)
    }
  }

  const fetchStore = async () => {
    try {
      const response = await axios.get(`/stores/${storeId}`)
      const store = response.data.store
      setFormData({
        name: store.name,
        email: store.email,
        address: store.address,
        owner_id: store.owner_id || ''
      })
    } catch (error) {
      toast.error('Error fetching store details')
      navigate('/admin/stores')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Store name is required'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    } else if (formData.address.length > 400) {
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
      const submitData = {
        ...formData,
        owner_id: formData.owner_id || null
      }

      if (isEdit) {
        await axios.put(`/stores/${storeId}`, submitData)
        toast.success('Store updated successfully')
      } else {
        await axios.post('/stores', submitData)
        toast.success('Store created successfully')
      }
      
      navigate('/admin/stores')
    } catch (error) {
      toast.error(error.response?.data?.error || `Error ${isEdit ? 'updating' : 'creating'} store`)
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
    <div className="store-form" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', margin: '0' }}>{isEdit ? 'Edit Store' : 'Add New Store'}</h1>
        <Link to="/admin/stores" className="btn btn-secondary" style={{ 
          backgroundColor: '#f0f0f0', 
          color: '#333', 
          padding: '8px 16px', 
          borderRadius: '4px',
          textDecoration: 'none',
          border: '1px solid #ddd'
        }}>
          Back to Stores
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="form-container" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Store Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter store name"
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: errors.name ? '1px solid #ef4444' : '1px solid #ddd',
              fontSize: '14px'
            }}
          />
          {errors.name && <span className="error-message" style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.name}</span>}
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter store email"
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: errors.email ? '1px solid #ef4444' : '1px solid #ddd',
              fontSize: '14px'
            }}
          />
          {errors.email && <span className="error-message" style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.email}</span>}
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="address" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Address *</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter store address (max 400 characters)"
            rows="3"
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: errors.address ? '1px solid #ef4444' : '1px solid #ddd',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
          {errors.address && <span className="error-message" style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.address}</span>}
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="owner_id" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Store Owner (Optional)</label>
          <select
            id="owner_id"
            name="owner_id"
            value={formData.owner_id}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="">-- Select Store Owner --</option>
            {storeOwners.map(owner => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px', gap: '10px' }}>
          <button 
            type="button" 
            onClick={() => navigate('/admin/stores')}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              backgroundColor: '#f0f0f0',
              color: '#333',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '4px', 
              border: 'none',
              backgroundColor: '#3b82f6',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Store' : 'Create Store')}
          </button>
        </div>
      </form>
    </div>
  )
}

const StoreDetails = () => {
  const [store, setStore] = useState(null)
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const storeId = window.location.pathname.split('/').pop()

  useEffect(() => {
    fetchStoreDetails()
  }, [storeId])

  const fetchStoreDetails = async () => {
    try {
      const [storeResponse, ratingsResponse] = await Promise.all([
        axios.get(`/stores/${storeId}`),
        axios.get(`/stores/${storeId}/ratings`)
      ])
      
      setStore(storeResponse.data.store)
      setRatings(ratingsResponse.data.ratings)
    } catch (error) {
      toast.error('Error fetching store details')
      navigate('/admin/stores')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={16} 
          className={i <= rating ? 'star filled' : 'star empty'} 
        />
      )
    }
    return stars
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!store) {
    return <div>Store not found</div>
  }

  return (
    <div className="store-details">
      <div className="page-header">
        <h1>Store Details</h1>
        <div className="header-actions">
          <Link to={`/admin/stores/edit/${store.id}`} className="btn btn-primary">
            <Edit size={20} />
            Edit Store
          </Link>
          <Link to="/admin/stores" className="btn btn-secondary">
            Back to Stores
          </Link>
        </div>
      </div>

      <div className="details-container">
        <div className="details-card">
          <h3>Store Information</h3>
          <div className="details-grid">
            <div className="detail-item">
              <label>Name:</label>
              <span>{store.name}</span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span>{store.email}</span>
            </div>
            <div className="detail-item">
              <label>Address:</label>
              <span>{store.address}</span>
            </div>
            <div className="detail-item">
              <label>Average Rating:</label>
              <div className="rating-display">
                <div className="stars">
                  {renderStars(Math.round(store.average_rating))}
                </div>
                <span>{store.average_rating ? store.average_rating.toFixed(1) : '0.0'} / 5</span>
              </div>
            </div>
            <div className="detail-item">
              <label>Total Ratings:</label>
              <span>{store.total_ratings}</span>
            </div>
          </div>
        </div>

        {ratings.length > 0 && (
          <div className="details-card">
            <h3>Recent Ratings</h3>
            <div className="ratings-list">
              {ratings.slice(0, 10).map((rating) => (
                <div key={rating.id} className="rating-item">
                  <div className="rating-header">
                    <span className="user-name">{rating.user_name}</span>
                    <div className="rating-stars">
                      {renderStars(rating.rating)}
                    </div>
                  </div>
                  <div className="rating-date">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StoreManagement
