import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Star, Trash2, Edit, X } from 'lucide-react'

const MyRatings = () => {
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingRating, setEditingRating] = useState(null)
  const [editData, setEditData] = useState({ rating: 0, comment: '' })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchMyRatings()
  }, [])

  // ✅ Fetch all user ratings
  const fetchMyRatings = async () => {
    try {
      const response = await axios.get('/ratings/my-ratings')
      setRatings(response.data.ratings)
    } catch (error) {
      toast.error('Error fetching your ratings')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Update rating for a store
  const handleUpdateRating = async (e) => {
    e.preventDefault()
    if (!editingRating) return
    setUpdating(true)

    try {
      await axios.post('/ratings', {
        store_id: editingRating.store_id,
        rating: editData.rating,
        comment: editData.comment,
      })
      toast.success('Rating updated successfully!')
      setEditingRating(null)
      fetchMyRatings()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error updating rating')
    } finally {
      setUpdating(false)
    }
  }

  // ✅ Delete rating
  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) return
    try {
      await axios.delete(`/ratings/${ratingId}`)
      toast.success('Rating deleted successfully!')
      fetchMyRatings()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error deleting rating')
    }
  }

  // ✅ When editing, load existing data
  const startEditing = (rating) => {
    setEditingRating(rating)
    setEditData({
      rating: rating.rating,
      comment: rating.comment || '',
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Ratings</h2>
        <p className="text-gray-600 mt-1">View and manage your store ratings</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your ratings...</p>
          </div>
        </div>
      ) : ratings.length === 0 ? (
        <div className="text-center py-12">
          <Star size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings yet</h3>
          <p className="text-gray-600">
            You haven't rated any stores yet. Start exploring stores to leave your first rating!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <div key={rating.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{rating.store_name}</h3>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${star <= rating.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{rating.rating}/5</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditing(rating)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors duration-200"
                    title="Edit Rating"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteRating(rating.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded transition-colors duration-200"
                    title="Delete Rating"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {rating.comment && (
                <div className="mb-4">
                  <p className="text-gray-700 italic">"{rating.comment}"</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Rated on {new Date(rating.created_at).toLocaleDateString()}</span>
                {rating.updated_at !== rating.created_at && (
                  <span className="text-blue-600">
                    Updated on {new Date(rating.updated_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Edit Rating Modal */}
      {editingRating && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={() => setEditingRating(null)}
        >
          <div
            className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Rating for {editingRating.store_name}
              </h3>
              <button
                onClick={() => setEditingRating(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateRating} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditData((prev) => ({ ...prev, rating: star }))}
                      className="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
                    >
                      <Star
                        size={24}
                        className={`${
                          star <= editData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Comment (Optional)
                </label>
                <textarea
                  id="edit-comment"
                  value={editData.comment}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  placeholder="Share your experience..."
                  rows="4"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingRating(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyRatings
