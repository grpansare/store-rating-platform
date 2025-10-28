import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Search, Star, X, MapPin, Phone } from 'lucide-react'

const StoreList = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
   const [selectedStore, setSelectedStore] = useState(null)
 const [ratingData, setRatingData] = useState({ rating: 0, comment: '' })
 const [submitting, setSubmitting] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'name',
    sortOrder: 'ASC',
    page: 1,
    limit: 12
  })
  const [pagination, setPagination] = useState({})

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

  const submitRating = async (storeId, rating) => {
    try {
      await axios.post('/ratings', { store_id: storeId, rating })
      toast.success('Rating submitted successfully!')
      fetchStores() // Refresh to show updated rating
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error submitting rating')
    }
  }

  const handleSubmitRating = async (e) => {
    e.preventDefault()
    if (ratingData.rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmitting(true)
    try {
      await axios.post('/ratings', {
        store_id: selectedStore.id,
        rating: ratingData.rating
      })
      toast.success('Rating submitted successfully!')
      setSelectedStore(null)
      setRatingData({ rating: 0, comment: '' })
      fetchStores() // Refresh to show updated rating
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error submitting rating')
    } finally {
      setSubmitting(false)
    }
  }

  const openRatingModal = (store) => {
    setSelectedStore(store)
    setRatingData({ rating: store.user_rating || 0, comment: '' })
  }

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={20}
          className={`star ${i <= rating ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => onStarClick(i) : undefined}
        />
      )
    }
    return stars
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Browse Stores</h2>
        <p className="text-gray-600 mt-1">Discover and rate amazing stores</p>
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
                placeholder="Search stores..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="flex gap-3">
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
                <option value="average_rating-DESC">Highest Rated</option>
                <option value="average_rating-ASC">Lowest Rated</option>
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
            <p className="mt-2 text-gray-600">Loading stores...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map(store => (
              <div key={store.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={16}
                          className={`${star <= Math.round(store.average_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">

                      {store.average_rating && !isNaN(store.average_rating)
  ? Number(store.average_rating).toFixed(1)
  : 'No ratings'}

                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-600 text-sm">{store.description}</p>
                  <p className="text-gray-500 text-sm flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {store.address}
                  </p>
                  <p className="text-gray-500 text-sm flex items-center">
                    <Phone size={14} className="mr-1" />
                    {store.contact_info}
                  </p>
                </div>

                <button
                  onClick={() => openRatingModal(store)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  <Star size={16} className="mr-2" />
                  {store.user_rating ? 'Update Rating' : 'Rate Store'}
                </button>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
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

      {selectedStore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setSelectedStore(null)}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Rate {selectedStore.name}</h3>
              <button onClick={() => setSelectedStore(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingData(prev => ({ ...prev, rating: star }))}
                      className="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
                    >
                      <Star
                        size={24}
                        className={`${star <= ratingData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
                <textarea
                  id="comment"
                  value={ratingData.comment}
                  onChange={(e) => setRatingData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience..."
                  rows="4"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setSelectedStore(null)} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200" 
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoreList
