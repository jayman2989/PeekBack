import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Component to handle drawing rectangle on map
function DrawRectangle({ onBoundsChange, initialBounds }) {
  const map = useMap()
  const drawControlRef = useRef(null)
  const drawnItemsRef = useRef(null)

  useEffect(() => {
    // Create a feature group to store drawn items
    drawnItemsRef.current = new L.FeatureGroup()
    map.addLayer(drawnItemsRef.current)

    // Create draw control with only rectangle option
    drawControlRef.current = new L.Control.Draw({
      draw: {
        rectangle: {
          shapeOptions: {
            color: '#3b82f6',
            weight: 2,
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
          },
        },
        polygon: false,
        circle: false,
        marker: false,
        circlemarker: false,
        polyline: false,
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: true,
      },
    })

    map.addControl(drawControlRef.current)

    // Handle rectangle creation
    const handleDrawCreated = (e) => {
      const layer = e.layer
      const bounds = layer.getBounds()
      
      // Remove any existing rectangles
      drawnItemsRef.current.clearLayers()
      
      // Add new rectangle
      drawnItemsRef.current.addLayer(layer)
      
      // Calculate bounding box
      const south = bounds.getSouth()
      const north = bounds.getNorth()
      const west = bounds.getWest()
      const east = bounds.getEast()
      
      onBoundsChange({ south, north, west, east })
    }

    // Handle rectangle editing
    const handleDrawEdited = (e) => {
      const layers = e.layers
      layers.eachLayer((layer) => {
        const bounds = layer.getBounds()
        const south = bounds.getSouth()
        const north = bounds.getNorth()
        const west = bounds.getWest()
        const east = bounds.getEast()
        
        onBoundsChange({ south, north, west, east })
      })
    }

    // Handle rectangle deletion
    const handleDrawDeleted = () => {
      onBoundsChange(null)
    }

    map.on(L.Draw.Event.CREATED, handleDrawCreated)
    map.on(L.Draw.Event.EDITED, handleDrawEdited)
    map.on(L.Draw.Event.DELETED, handleDrawDeleted)

    // If initial bounds provided, draw rectangle
    if (initialBounds) {
      const bounds = L.latLngBounds(
        [initialBounds.south, initialBounds.west],
        [initialBounds.north, initialBounds.east]
      )
      const rectangle = L.rectangle(bounds, {
        color: '#3b82f6',
        weight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
      })
      drawnItemsRef.current.addLayer(rectangle)
      map.fitBounds(bounds, { padding: [20, 20] })
    }

    return () => {
      map.off(L.Draw.Event.CREATED, handleDrawCreated)
      map.off(L.Draw.Event.EDITED, handleDrawEdited)
      map.off(L.Draw.Event.DELETED, handleDrawDeleted)
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current)
      }
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current)
      }
    }
  }, [map, onBoundsChange, initialBounds])

  return null
}

// Component to fit map to bounds
function FitBounds({ bounds }) {
  const map = useMap()
  
  useEffect(() => {
    if (bounds) {
      const latLngBounds = L.latLngBounds(
        [bounds.south, bounds.west],
        [bounds.north, bounds.east]
      )
      map.fitBounds(latLngBounds, { padding: [20, 20] })
    }
  }, [bounds, map])
  
  return null
}

function RegionPicker({ bounds, onBoundsChange, height = '400px' }) {
  const [mapKey, setMapKey] = useState(0) // Force re-render when needed

  // Default center (center of US)
  const defaultCenter = [39.8283, -98.5795]
  const defaultZoom = 4

  // Calculate center from bounds if available
  const mapCenter = bounds
    ? [(bounds.south + bounds.north) / 2, (bounds.west + bounds.east) / 2]
    : defaultCenter

  const handleClear = () => {
    onBoundsChange(null)
    setMapKey(prev => prev + 1) // Force map re-render to clear drawn items
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Draw a rectangle on the map to select the import region, or enter coordinates manually below
        </p>
        {bounds && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Clear Region
          </button>
        )}
      </div>
      
      <div className="border border-gray-300 rounded-md overflow-hidden" style={{ height }}>
        <MapContainer
          key={mapKey}
          center={mapCenter}
          zoom={bounds ? undefined : defaultZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          
          <DrawRectangle onBoundsChange={onBoundsChange} initialBounds={bounds} />
          {bounds && <FitBounds bounds={bounds} />}
        </MapContainer>
      </div>
      
      {bounds && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700">
          <p className="font-medium mb-1">Selected Region:</p>
          <p>South: {bounds.south.toFixed(4)}, North: {bounds.north.toFixed(4)}</p>
          <p>West: {bounds.west.toFixed(4)}, East: {bounds.east.toFixed(4)}</p>
        </div>
      )}
    </div>
  )
}

export default RegionPicker

