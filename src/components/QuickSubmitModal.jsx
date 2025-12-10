import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { addDevice } from '../firebase/services'

function QuickSubmitModal({ isOpen, onClose, initialLatitude, initialLongitude, onSuccess }) {
  const { currentUser, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    type: 'flock',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) {
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      setError('Please wait while we initialize...')
      return
    }
    
    // Validate coordinates
    const lat = parseFloat(initialLatitude)
    const lng = parseFloat(initialLongitude)
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('Invalid coordinates. Please try again.')
      return
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Coordinates out of valid range.')
      return
    }
    
    setSubmitting(true)
    setError('')

    try {
      const deviceData = {
        type: formData.type,
        latitude: lat,
        longitude: lng,
        address: null, // Explicitly set to null to match normal form
        description: formData.description || null,
      }

      await addDevice(deviceData, currentUser)
      
      // Reset form
      setFormData({
        type: 'flock',
        description: '',
      })
      
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Submission error details:', {
          error: err,
          message: err.message,
          code: err.code,
          user: currentUser?.uid,
          deviceData: {
            type: formData.type,
            latitude: lat,
            longitude: lng
          }
        })
      }
      setError(`Failed to submit device: ${err.message || 'Please try again.'}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Submit Device</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Location: {initialLatitude.toFixed(6)}, {initialLongitude.toFixed(6)}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Device Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="flock">Flock Camera</option>
                <option value="license_plate_reader">License Plate Reader</option>
                <option value="traffic_camera">Traffic Camera</option>
                <option value="security_camera">Security Camera</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Additional details about the device..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || authLoading || !currentUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Initializing...' : submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default QuickSubmitModal

