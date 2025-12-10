/**
 * IndexedDB utility for caching all devices locally
 * Uses IndexedDB which has much larger storage limits than localStorage
 */

const DB_NAME = 'PeekBackDB'
const DB_VERSION = 1
const STORE_NAME = 'devices'
const CACHE_META_KEY = 'cache_metadata'

let dbInstance = null

/**
 * Open or create the IndexedDB database
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      // Create object store for devices if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        // Create index for efficient queries
        objectStore.createIndex('latitude', 'latitude', { unique: false })
        objectStore.createIndex('longitude', 'longitude', { unique: false })
        objectStore.createIndex('type', 'type', { unique: false })
      }
    }
  })
}

/**
 * Store all devices in IndexedDB
 */
export async function storeDevices(devices) {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    // Clear existing devices
    await new Promise((resolve, reject) => {
      const clearRequest = store.clear()
      clearRequest.onsuccess = () => resolve()
      clearRequest.onerror = () => reject(clearRequest.error)
    })

    // Add all devices
    const promises = devices.map(device => {
      return new Promise((resolve, reject) => {
        const request = store.add(device)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    })

    await Promise.all(promises)

    // Store cache metadata
    await storeCacheMetadata({
      timestamp: Date.now(),
      deviceCount: devices.length
    })

    return true
  } catch (error) {
    console.error('Error storing devices in IndexedDB:', error)
    return false
  }
}

/**
 * Get all devices from IndexedDB
 */
export async function getAllDevices() {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error getting devices from IndexedDB:', error)
    return []
  }
}

/**
 * Get devices within bounds from IndexedDB
 */
export async function getDevicesInBounds(bounds) {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const allDevices = request.result || []
        // Filter devices within bounds
        const filtered = allDevices.filter(device => {
          return device.latitude >= bounds.south &&
                 device.latitude <= bounds.north &&
                 device.longitude >= bounds.west &&
                 device.longitude <= bounds.east
        })
        resolve(filtered)
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error getting devices in bounds from IndexedDB:', error)
    return []
  }
}

/**
 * Add or update a single device in IndexedDB
 */
export async function upsertDevice(device) {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.put(device)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error upserting device in IndexedDB:', error)
    return false
  }
}

/**
 * Store cache metadata
 */
async function storeCacheMetadata(metadata) {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.put({ id: CACHE_META_KEY, ...metadata })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error storing cache metadata:', error)
  }
}

/**
 * Get cache metadata
 */
export async function getCacheMetadata() {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.get(CACHE_META_KEY)
      request.onsuccess = () => {
        const result = request.result
        if (result) {
          const { id, ...metadata } = result
          resolve(metadata)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error getting cache metadata:', error)
    return null
  }
}

/**
 * Check if cache is stale (older than 24 hours)
 */
export async function isCacheStale() {
  const metadata = await getCacheMetadata()
  if (!metadata || !metadata.timestamp) {
    return true
  }

  const age = Date.now() - metadata.timestamp
  const hours24 = 24 * 60 * 60 * 1000
  return age > hours24
}

/**
 * Clear all cached devices
 */
export async function clearCache() {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => {
        dbInstance = null
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error clearing cache:', error)
    return false
  }
}

/**
 * Get cache size estimate (number of devices)
 */
export async function getCacheSize() {
  try {
    const metadata = await getCacheMetadata()
    return metadata ? metadata.deviceCount || 0 : 0
  } catch (error) {
    return 0
  }
}

