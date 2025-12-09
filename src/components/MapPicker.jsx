import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom marker icon for selected location - pin with checkmark
const selectedIcon = L.divIcon({
  className: 'custom-selected-icon',
  html: `
    <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-selected" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M20 0C8.954 0 0 8.954 0 20c0 10.046 20 28 20 28s20-17.954 20-28C40 8.954 31.046 0 20 0z" 
            fill="#EF4444" 
            filter="url(#shadow-selected)"/>
      <circle cx="20" cy="20" r="10" fill="white" opacity="0.95"/>
      <path d="M15 20l3 3 7-7" stroke="#EF4444" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -48],
})

// Component to handle map click events
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
    },
  })
  return null
}

// Component to center map on user's location
function CenterMap({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 15)
    }
  }, [center, map])
  return null
}

function MapPicker({ latitude, longitude, onLocationChange, onGetCurrentLocation }) {
  const [userLocation, setUserLocation] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(
    latitude && longitude ? [latitude, longitude] : null
  )

  // Update selected location when props change
  useEffect(() => {
    if (latitude && longitude) {
      setSelectedLocation([latitude, longitude])
    }
  }, [latitude, longitude])

  const handleMapClick = (lat, lng) => {
    setSelectedLocation([lat, lng])
    onLocationChange(lat, lng)
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    onGetCurrentLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation([latitude, longitude])
        setSelectedLocation([latitude, longitude])
        onLocationChange(latitude, longitude)
        onGetCurrentLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location. Please allow location access or click on the map.')
        onGetCurrentLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Default center (can be changed to a default location)
  const defaultCenter = [40.7128, -74.0060] // New York City
  const mapCenter = selectedLocation || userLocation || defaultCenter

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-gray-600">
          Click on the map to set location, or use your current location
        </p>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span>📍</span>
          Use My Location
        </button>
      </div>
      
      <div className="border border-gray-300 rounded-md overflow-hidden" style={{ height: '400px' }}>
        <MapContainer
          center={mapCenter}
          zoom={selectedLocation ? 15 : 10}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          
          {userLocation && (
            <Marker 
              position={userLocation} 
              title="Your current location"
            />
          )}
          
          {selectedLocation && (
            <Marker 
              position={selectedLocation} 
              icon={selectedIcon}
              title="Selected location"
            />
          )}
          
          <MapClickHandler onLocationSelect={handleMapClick} />
          {selectedLocation && <CenterMap center={selectedLocation} />}
        </MapContainer>
      </div>
      
      {selectedLocation && (
        <div className="mt-2 text-sm text-gray-600">
          Selected: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
        </div>
      )}
    </div>
  )
}

export default MapPicker

