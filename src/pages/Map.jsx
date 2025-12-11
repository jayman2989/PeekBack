import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { subscribeToDevices, geocodeAddress, getAllDevices } from '../firebase/services'
import { 
  getAllDevices as getCachedDevices, 
  storeDevices, 
  isCacheStale, 
  getCacheMetadata,
  upsertDevice,
  clearCache
} from '../utils/indexedDB'
import { deviceIcons } from '../utils/mapIcons'
import DevicePopup from '../components/DevicePopup'
import SearchAutocomplete from '../components/SearchAutocomplete'
import QuickSubmitModal from '../components/QuickSubmitModal'
import { useAuth } from '../hooks/useAuth'

// Store native Map constructor before component definition to avoid shadowing
// Access it via a temporary variable to avoid any scope issues
const _Map = globalThis.Map || window.Map || Map
const MapCache = _Map

// Fix for default marker icons in React-Leaflet (for user location)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Component to track map bounds and update parent
// Only updates when user finishes dragging/zooming (moveend/zoomend), not during drag
function MapBoundsTracker({ onBoundsChange, onZoomChange }) {
  const map = useMap()
  
  useEffect(() => {
    // Only set up listeners once - onBoundsChange is now stable
    const updateBounds = () => {
      const bounds = map.getBounds()
      if (bounds.isValid()) {
        onBoundsChange({
          south: bounds.getSouth(),
          north: bounds.getNorth(),
          west: bounds.getWest(),
          east: bounds.getEast(),
        })
      }
    }
    
    const updateZoom = () => {
      const zoom = map.getZoom()
      if (onZoomChange) {
        onZoomChange(zoom)
      }
    }

    // Only update bounds when movement/zoom is complete (not during drag)
    // This prevents lag while dragging
    map.on('moveend', updateBounds)
    map.on('zoomend', () => {
      updateBounds()
      updateZoom()
    })
    
    // Initial bounds and zoom (with small delay to ensure map is ready)
    const initialTimer = setTimeout(() => {
      updateBounds()
      updateZoom()
    }, 100)

    return () => {
      clearTimeout(initialTimer)
      map.off('moveend', updateBounds)
      map.off('zoomend', updateBounds)
    }
  }, [map, onBoundsChange, onZoomChange]) // Include onBoundsChange since it's stable via useCallback
  
  return null
}

// Component to fit map bounds to show all markers (only when explicitly requested)
function FitBounds({ devices, enabled = false }) {
  const map = useMap()
  
  useEffect(() => {
    if (enabled && devices.length > 0) {
      const bounds = L.latLngBounds(
        devices.map(device => [device.latitude, device.longitude])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [devices, map, enabled])
  
  return null
}

// Component to center map on a specific location
function CenterOnLocation({ location, zoom, onCentered }) {
  const map = useMap()
  
  useEffect(() => {
    if (location) {
      map.setView(location, zoom || 15)
      // Notify parent that centering is complete
      if (onCentered) {
        onCentered()
      }
    }
  }, [location, zoom, map, onCentered])
  
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

// Component for marker clustering
function MarkerClusterGroup({ devices, deviceIcons, deviceTypeLabels, enabled }) {
  const map = useMap()
  const clusterGroupRef = useRef(null)
  const markersRef = useRef([])
  const batchTimeoutRef = useRef(null)
  const currentBatchIndexRef = useRef(0)
  const pendingDevicesRef = useRef([])

  useEffect(() => {
    if (!enabled) {
      // Remove cluster group if disabled
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current)
        clusterGroupRef.current = null
        markersRef.current = []
      }
      // Clear any pending batches
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
        batchTimeoutRef.current = null
      }
      currentBatchIndexRef.current = 0
      pendingDevicesRef.current = []
      return
    }

    // Create cluster group
    if (!clusterGroupRef.current) {
      clusterGroupRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        // Optimize for large datasets
        disableClusteringAtZoom: 18, // Don't cluster at max zoom
        chunkInterval: 200, // Process chunks every 200ms
        chunkDelay: 50, // Delay between chunks
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount()
          let size = 'small'
          if (count > 100) size = 'large'
          else if (count > 20) size = 'medium'
          
          return L.divIcon({
            html: `<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: ${size === 'large' ? '50' : size === 'medium' ? '45' : '40'}px; height: ${size === 'large' ? '50' : size === 'medium' ? '45' : '40'}px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: ${size === 'large' ? '14px' : '12px'};">${count}</div>`,
            className: 'marker-cluster-custom',
            iconSize: L.point(size === 'large' ? 50 : size === 'medium' ? 45 : 40, size === 'large' ? 50 : size === 'medium' ? 45 : 40)
          })
        }
      })
      map.addLayer(clusterGroupRef.current)
    }

    // Clear any pending batches
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current)
      batchTimeoutRef.current = null
    }

    // Store devices to add
    pendingDevicesRef.current = devices
    currentBatchIndexRef.current = 0

    // Clear existing markers
    clusterGroupRef.current.clearLayers()
    markersRef.current = []

    // Add markers in batches to prevent lag
    const BATCH_SIZE = 500 // Add 500 markers at a time
    const BATCH_DELAY = 50 // 50ms delay between batches

    const addBatch = () => {
      if (!clusterGroupRef.current || currentBatchIndexRef.current >= pendingDevicesRef.current.length) {
        batchTimeoutRef.current = null
        return
      }

      const batch = pendingDevicesRef.current.slice(
        currentBatchIndexRef.current,
        currentBatchIndexRef.current + BATCH_SIZE
      )

      batch.forEach((device) => {
        const isInactive = (device.inactiveReports || 0) > 0
        const icon = deviceIcons[device.type] || deviceIcons.other
        const marker = L.marker([device.latitude, device.longitude], { 
          icon: icon,
          opacity: isInactive ? 0.5 : 1
        })
        
        // Create popup content
        const popupDiv = document.createElement('div')
        popupDiv.style.minWidth = '200px'
        popupDiv.innerHTML = `
          <div>
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${deviceTypeLabels[device.type] || 'Device'}</h3>
            ${device.address ? `<p style="margin: 4px 0; color: #666; font-size: 14px;">📍 ${device.address}</p>` : ''}
            ${device.description ? `<p style="margin: 4px 0; color: #666; font-size: 14px;">${device.description}</p>` : ''}
            <p style="margin: 4px 0; font-size: 12px; color: #999;">Coordinates: ${device.latitude.toFixed(6)}, ${device.longitude.toFixed(6)}</p>
            ${isInactive ? `<p style="margin: 4px 0; color: #dc2626; font-size: 12px;">⚠️ Reported as inactive by ${device.inactiveReports} user(s)</p>` : ''}
          </div>
        `
        
        marker.bindPopup(popupDiv, {
          className: 'custom-popup'
        })
        clusterGroupRef.current.addLayer(marker)
        markersRef.current.push(marker)
      })

      currentBatchIndexRef.current += BATCH_SIZE

      // Schedule next batch
      if (currentBatchIndexRef.current < pendingDevicesRef.current.length) {
        batchTimeoutRef.current = setTimeout(addBatch, BATCH_DELAY)
      } else {
        batchTimeoutRef.current = null
      }
    }

    // Start adding batches
    addBatch()

    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
        batchTimeoutRef.current = null
      }
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers()
      }
    }
  }, [enabled, map, devices, deviceIcons, deviceTypeLabels])

  return null
}

function Map() {
  const { currentUser, loading: authLoading } = useAuth()
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingDevices, setLoadingDevices] = useState(false)
  const [loadingFromFirestore, setLoadingFromFirestore] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0, message: '' })
  const [selectedTypes, setSelectedTypes] = useState(new Set(['flock', 'license_plate_reader', 'traffic_camera', 'security_camera', 'other']))
  const [userLocation, setUserLocation] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState(null)
  const [submitMode, setSubmitMode] = useState(false)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [submitLocation, setSubmitLocation] = useState(null)
  const [clusteringEnabled, setClusteringEnabled] = useState(true)
  const [mapBounds, setMapBounds] = useState(null)
  const [initialBoundsSet, setInitialBoundsSet] = useState(false)
  const [forceRefresh, setForceRefresh] = useState(0) // Counter to force refresh
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [shouldCenterOnUser, setShouldCenterOnUser] = useState(false) // Track when to center on user location
  const [currentZoom, setCurrentZoom] = useState(null)
  // Detect mobile device - use window width as fallback if userAgent check fails
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768
    }
    return false
  })
  
  // Update mobile detection on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // All refs must be declared together
  const boundsUpdateTimerRef = useRef(null)
  const lastBoundsRef = useRef(null)
  const unsubscribeRef = useRef(null)
  const initialLoadDoneRef = useRef(false)
  
  // Load all devices from IndexedDB cache or Firestore
  useEffect(() => {
    // Don't load anything until App Check is ready
    if (authLoading) {
      return
    }
    
    // Only load once
    if (initialLoadDoneRef.current) {
      return
    }
    
    initialLoadDoneRef.current = true
    setLoadingDevices(true)
    
    const loadDevices = async () => {
      try {
        // Step 1: Try to load from IndexedDB cache first
        const cacheStale = await isCacheStale()
        const cachedDevices = await getCachedDevices()
        
        if (!cacheStale && cachedDevices.length > 0) {
          // Cache is fresh, use it
          if (process.env.NODE_ENV === 'development') {
            console.log(`Loaded ${cachedDevices.length} devices from IndexedDB cache`)
          }
          setDevices(cachedDevices)
          setLoading(false)
          setLoadingDevices(false)
          
          // Still subscribe to real-time updates in background
          subscribeToRealTimeUpdates()
          return
        }
        
        // Step 2: Cache is stale or missing, fetch from Firestore
        setLoadingFromFirestore(true)
        setLoadingProgress({ current: 0, total: 0, message: 'Connecting to database...' })
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Cache stale or missing, fetching all devices from Firestore...')
        }
        
        // Fetch ALL devices (no limit)
        setLoadingProgress({ current: 0, total: 0, message: 'Fetching device data from database...' })
        const allDevices = await getAllDevices({ limitCount: null })
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Fetched ${allDevices.length} devices from Firestore`)
        }
        
        // Update progress
        setLoadingProgress({ current: allDevices.length, total: allDevices.length, message: 'Processing devices...' })
        
        // Filter out devices without valid coordinates
        const validDevices = allDevices.filter(
          device => 
            device.latitude != null && 
            device.longitude != null &&
            !isNaN(device.latitude) &&
            !isNaN(device.longitude)
        )
        
        // Store in IndexedDB (this can also take a while with large datasets)
        setLoadingProgress({ current: validDevices.length, total: validDevices.length, message: 'Storing in local cache...' })
        await storeDevices(validDevices, true) // true = full refresh, clears store first for better performance
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Stored ${validDevices.length} devices in IndexedDB`)
        }
        
        // Update state
        setDevices(validDevices)
        setLoading(false)
        setLoadingDevices(false)
        setLoadingFromFirestore(false)
        setLoadingProgress({ current: 0, total: 0, message: '' })
        
        // Subscribe to real-time updates
        subscribeToRealTimeUpdates()
      } catch (error) {
        console.error('Error loading devices:', error)
        setDevices([])
        setLoading(false)
        setLoadingDevices(false)
        setLoadingFromFirestore(false)
        setLoadingProgress({ current: 0, total: 0, message: '' })
      }
    }
    
    // Subscribe to real-time updates
    const subscribeToRealTimeUpdates = () => {
      // Unsubscribe from previous subscription if any
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      
      // Subscribe to all device changes
      unsubscribeRef.current = subscribeToDevices(
        async (updatedDevices) => {
          // Update IndexedDB with new devices
          try {
            // For each updated device, upsert it in IndexedDB
            for (const device of updatedDevices) {
              // Only update if device has valid coordinates
              if (device.latitude != null && 
                  device.longitude != null &&
                  !isNaN(device.latitude) &&
                  !isNaN(device.longitude)) {
                await upsertDevice(device)
              }
            }
            
            // Reload all devices from IndexedDB to get latest state
            const allCachedDevices = await getCachedDevices()
            setDevices(allCachedDevices)
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error updating IndexedDB from real-time updates:', error)
            }
          }
        },
        (error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error in real-time subscription:', error)
          }
        }
      )
    }
    
    loadDevices()
    
    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [authLoading])
  
  // Initialize cache ref on first use (inside useEffect, not during render)
  
  // Memoize bounds change handler to prevent infinite loops
  // Since we only get updates on moveend/zoomend, we don't need heavy debouncing
  const handleBoundsChange = useCallback((newBounds) => {
    // Only update if bounds have changed significantly (avoid micro-updates)
    // Since moveend/zoomend only fire when drag is complete, we can be less aggressive
    const hasSignificantChange = !lastBoundsRef.current || 
      Math.abs(lastBoundsRef.current.south - newBounds.south) > 0.005 ||
      Math.abs(lastBoundsRef.current.north - newBounds.north) > 0.005 ||
      Math.abs(lastBoundsRef.current.west - newBounds.west) > 0.005 ||
      Math.abs(lastBoundsRef.current.east - newBounds.east) > 0.005
    
    if (hasSignificantChange) {
      // Clear any pending updates
      if (boundsUpdateTimerRef.current) {
        clearTimeout(boundsUpdateTimerRef.current)
      }
      
      // Small delay to batch rapid moveend events (e.g., from zooming)
      boundsUpdateTimerRef.current = setTimeout(() => {
        lastBoundsRef.current = newBounds
        setMapBounds(newBounds)
        setInitialBoundsSet(true) // Mark that user has interacted with map
      }, 100) // Reduced debounce since we only get moveend events
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps is intentional - state setters are stable
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (boundsUpdateTimerRef.current) {
        clearTimeout(boundsUpdateTimerRef.current)
      }
    }
  }, [])

  // OLD VIEWPORT-BASED LOADING CODE - REMOVED
  // Now using IndexedDB to cache all devices
  // This useEffect is kept for reference but disabled
  const OLD_VIEWPORT_LOADING_DISABLED = true
  useEffect(() => {
    if (OLD_VIEWPORT_LOADING_DISABLED) return
    // Don't load anything until App Check is ready
    if (authLoading) {
      return
    }
    
    // If no map bounds yet, just set loading to false
    if (!mapBounds) {
      setLoading(false)
      return
    }

    // STEP 2: Check cache first (using ref to avoid re-renders)
    const cacheKey = `${Math.round(mapBounds.south * 100) / 100}_${Math.round(mapBounds.north * 100) / 100}_${Math.round(mapBounds.west * 100) / 100}_${Math.round(mapBounds.east * 100) / 100}`
    
    // Initialize cache if needed (inside useEffect, not during render)
    // Use MapCache to avoid conflict with component name
    if (!devicesCacheRef.current) {
      devicesCacheRef.current = new MapCache()
    }
    const cache = devicesCacheRef.current
    
    // Skip cache if force refresh is triggered (development only)
    if (forceRefresh === 0) {
      // Check in-memory cache first
      if (cache.has(cacheKey)) {
        const cachedDevices = cache.get(cacheKey)
        setDevices(cachedDevices)
        setLoading(false)
        setLoadingDevices(false)
        return
      }
      
          // Check localStorage cache with 24-hour expiration
          try {
            const cached = localStorage.getItem('peekback_devices_cache')
            if (cached) {
              const parsed = JSON.parse(cached)
              const cacheEntry = parsed[cacheKey]
              if (cacheEntry && cacheEntry.timestamp && cacheEntry.devices) {
                const age = Date.now() - cacheEntry.timestamp
                const hours24 = 24 * 60 * 60 * 1000
                if (age < hours24) {
                  // Cache is still valid, use it
                  // Limit to 2000 devices to prevent quota issues
                  const cachedDevices = cacheEntry.devices.slice(0, 2000)
                  // Also update in-memory cache
                  cache.set(cacheKey, cachedDevices)
                  setDevices(cachedDevices)
                  setLoading(false)
                  setLoadingDevices(false)
                  return
                }
              }
            }
          } catch (error) {
            // If localStorage fails, continue to fetch
            if (process.env.NODE_ENV === 'development') {
              console.warn('Cache read error:', error)
            }
            // Try to clear corrupted cache
            try {
              localStorage.removeItem('peekback_devices_cache')
            } catch (e) {
              // Ignore errors when clearing
            }
          }
    }

    // STEP 2: Load devices asynchronously with very small initial limit
    setLoadingDevices(true)
    
    // Delay to ensure App Check token is attached
    const timer = setTimeout(async () => {
      try {
        const bounds = {
          south: mapBounds.south,
          north: mapBounds.north,
          west: mapBounds.west,
          east: mapBounds.east,
        }
        
        // Calculate padding and limit based on zoom level (especially for mobile)
        // Lower zoom = larger area = need to limit more aggressively
        let padding, maxDevices
        
        if (isMobile && currentZoom !== null) {
          // Mobile: more aggressive limits at low zoom levels
          if (currentZoom < 6) {
            // Very zoomed out - limit heavily
            padding = 0.02
            maxDevices = 1000
          } else if (currentZoom < 8) {
            // Moderately zoomed out
            padding = 0.05
            maxDevices = 3000
          } else if (currentZoom < 10) {
            // Normal zoom
            padding = 0.08
            maxDevices = 5000
          } else {
            // Zoomed in
            padding = initialBoundsSet ? 0.1 : 0.05
            maxDevices = 8000
          }
        } else {
          // Desktop: less aggressive limits
          if (currentZoom !== null && currentZoom < 5) {
            // Very zoomed out
            padding = 0.05
            maxDevices = 5000
          } else {
            // Normal to zoomed in
            padding = initialBoundsSet ? 0.1 : 0.05
            maxDevices = 10000
          }
        }
        
        const expandedBounds = {
          south: Math.max(-90, bounds.south - padding),
          north: Math.min(90, bounds.north + padding),
          west: Math.max(-180, bounds.west - padding),
          east: Math.min(180, bounds.east + padding),
        }

        // Use calculated limit based on zoom level and device type
        const deviceList = await getDevicesInBounds(expandedBounds, maxDevices)
        
        // Filter out devices without valid coordinates
        const validDevices = deviceList.filter(
          device => 
            device.latitude != null && 
            device.longitude != null &&
            !isNaN(device.latitude) &&
            !isNaN(device.longitude)
        )
        
        // Cache the results (keep last 5 regions for better UX)
        // Ensure cache is initialized (use MapCache to avoid conflict with component name)
        if (!devicesCacheRef.current) {
          devicesCacheRef.current = new MapCache()
        }
        const cacheToUpdate = devicesCacheRef.current
        if (cacheToUpdate.size >= 5) {
          const firstKey = cacheToUpdate.keys().next().value
          cacheToUpdate.delete(firstKey)
        }
        cacheToUpdate.set(cacheKey, validDevices)
        
        // Also save to localStorage with 24-hour expiration timestamp
        // Limit devices per cache entry to prevent quota issues
        try {
          // Limit to 2000 devices per cache entry (reduced to prevent quota errors)
          const devicesToCache = validDevices.slice(0, 2000)
          
          const cached = localStorage.getItem('peekback_devices_cache')
          const cacheData = cached ? JSON.parse(cached) : {}
          
          // Store with timestamp
          cacheData[cacheKey] = {
            devices: devicesToCache,
            timestamp: Date.now()
          }
          
          // Clean up old entries (older than 24 hours) to prevent localStorage from growing too large
          const hours24 = 24 * 60 * 60 * 1000
          Object.keys(cacheData).forEach(key => {
            if (cacheData[key].timestamp && (Date.now() - cacheData[key].timestamp) > hours24) {
              delete cacheData[key]
            }
          })
          
          // Limit to 3 regions max in localStorage (reduced from 10 to prevent quota)
          const keys = Object.keys(cacheData)
          if (keys.length > 3) {
            // Remove oldest entries
            const sorted = keys.sort((a, b) => 
              (cacheData[a].timestamp || 0) - (cacheData[b].timestamp || 0)
            )
            sorted.slice(0, keys.length - 3).forEach(key => {
              delete cacheData[key]
            })
          }
          
          // Try to set the cache, but handle quota errors gracefully
          try {
            localStorage.setItem('peekback_devices_cache', JSON.stringify(cacheData))
          } catch (quotaError) {
            // If quota exceeded, clear oldest entries and try again
            if (quotaError.name === 'QuotaExceededError') {
              // Remove all but the most recent entry
              const sorted = keys.sort((a, b) => 
                (cacheData[a].timestamp || 0) - (cacheData[b].timestamp || 0)
              )
              // Keep only the most recent entry
              const mostRecentKey = sorted[sorted.length - 1]
              const reducedCache = mostRecentKey ? { [mostRecentKey]: cacheData[mostRecentKey] } : {}
              
              try {
                localStorage.setItem('peekback_devices_cache', JSON.stringify(reducedCache))
              } catch (retryError) {
                // If still failing, clear all cache
                if (process.env.NODE_ENV === 'development') {
                  console.warn('Cache quota still exceeded, clearing cache:', retryError)
                }
                try {
                  localStorage.removeItem('peekback_devices_cache')
                } catch (e) {
                  // Ignore errors when clearing
                }
              }
            } else {
              throw quotaError
            }
          }
        } catch (error) {
          // If localStorage fails (quota exceeded, etc.), just continue
          // App should work fine without cache
          if (process.env.NODE_ENV === 'development') {
            console.warn('Cache write error:', error)
          }
        }
        
        setDevices(validDevices)
        setLoading(false)
        setLoadingDevices(false)
      } catch (error) {
        console.error('Error loading devices:', error)
        // Set empty array on error
        setDevices([])
        setLoading(false)
        setLoadingDevices(false)
      }
    }, 500) // Slightly longer delay for testing

    return () => {
      clearTimeout(timer)
    }
  }, [authLoading, mapBounds, initialBoundsSet, forceRefresh, currentZoom, isMobile]) // Added currentZoom and isMobile to dependencies

  // Get user's current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setGettingLocation(true)
    setLocationError(null)
    setShouldCenterOnUser(true) // Flag to center when location is received

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = [position.coords.latitude, position.coords.longitude]
        setUserLocation(newLocation)
        setGettingLocation(false)
        // Center map on user location - CenterOnLocation component will handle this
      },
      (error) => {
        setGettingLocation(false)
        setShouldCenterOnUser(false) // Reset flag on error
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable location access in your browser settings.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out.')
            break
          default:
            setLocationError('An unknown error occurred while getting your location.')
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Don't use cached location
      }
    )
  }

  // Get user's current location on initial load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          // Silently fail on initial load - user can click button to request permission
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

  // Filter devices by type first
  const typeFilteredDevices = devices.filter(device =>
    selectedTypes.has(device.type)
  )
  
  // Then filter by viewport bounds to only render visible markers (performance optimization)
  // Add padding to prevent markers from popping in/out while panning
  const filteredDevices = mapBounds ? (() => {
    const padding = 0.1 // 10% padding on all sides
    const paddedBounds = {
      south: mapBounds.south - (mapBounds.north - mapBounds.south) * padding,
      north: mapBounds.north + (mapBounds.north - mapBounds.south) * padding,
      west: mapBounds.west - (mapBounds.east - mapBounds.west) * padding,
      east: mapBounds.east + (mapBounds.east - mapBounds.west) * padding,
    }
    
    return typeFilteredDevices.filter(device => {
      return device.latitude >= paddedBounds.south &&
             device.latitude <= paddedBounds.north &&
             device.longitude >= paddedBounds.west &&
             device.longitude <= paddedBounds.east
    })
  })() : typeFilteredDevices

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
      <div className="bg-white shadow-md px-3 sm:px-4 py-2 sm:py-3 z-20">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="/peekback-white-logo-only.png" 
              alt="PeekBack" 
              className="h-5 sm:h-7 w-auto brightness-0"
            />
            <span className="text-lg sm:text-xl font-bold text-gray-800">PeekBack</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/submit" className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 font-medium">
              Submit
            </Link>
            <Link to="/" className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 font-medium hidden sm:inline">
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Header with filters and search */}
      <div className="bg-white border-b border-gray-200 p-3 sm:p-4 z-10">
        <div className="container mx-auto space-y-3 sm:space-y-4">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onSelect={handleSearchSelect}
                onSearch={handleSearch}
                searching={searching}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap flex-1 sm:flex-none min-w-[80px]"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
              {searchResult && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-300 transition-colors whitespace-nowrap"
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
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                  submitMode
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span className="sm:hidden">+</span>
                <span className="hidden sm:inline">{submitMode ? '✓ Click Map to Add' : '+ Add Device'}</span>
              </button>
              <button
                type="button"
                onClick={() => setClusteringEnabled(!clusteringEnabled)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-base font-medium transition-colors whitespace-nowrap ${
                  clusteringEnabled
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Toggle marker clustering"
              >
                <span className="sm:hidden">{clusteringEnabled ? '🔗' : '📍'}</span>
                <span className="hidden sm:inline">{clusteringEnabled ? '🔗 Clustered' : '📍 Individual'}</span>
              </button>
            </div>
          </form>
          
            {searchResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm flex items-center justify-between gap-2">
                <p className="font-medium text-blue-900 truncate flex-1">📍 {searchResult.displayName}</p>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 text-sm sm:text-xs flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            )}

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Surveillance Device Map</h1>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <p className="text-xs sm:text-sm text-gray-600">
                  {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} shown
                </p>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <Link to="/privacy" className="text-xs text-blue-600 hover:text-blue-800 underline">
                  🔒 Privacy First
                </Link>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {Object.entries(deviceTypeLabels).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => toggleDeviceType(type)}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
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
        {authLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Initializing security...</p>
            </div>
          </div>
        ) : null}
        {/* Loading indicator for initial Firestore fetch */}
        {loadingFromFirestore && !authLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md mx-4 border border-gray-200">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Loading Device Data
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Fetching surveillance device locations from the database...
                </p>
                {loadingProgress.total > 0 && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {loadingProgress.current.toLocaleString()} of {loadingProgress.total.toLocaleString()} devices
                    </p>
                  </div>
                )}
                {loadingProgress.message && (
                  <p className="text-xs text-gray-500 italic">{loadingProgress.message}</p>
                )}
                <p className="text-xs text-gray-400 mt-4">
                  This is a one-time operation. Future loads will be much faster!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Subtle loading indicator for other operations */}
        {loadingDevices && !authLoading && !loadingFromFirestore && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-md z-30 flex items-center gap-1.5 sm:gap-2 border border-gray-200">
            <div className="animate-spin rounded-full h-2.5 sm:h-3 w-2.5 sm:w-3 border-2 border-blue-500 border-t-transparent"></div>
            <p className="text-xs text-gray-600 font-medium">Loading...</p>
          </div>
        )}
        
        {/* Subtle device count indicator when loaded */}
        {!loadingDevices && !authLoading && devices.length > 0 && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm z-30 border border-gray-200 flex items-center gap-1.5 sm:gap-2">
            <p className="text-xs text-gray-600 font-medium">
              {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''}
            </p>
            {/* Development-only refresh button */}
            {process.env.NODE_ENV === 'development' && (
              <button
                        onClick={async () => {
                          // Clear IndexedDB cache and force refresh
                          try {
                            await clearCache()
                            setForceRefresh(prev => prev + 1)
                          } catch (error) {
                            console.warn('Failed to clear cache:', error)
                          }
                        }}
                className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Force refresh (dev only)"
              >
                ↻
              </button>
            )}
          </div>
        )}
        
        {/* Location button - fixed position */}
        <button
          onClick={handleGetLocation}
          disabled={gettingLocation}
          className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white hover:bg-gray-50 text-gray-700 shadow-lg rounded-full p-3 z-30 border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={gettingLocation ? 'Getting location...' : 'Center on my location'}
        >
          {gettingLocation ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
        
        {/* Location error message */}
        {locationError && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg shadow-lg z-30 max-w-[90vw] sm:max-w-md">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{locationError}</p>
              <button
                onClick={() => setLocationError(null)}
                className="text-red-600 hover:text-red-800 text-lg font-bold flex-shrink-0"
              >
                ×
              </button>
            </div>
          </div>
        )}
        {/* TEMPORARILY DISABLED: Empty state messages */}
        {/* TODO: Re-enable when device loading is optimized */}
        {false && filteredDevices.length === 0 && devices.length === 0 && !loadingDevices && !authLoading ? (
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
        ) : false && filteredDevices.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
            <div className="text-center max-w-md px-4">
              <p className="text-gray-600 mb-4">
                No devices match the selected filters. Try selecting different device types.
              </p>
            </div>
          </div>
        ) : null}
        
        {/* Show map immediately - devices load asynchronously */}
        <MapContainer
          center={userLocation || [37.0902, -95.7129]} // Default to US center
          zoom={userLocation ? 12 : (isMobile ? 11 : 10)} // Slightly more zoomed in on mobile
          minZoom={isMobile ? 6 : 3} // Prevent zooming out too far on mobile
          maxZoom={18}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          whenReady={(map) => {
            // Map is ready, set loading to false so it's visible
            setLoading(false)
            
            // Set initial bounds if not already set (only once)
            if (!initialBoundsSet && !mapBounds) {
              const bounds = map.target.getBounds()
              // Small delay to ensure map is fully rendered
              setTimeout(() => {
                setMapBounds({
                  south: bounds.getSouth(),
                  north: bounds.getNorth(),
                  west: bounds.getWest(),
                  east: bounds.getEast(),
                })
                setInitialBoundsSet(true)
              }, 500)
            }
          }}
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
            
            {/* Center on user location only when button is clicked */}
            {shouldCenterOnUser && userLocation && (
              <CenterOnLocation 
                key={`user-center-${userLocation[0]}-${userLocation[1]}`}
                location={userLocation} 
                zoom={13}
                onCentered={() => setShouldCenterOnUser(false)} // Reset flag after centering
              />
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
            
            {/* STEP 1: Enable marker rendering (devices array is empty for now) */}
            {/* On mobile at low zoom, disable clustering to prevent lag */}
            {clusteringEnabled && filteredDevices.length > 0 && 
             (!isMobile || currentZoom === null || currentZoom >= 7) && (
              <MarkerClusterGroup 
                devices={filteredDevices}
                deviceIcons={deviceIcons}
                deviceTypeLabels={deviceTypeLabels}
                enabled={clusteringEnabled}
              />
            )}
            
            {/* STEP 1: Enable individual markers (devices array is empty for now) */}
            {/* On mobile at low zoom, limit number of markers to prevent lag */}
            {!clusteringEnabled && filteredDevices.slice(0, isMobile && currentZoom !== null && currentZoom < 8 ? 500 : filteredDevices.length).map((device) => {
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
            
            <MapBoundsTracker 
              onBoundsChange={handleBoundsChange}
              onZoomChange={setCurrentZoom}
            />
            {/* Don't auto-fit bounds - let user control the map */}
          </MapContainer>
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
        <div className="fixed bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg z-40 flex items-center gap-2 max-w-[90vw] sm:max-w-none">
          <span className="text-base sm:text-lg">📍</span>
          <span className="font-medium text-sm sm:text-base">Click map to add device</span>
          <button
            onClick={() => setSubmitMode(false)}
            className="ml-2 px-2 sm:px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs sm:text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default Map

