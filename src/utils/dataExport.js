/**
 * Utility to export PeekBack data for sharing with other platforms
 * Can export to JSON, CSV, or OSM format
 */

import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

const DEVICES_COLLECTION = 'devices';

/**
 * Export all devices as JSON
 * @returns {Promise<string>} JSON string of all devices
 */
export async function exportToJSON() {
  try {
    const querySnapshot = await getDocs(collection(db, DEVICES_COLLECTION));
    const devices = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings for JSON
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
    }));

    return JSON.stringify(devices, null, 2);
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw error;
  }
}

/**
 * Export devices as CSV
 * @returns {Promise<string>} CSV string
 */
export async function exportToCSV() {
  try {
    const querySnapshot = await getDocs(collection(db, DEVICES_COLLECTION));
    const devices = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (devices.length === 0) {
      return 'No devices to export';
    }

    // CSV headers
    const headers = ['id', 'type', 'latitude', 'longitude', 'address', 'description', 'thumbsUp', 'inactiveReports', 'createdAt'];
    const rows = devices.map(device => {
      const row = headers.map(header => {
        const value = device[header];
        // Handle null/undefined
        if (value === null || value === undefined) return '';
        // Handle objects (like timestamps)
        if (typeof value === 'object') {
          if (value.toDate) return value.toDate().toISOString();
          return JSON.stringify(value);
        }
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
}

/**
 * Export devices in GeoJSON format (for mapping tools)
 * @returns {Promise<string>} GeoJSON string
 */
export async function exportToGeoJSON() {
  try {
    const querySnapshot = await getDocs(collection(db, DEVICES_COLLECTION));
    const devices = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const features = devices
      .filter(device => device.latitude != null && device.longitude != null)
      .map(device => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [device.longitude, device.latitude], // GeoJSON uses [lon, lat]
        },
        properties: {
          id: device.id,
          type: device.type,
          address: device.address || null,
          description: device.description || null,
          thumbsUp: device.thumbsUp || 0,
          inactiveReports: device.inactiveReports || 0,
          createdAt: device.createdAt?.toDate?.()?.toISOString() || device.createdAt,
        },
      }));

    const geoJSON = {
      type: 'FeatureCollection',
      features,
    };

    return JSON.stringify(geoJSON, null, 2);
  } catch (error) {
    console.error('Error exporting to GeoJSON:', error);
    throw error;
  }
}

/**
 * Download data as a file
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type (e.g., 'application/json', 'text/csv')
 */
export function downloadFile(content, filename, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

