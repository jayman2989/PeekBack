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
 * Optimized for performance with large datasets by:
 * - Processing in batches to avoid blocking the UI
 * - Using put() which is faster than add() for updates
 * - Efficiently handling full refreshes vs incremental updates
 * @param {Array} devices - Array of device objects to store
 * @param {boolean} isFullRefresh - If true, clears store first (faster for full replacements)
 */
export async function storeDevices(devices, isFullRefresh = false) {
  if (!devices || devices.length === 0) {
    // If full refresh with no devices, clear the store
    if (isFullRefresh) {
      try {
        const db = await openDB()
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        await new Promise((resolve, reject) => {
          const clearRequest = store.clear()
          clearRequest.onsuccess = () => resolve()
          clearRequest.onerror = () => reject(clearRequest.error)
        })
      } catch (error) {
        console.error('Error clearing IndexedDB:', error)
      }
    }
    await storeCacheMetadata({
      timestamp: Date.now(),
      deviceCount: 0
    })
    return true
  }

  try {
    const db = await openDB()
    
    // For full refreshes, clear first (can be faster than individual deletes)
    if (isFullRefresh) {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      await new Promise((resolve, reject) => {
        const clearRequest = store.clear()
        clearRequest.onsuccess = () => resolve()
        clearRequest.onerror = () => reject(clearRequest.error)
      })
    }
    
    // Process in batches to avoid blocking and improve performance
    // IndexedDB transactions are more efficient when operations are batched
    const BATCH_SIZE = 2000 // Process 2000 devices per batch (increased from 1000)
    const totalBatches = Math.ceil(devices.length / BATCH_SIZE)
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE
      const end = Math.min(start + BATCH_SIZE, devices.length)
      const batch = devices.slice(start, end)
      
      // Use a single transaction per batch for better performance
      await new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        
        // Track completed operations
        let completed = 0
        let hasError = false
        
        // Use put() instead of add() - this will update existing records and add new ones
        // For full refresh, we already cleared, but put() is still safe and efficient
        batch.forEach(device => {
          const request = store.put(device)
          request.onsuccess = () => {
            completed++
            // Resolve when all operations in this batch complete
            if (completed === batch.length && !hasError) {
              resolve()
            }
          }
          request.onerror = () => {
            if (!hasError) {
              hasError = true
              reject(request.error)
            }
          }
        })
        
        // Fallback: resolve on transaction complete if all operations succeeded
        transaction.oncomplete = () => {
          if (completed === batch.length && !hasError) {
            resolve()
          }
        }
        
        transaction.onerror = () => {
          if (!hasError) {
            hasError = true
            reject(transaction.error)
          }
        }
      })
      
      // Yield to event loop between batches to keep UI responsive
      // Only yield if there are more batches to process
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }
    
    // For incremental updates (not full refresh), remove devices that are no longer present
    if (!isFullRefresh) {
      const existingDevices = await getAllDevices()
      const newDeviceIds = new Set(devices.map(d => d.id))
      const devicesToRemove = existingDevices.filter(d => d.id !== CACHE_META_KEY && !newDeviceIds.has(d.id))
      
      if (devicesToRemove.length > 0) {
        // Delete in batches
        const DELETE_BATCH_SIZE = 2000
        const deleteBatches = Math.ceil(devicesToRemove.length / DELETE_BATCH_SIZE)
        
        for (let i = 0; i < deleteBatches; i++) {
          const start = i * DELETE_BATCH_SIZE
          const end = Math.min(start + DELETE_BATCH_SIZE, devicesToRemove.length)
          const deleteBatch = devicesToRemove.slice(start, end)
          
          await new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite')
            const store = transaction.objectStore(STORE_NAME)
            
            let completed = 0
            let hasError = false
            
            deleteBatch.forEach(device => {
              const request = store.delete(device.id)
              request.onsuccess = () => {
                completed++
                if (completed === deleteBatch.length && !hasError) {
                  resolve()
                }
              }
              request.onerror = () => {
                if (!hasError) {
                  hasError = true
                  reject(request.error)
                }
              }
            })
            
            transaction.oncomplete = () => {
              if (completed === deleteBatch.length && !hasError) {
                resolve()
              }
            }
            
            transaction.onerror = () => {
              if (!hasError) {
                hasError = true
                reject(transaction.error)
              }
            }
          })
          
          if (i < deleteBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, 0))
          }
        }
      }
    }

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

