// Firebase service functions for PeekBack
// Common operations for managing surveillance device data

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

// Collection name for surveillance devices
const DEVICES_COLLECTION = 'devices';

/**
 * Add a new surveillance device report
 * @param {Object} deviceData - Device information
 * @param {number} deviceData.latitude - Latitude coordinate
 * @param {number} deviceData.longitude - Longitude coordinate
 * @param {string} deviceData.type - Type of device (e.g., 'flock', 'license_plate_reader')
 * @param {string} deviceData.description - Optional description
 * @param {string} deviceData.address - Optional address
 * @param {Object} user - Firebase user object (optional, will be added automatically if provided)
 * @returns {Promise<string>} Document ID of the new device
 */
export async function addDevice(deviceData, user = null) {
  try {
    const deviceDoc = {
      ...deviceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      thumbsUp: 0,
      thumbsUpUsers: [], // Array of user UIDs who have thumbs upped
      inactiveReports: 0,
      inactiveReportUsers: [], // Array of user UIDs who have reported as inactive
    };

    // Add user information if provided
    if (user) {
      deviceDoc.reportedBy = {
        uid: user.uid,
        isAnonymous: user.isAnonymous,
        // Email is NOT stored to protect user privacy
      };
    }

    const docRef = await addDoc(collection(db, DEVICES_COLLECTION), deviceDoc);
    return docRef.id;
  } catch (error) {
    console.error('Error adding device:', error);
    throw error;
  }
}

/**
 * Batch add multiple devices (for bulk imports)
 * @param {Array<Object>} devicesArray - Array of device data objects (should have reportedBy, but timestamps will be added)
 * @param {Array<string>} documentIds - Optional array of document IDs (must match devicesArray length if provided)
 * @returns {Promise<void>}
 */
export async function batchAddDevices(devicesArray, documentIds = null) {
  if (!devicesArray || devicesArray.length === 0) {
    return;
  }

  // Firestore batch limit is 500 operations
  if (devicesArray.length > 500) {
    throw new Error('Batch size exceeds Firestore limit of 500 operations');
  }

  // If documentIds provided, must match length
  if (documentIds && documentIds.length !== devicesArray.length) {
    throw new Error('documentIds array must match devicesArray length');
  }

  try {
    const batch = writeBatch(db);
    const devicesRef = collection(db, DEVICES_COLLECTION);

    devicesArray.forEach((deviceData, index) => {
      // Use provided document ID or create new one
      const docRef = documentIds 
        ? doc(devicesRef, documentIds[index])
        : doc(devicesRef);
      
      // Ensure all required fields are set
      const deviceDoc = {
        ...deviceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        thumbsUp: deviceData.thumbsUp ?? 0,
        thumbsUpUsers: deviceData.thumbsUpUsers ?? [],
        inactiveReports: deviceData.inactiveReports ?? 0,
        inactiveReportUsers: deviceData.inactiveReportUsers ?? [],
      };
      
      // Use set() with merge to update if exists, create if not
      // This prevents duplicates when re-importing
      batch.set(docRef, deviceDoc, { merge: false }); // merge: false means overwrite if exists
    });

    await batch.commit();
  } catch (error) {
    console.error('Error batch adding devices:', error);
    throw error;
  }
}

/**
 * Check if devices with given document IDs already exist
 * @param {Array<string>} documentIds - Array of document IDs to check
 * @returns {Promise<Set<string>>} Set of existing document IDs
 */
export async function checkExistingDevices(documentIds) {
  if (!documentIds || documentIds.length === 0) {
    return new Set();
  }

  try {
    const existingIds = new Set();
    const devicesRef = collection(db, DEVICES_COLLECTION);
    
    // Check documents in parallel batches (Firestore can handle concurrent reads well)
    // We'll check in batches of 100 to avoid overwhelming the connection
    const batchSize = 100;
    
    for (let i = 0; i < documentIds.length; i += batchSize) {
      const batch = documentIds.slice(i, i + batchSize);
      
      // Check each document ID in parallel
      const checkPromises = batch.map(async (docId) => {
        try {
          const docRef = doc(devicesRef, docId);
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? docId : null;
        } catch (error) {
          // If check fails for a specific doc, assume it doesn't exist
          return null;
        }
      });
      
      const results = await Promise.all(checkPromises);
      results.forEach((docId) => {
        if (docId) {
          existingIds.add(docId);
        }
      });
    }

    return existingIds;
  } catch (error) {
    console.error('Error checking existing devices:', error);
    // If check fails, return empty set (will try to import anyway)
    return new Set();
  }
}

/**
 * Get a single device by ID
 * @param {string} deviceId - Document ID
 * @returns {Promise<Object|null>} Device data or null if not found
 */
export async function getDevice(deviceId) {
  try {
    const docRef = doc(db, DEVICES_COLLECTION, deviceId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting device:', error);
    throw error;
  }
}

/**
 * Get all devices
 * @param {Object} options - Query options
 * @param {number} options.limitCount - Maximum number of devices to return (null/undefined = no limit)
 * @param {string} options.orderByField - Field to order by (default: 'createdAt')
 * @param {string} options.orderDirection - 'asc' or 'desc' (default: 'desc')
 * @returns {Promise<Array>} Array of device objects
 */
export async function getAllDevices(options = {}) {
  try {
    const {
      limitCount = null, // Changed default to null to fetch all devices
      orderByField = 'createdAt',
      orderDirection = 'desc',
    } = options;

    let q = query(collection(db, DEVICES_COLLECTION));
    
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    
    // Only apply limit if specified
    if (limitCount !== null && limitCount !== undefined) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting devices:', error);
    throw error;
  }
}

/**
 * Get devices by type
 * @param {string} deviceType - Type of device to filter by
 * @returns {Promise<Array>} Array of device objects
 */
export async function getDevicesByType(deviceType) {
  try {
    const q = query(
      collection(db, DEVICES_COLLECTION),
      where('type', '==', deviceType),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting devices by type:', error);
    throw error;
  }
}

/**
 * Update a device
 * @param {string} deviceId - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateDevice(deviceId, updates) {
  try {
    const docRef = doc(db, DEVICES_COLLECTION, deviceId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating device:', error);
    throw error;
  }
}

/**
 * Delete a device
 * @param {string} deviceId - Document ID
 * @returns {Promise<void>}
 */
export async function deleteDevice(deviceId) {
  try {
    const docRef = doc(db, DEVICES_COLLECTION, deviceId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting device:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for all devices
 * @param {Function} callback - Callback function that receives the devices array
 * @param {Function} errorCallback - Optional error callback function
 * @returns {Function} Unsubscribe function
 */
export function subscribeToDevices(callback, errorCallback) {
  const q = query(
    collection(db, DEVICES_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const devices = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(devices);
  }, (error) => {
    console.error('Error in devices subscription:', error);
    if (errorCallback) {
      errorCallback(error);
    }
  });
}

/**
 * Get devices within a bounding box (viewport-based loading)
 * @param {Object} bounds - Bounding box {south, north, west, east}
 * @param {number} maxDevices - Maximum number of devices to return (default: 10000)
 * @returns {Promise<Array>} Array of device objects within bounds
 */
export async function getDevicesInBounds(bounds, maxDevices = 10000) {
  try {
    // Firestore doesn't support native geospatial queries, so we use range queries
    // This requires a composite index on (latitude, longitude)
    
    // Calculate approximate area to determine if we need to limit results
    const latRange = bounds.north - bounds.south;
    const lonRange = bounds.east - bounds.west;
    const area = latRange * lonRange;
    
    // For very large areas, use a smaller limit to prevent timeouts
    let effectiveLimit = maxDevices;
    if (area > 100) { // Very large area (e.g., entire country)
      effectiveLimit = 5000;
    } else if (area > 10) { // Large area (e.g., state)
      effectiveLimit = 7500;
    }
    
    // Use latitude range as primary filter (more efficient than longitude)
    // Build query step by step to avoid issues
    let q = query(collection(db, DEVICES_COLLECTION));
    q = query(q, where('latitude', '>=', bounds.south));
    q = query(q, where('latitude', '<=', bounds.north));
    q = query(q, orderBy('latitude', 'asc'));
    q = query(q, orderBy('longitude', 'asc'));
    q = query(q, limit(effectiveLimit));

    // Add timeout to prevent hanging
    const queryPromise = getDocs(q);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 10000)
    );
    
    const querySnapshot = await Promise.race([queryPromise, timeoutPromise]);
    
    // Filter by longitude client-side (more accurate)
    const devices = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(device => 
        device.longitude >= bounds.west && 
        device.longitude <= bounds.east &&
        device.latitude >= bounds.south &&
        device.latitude <= bounds.north
      );

    return devices;
  } catch (error) {
    // If composite index doesn't exist or query times out, return empty array
    // Don't fall back to full fetch - that would be too slow with 88k devices
    if (process.env.NODE_ENV === 'development') {
      console.warn('Bounds query failed:', error.message);
    }
    // Return empty array instead of throwing - better UX
    return [];
  }
}

/**
 * Subscribe to real-time updates for a single device
 * @param {string} deviceId - Document ID
 * @param {Function} callback - Callback function that receives the device data
 * @returns {Function} Unsubscribe function
 */
export function subscribeToDevice(deviceId, callback) {
  const docRef = doc(db, DEVICES_COLLECTION, deviceId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error in device subscription:', error);
  });
}

/**
 * Thumbs up a device
 * @param {string} deviceId - Document ID
 * @param {string} userId - User UID
 * @returns {Promise<Object>} Success status and updated counts
 */
export async function thumbsUpDevice(deviceId, userId) {
  try {
    const docRef = doc(db, DEVICES_COLLECTION, deviceId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Device not found');
    }

    const device = docSnap.data();
    const hasThumbsUpped = device.thumbsUpUsers?.includes(userId) || false;

    if (hasThumbsUpped) {
      // Remove thumbs up
      await updateDoc(docRef, {
        thumbsUp: increment(-1),
        thumbsUpUsers: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      });
      return { success: true, action: 'removed', thumbsUp: (device.thumbsUp || 0) - 1 };
    } else {
      // Add thumbs up
      await updateDoc(docRef, {
        thumbsUp: increment(1),
        thumbsUpUsers: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });
      return { success: true, action: 'added', thumbsUp: (device.thumbsUp || 0) + 1 };
    }
  } catch (error) {
    console.error('Error thumbs upping device:', error);
    throw error;
  }
}

/**
 * Report a device as inactive (no longer here)
 * @param {string} deviceId - Document ID
 * @param {string} userId - User UID
 * @returns {Promise<Object>} Success status and updated counts
 */
export async function reportDeviceInactive(deviceId, userId) {
  try {
    const docRef = doc(db, DEVICES_COLLECTION, deviceId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Device not found');
    }

    const device = docSnap.data();
    const hasReportedInactive = device.inactiveReportUsers?.includes(userId) || false;

    if (hasReportedInactive) {
      // Remove inactive report
      await updateDoc(docRef, {
        inactiveReports: increment(-1),
        inactiveReportUsers: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      });
      return { success: true, action: 'removed', inactiveReports: (device.inactiveReports || 0) - 1 };
    } else {
      // Add inactive report
      await updateDoc(docRef, {
        inactiveReports: increment(1),
        inactiveReportUsers: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });
      return { success: true, action: 'added', inactiveReports: (device.inactiveReports || 0) + 1 };
    }
  } catch (error) {
    console.error('Error reporting device inactive:', error);
    throw error;
  }
}

/**
 * Search for address autocomplete suggestions using OpenStreetMap Nominatim
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results (default: 5)
 * @returns {Promise<Array>} Array of address suggestions
 */
export async function searchAddressAutocomplete(query, limit = 5) {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=${limit}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PeekBack/1.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.map(item => ({
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: item.address,
    }));
  } catch (error) {
    console.error('Error searching addresses:', error);
    return [];
  }
}

/**
 * Geocode an address to coordinates using OpenStreetMap Nominatim
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} Geocoded result with lat, lng, and display name
 */
export async function geocodeAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'PeekBack/1.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('Address not found');
    }

    // Return the first result
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      displayName: data[0].display_name,
      address: data[0].address,
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
}

