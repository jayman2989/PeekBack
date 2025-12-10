import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { addDevice, geocodeAddress } from '../firebase/services'
import MapPicker from '../components/MapPicker'
import SearchAutocomplete from '../components/SearchAutocomplete'

function Submit() {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState({
    type: 'flock',
    latitude: '',
    longitude: '',
    address: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [addressSearchQuery, setAddressSearchQuery] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLocationChange = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
      // Clear address search query when manually setting location
      // (user might want to set a different address)
    }))
    // Clear address search query when location is manually set
    if (addressSearchQuery) {
      setAddressSearchQuery('')
    }
  }

  const handleAddressSelect = (suggestion) => {
    // Update address field and coordinates
    setFormData(prev => ({
      ...prev,
      address: suggestion.displayName,
      latitude: suggestion.latitude.toString(),
      longitude: suggestion.longitude.toString(),
    }))
    setAddressSearchQuery(suggestion.displayName)
  }

  const handleAddressSearch = async (e) => {
    e.preventDefault()
    if (!addressSearchQuery.trim()) return

    setSearchingAddress(true)
    try {
      const result = await geocodeAddress(addressSearchQuery)
      setFormData(prev => ({
        ...prev,
        address: result.displayName,
        latitude: result.latitude.toString(),
        longitude: result.longitude.toString(),
      }))
      setAddressSearchQuery(result.displayName)
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Address not found. Please try a different search term or click on the map to set location.'
      })
      console.error('Address search error:', error)
    } finally {
      setSearchingAddress(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      const deviceData = {
        type: formData.type,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        address: formData.address || null,
        description: formData.description || null,
      }

      await addDevice(deviceData, currentUser)
      
      setMessage({ 
        type: 'success', 
        text: 'Device submitted successfully! Thank you for contributing.' 
      })
      
      // Reset form
      setFormData({
        type: 'flock',
        latitude: '',
        longitude: '',
        address: '',
        description: '',
      })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to submit device. Please try again.' 
      })
      console.error('Submission error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Submit a Device</h1>
      <p className="text-sm sm:text-base text-gray-600 mb-4">
        Help build the database by reporting surveillance devices you've spotted.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 sm:mb-8">
        <p className="text-xs sm:text-sm text-gray-700">
          <strong>🔒 Privacy:</strong> Your location is never tracked or stored. Only the device coordinates you choose to submit are saved. 
          <Link to="/privacy" className="text-green-700 hover:text-green-900 underline ml-1">Learn more</Link>
        </p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="mb-6">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          
          {/* Address Search */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <SearchAutocomplete
                value={addressSearchQuery}
                onChange={setAddressSearchQuery}
                onSelect={handleAddressSelect}
                onSearch={handleAddressSearch}
                searching={searchingAddress}
              />
              <button
                type="button"
                onClick={handleAddressSearch}
                disabled={searchingAddress || !addressSearchQuery.trim()}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {searchingAddress ? 'Searching...' : 'Search'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Search for an address to automatically set the location, or click on the map below
            </p>
          </div>

          {/* Map Picker */}
          <MapPicker
            latitude={formData.latitude ? parseFloat(formData.latitude) : null}
            longitude={formData.longitude ? parseFloat(formData.longitude) : null}
            onLocationChange={handleLocationChange}
            onGetCurrentLocation={setGettingLocation}
          />
          <p className="mt-2 text-xs text-gray-500">
            Coordinates are automatically filled when you search an address or select a location on the map
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
              Latitude *
            </label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              step="any"
              required
              placeholder="40.7128"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
              Longitude *
            </label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              step="any"
              required
              placeholder="-74.0060"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address (Optional)
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main St, City, State"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            rows="4"
            placeholder="Additional details about the device..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || gettingLocation}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : gettingLocation ? 'Getting location...' : 'Submit Device'}
        </button>
      </form>
    </div>
  )
}

export default Submit

