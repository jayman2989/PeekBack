import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { subscribeToDevices, geocodeAddress } from '../firebase/services'
import { deviceIcons } from '../utils/mapIcons'
import DevicePopup from '../components/DevicePopup'
import SearchAutocomplete from '../components/SearchAutocomplete'
import QuickSubmitModal from '../components/QuickSubmitModal'
import { useAuth } from '../hooks/useAuth'

// Fix for default marker icons in React-Leaflet (for user location)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Component to fit map bounds to show all markers
function FitBounds({ devices }) {
  const map = useMap()
  
  useEffect(() => {
    if (devices.length > 0) {
      const bounds = L.latLngBounds(
        devices.map(device => [device.latitude, device.longitude])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [devices, map])
  
  return null
}

// Component to center map on a specific location
function CenterOnLocation({ location, zoom }) {
  const map = useMap()
  
  useEffect(() => {
    if (location) {
      map.setView(location, zoom || 15)
    }
  }, [location, zoom, map])
  
  return null
}

// Component to handle map clicks for submitting devices
function MapClickHandler({ onSubmitClick, submitMode }) {
  useMapEvents({
    click: (e) => {
      if (submitMode) {
        const { lat, lng } = e.latlng
        onSubmitClick(lat, lng)
      }
    },
  })
  return null
}

function Map() {
  const { currentUser, loading: authLoading } = useAuth()
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTypes, setSelectedTypes] = useState(new Set(['flock', 'license_plate_reader', 'traffic_camera', 'security_camera', 'other']))
  const [userLocation, setUserLocation] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState(null)
  const [submitMode, setSubmitMode] = useState(false)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [submitLocation, setSubmitLocation] = useState(null)

  // Subscribe to real-time device updates - wait for auth AND App Check to be ready
  useEffect(() => {
    // Don't subscribe until auth and App Check are both ready
    if (authLoading) {
      return
    }

    let unsubscribe = null;

    // Delay to ensure App Check token is attached to requests
    const timer = setTimeout(() => {
      unsubscribe = subscribeToDevices(
        (deviceList) => {
          // Filter out devices without valid coordinates
          const validDevices = deviceList.filter(
            device => 
              device.latitude != null && 
              device.longitude != null &&
              !isNaN(device.latitude) &&
              !isNaN(device.longitude)
          )
          setDevices(validDevices)
          setLoading(false)
        },
        (error) => {
          console.error('Error in devices subscription:', error);
          setLoading(false);
        }
      );
    }, 800); // Delay to ensure App Check token is ready

    return () => {
      clearTimeout(timer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authLoading])

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.log('Location access denied or unavailable')
        }
      )
    }
  }, [])

  const toggleDeviceType = (type) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(type)) {
        newSet.delete(type)
      } else {
        newSet.add(type)
      }
      return newSet
    })
  }

  const filteredDevices = devices.filter(device => 
    selectedTypes.has(device.type)
  )

  const deviceTypeLabels = {
    flock: 'Flock Camera',
    license_plate_reader: 'License Plate Reader',
    traffic_camera: 'Traffic Camera',
    security_camera: 'Security Camera',
    other: 'Other',
  }

  const handleSearchSelect = (suggestion) => {
    setSearchQuery(suggestion.displayName)
    setSearchResult(suggestion)
    setUserLocation([suggestion.latitude, suggestion.longitude])
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const result = await geocodeAddress(searchQuery)
      setSearchResult(result)
      setUserLocation([result.latitude, result.longitude])
    } catch (error) {
      alert('Address not found. Please try a different search term.')
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResult(null)
  }

  const handleMapClickForSubmit = (lat, lng) => {
    setSubmitLocation({ latitude: lat, longitude: lng })
    setSubmitModalOpen(true)
    setSubmitMode(false)
  }

  const handleSubmitSuccess = () => {
    // Device will appear automatically via real-time subscription
    setSubmitModalOpen(false)
    setSubmitLocation(null)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Navigation bar */}
      <div className="bg-white shadow-md px-4 py-3 z-20">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="/peekback-white-logo-only.png" 
              alt="PeekBack" 
              className="h-7 w-auto brightness-0"
            />
            <span className="text-xl font-bold text-gray-800">PeekBack</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/submit" className="text-sm text-gray-700 hover:text-gray-900 font-medium">
              Submit Device
            </Link>
            <Link to="/" className="text-sm text-gray-700 hover:text-gray-900 font-medium">
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Header with filters and search */}
      <div className="bg-white border-b border-gray-200 p-4 z-10">
        <div className="container mx-auto space-y-4">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <SearchAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={handleSearchSelect}
              onSearch={handleSearch}
              searching={searching}
            />
            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
            {searchResult && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors whitespace-nowrap"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSubmitMode(!submitMode)
                if (submitMode) {
                  setSubmitModalOpen(false)
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                submitMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {submitMode ? '✓ Click Map to Add' : '+ Add Device'}
            </button>
          </form>
          
            {searchResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm flex items-center justify-between">
                <p className="font-medium text-blue-900">📍 {searchResult.displayName}</p>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  ✕
                </button>
              </div>
            )}

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Surveillance Device Map</h1>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600">
                  {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} shown
                </p>
                <span className="text-gray-300">•</span>
                <Link to="/privacy" className="text-xs text-blue-600 hover:text-blue-800 underline">
                  🔒 Privacy First
                </Link>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {Object.entries(deviceTypeLabels).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => toggleDeviceType(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTypes.has(type)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {(loading || authLoading) ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">
                {authLoading ? 'Initializing security...' : 'Loading devices...'}
              </p>
            </div>
          </div>
        ) : filteredDevices.length === 0 && devices.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
            <div className="text-center max-w-md px-4">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No devices yet</h2>
              <p className="text-gray-600 mb-6">
                Be the first to report a surveillance device in your area!
              </p>
              <Link
                to="/submit"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Submit a Device
              </Link>
            </div>
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
            <div className="text-center max-w-md px-4">
              <p className="text-gray-600 mb-4">
                No devices match the selected filters. Try selecting different device types.
              </p>
            </div>
          </div>
        ) : null}
        
        {!loading && !authLoading && (
          <MapContainer
            center={userLocation || [40.7128, -74.0060]}
            zoom={userLocation ? 12 : 3}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
            />
            
            <MapClickHandler 
              onSubmitClick={handleMapClickForSubmit} 
              submitMode={submitMode}
            />
            
            {userLocation && (
              <Marker position={userLocation}>
                <Popup>Your Location</Popup>
              </Marker>
            )}
            
            {searchResult && (
              <Marker position={[searchResult.latitude, searchResult.longitude]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-medium">📍 {searchResult.displayName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchResult.latitude.toFixed(6)}, {searchResult.longitude.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {filteredDevices.map((device) => {
              const isInactive = (device.inactiveReports || 0) > 0
              const icon = deviceIcons[device.type] || deviceIcons.other
              
              return (
                <Marker
                  key={device.id}
                  position={[device.latitude, device.longitude]}
                  icon={icon}
                  opacity={isInactive ? 0.5 : 1}
                >
                  <Popup>
                    <DevicePopup device={device} deviceTypeLabels={deviceTypeLabels} />
                  </Popup>
                </Marker>
              )
            })}
            
            {searchResult && (
              <CenterOnLocation 
                location={[searchResult.latitude, searchResult.longitude]} 
                zoom={15} 
              />
            )}
            
            {filteredDevices.length > 0 && <FitBounds devices={filteredDevices} />}
          </MapContainer>
        )}
      </div>

      {/* Submit Modal */}
      {submitLocation && (
        <QuickSubmitModal
          isOpen={submitModalOpen}
          onClose={() => {
            setSubmitModalOpen(false)
            setSubmitLocation(null)
          }}
          initialLatitude={submitLocation.latitude}
          initialLongitude={submitLocation.longitude}
          onSuccess={handleSubmitSuccess}
        />
      )}

      {/* Submit Mode Indicator */}
      {submitMode && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-40 flex items-center gap-2">
          <span className="text-lg">📍</span>
          <span className="font-medium">Click anywhere on the map to add a device</span>
          <button
            onClick={() => setSubmitMode(false)}
            className="ml-2 text-white hover:text-gray-200 font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default Map

