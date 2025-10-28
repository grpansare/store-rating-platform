import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Star, Users, TrendingUp, Calendar } from 'lucide-react'

const StoreAnalytics = () => {
  const { user } = useAuth()
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOwnerStores()
  }, [])

  useEffect(() => {
    if (selectedStore) {
      fetchStoreAnalytics(selectedStore.id)
    }
  }, [selectedStore])

  const fetchOwnerStores = async () => {
    try {
      // Get all stores and filter by owner
      const response = await axios.get('/stores?limit=100')
      const ownerStores = response.data.stores.filter(store => store.owner_id === user.id)
      setStores(ownerStores)
      
      if (ownerStores.length > 0) {
        setSelectedStore(ownerStores[0])
      }
    } catch (error) {
      toast.error('Error fetching your stores')
    } finally {
      setLoading(false)
    }
  }

  const fetchStoreAnalytics = async (storeId) => {
    try {
      const response = await axios.get(`/stores/${storeId}/ratings`)
      setAnalytics(response.data)
    } catch (error) {
      toast.error('Error fetching store analytics')
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

  const getRatingDistribution = () => {
    if (!analytics?.ratings) return []
    
    const distribution = [0, 0, 0, 0, 0]
    analytics.ratings.forEach(rating => {
      distribution[rating.rating - 1]++
    })
    
    return distribution.map((count, index) => ({
      rating: index + 1,
      count,
      percentage: analytics.ratings.length > 0 ? (count / analytics.ratings.length * 100).toFixed(1) : 0
    }))
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your stores...</p>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="empty-state">
        <Star size={48} />
        <h3>No stores assigned</h3>
        <p>You don't have any stores assigned to your account yet.</p>
        <p>Contact an administrator to assign stores to your account.</p>
      </div>
    )
  }

  return (
    <div className="store-analytics">
      <div className="page-header">
        <h1>Store Analytics</h1>
        <p>View ratings and analytics for your stores</p>
      </div>

      {stores.length > 1 && (
        <div className="mb-6">
          <label htmlFor="store-select" className="block text-sm font-medium text-gray-700 mb-2">Select Store:</label>
          <select
            id="store-select"
            value={selectedStore?.id || ''}
            onChange={(e) => {
              const store = stores.find(s => s.id === parseInt(e.target.value))
              setSelectedStore(store)
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>
      )}

      {!selectedStore ? (
        <div className="text-center py-12">
          <Store size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No store found</h3>
          <p className="text-gray-600">You don't have a store associated with your account.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <Star size={24} className="text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{analytics.statistics.average_rating.toFixed(1)}</h3>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users size={24} className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{analytics.statistics.total_ratings}</h3>
                  <p className="text-sm text-gray-600">Total Ratings</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {getRatingDistribution().length > 0 ? Math.max(...getRatingDistribution().map(r => r.count)) : 0}
                  </h3>
                  <p className="text-sm text-gray-600">Most Common Rating</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {getRatingDistribution().map(item => (
                  <div key={item.rating} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} size={12} className="text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{item.rating} star{item.rating !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center space-x-2 flex-1 ml-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${(item.count / Math.max(...getRatingDistribution().map(r => r.count))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Ratings</h3>
              {analytics.ratings.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {analytics.ratings.slice(0, 10).map(rating => (
                    <div key={rating.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-gray-900">{rating.user_name}</span>
                          <div className="flex items-center mt-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                size={14}
                                className={`${star <= rating.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-600">{rating.rating}/5</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {analytics.ratings.length > 10 && (
                    <div className="more-ratings">
                      <p>And {analytics.ratings.length - 10} more ratings...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No ratings yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoreAnalytics
