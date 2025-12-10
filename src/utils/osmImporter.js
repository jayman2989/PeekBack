/**
 * Utility to import surveillance device data from OpenStreetMap
 * DeFlock uses OSM tags to mark ALPRs, we can query and import them
 * 
 * Rate Limits:
 * - Overpass API: ~1 request per second (public instances)
 * - Firestore: 10,000 writes/second (but batch writes are more efficient)
 */

/**
 * Split a large bounding box into smaller chunks
 * @param {Object} bounds - Bounding box {south, west, north, east}
 * @param {number} chunksPerDimension - Number of chunks per lat/lon dimension
 * @returns {Array<Object>} Array of smaller bounding boxes
 */
export function splitBoundingBox(bounds, chunksPerDimension = 3) {
  const latRange = bounds.north - bounds.south;
  const lonRange = bounds.east - bounds.west;
  const latChunkSize = latRange / chunksPerDimension;
  const lonChunkSize = lonRange / chunksPerDimension;

  const chunks = [];
  for (let i = 0; i < chunksPerDimension; i++) {
    for (let j = 0; j < chunksPerDimension; j++) {
      chunks.push({
        south: bounds.south + (i * latChunkSize),
        north: bounds.south + ((i + 1) * latChunkSize),
        west: bounds.west + (j * lonChunkSize),
        east: bounds.west + ((j + 1) * lonChunkSize),
      });
    }
  }
  return chunks;
}

/**
 * Query OpenStreetMap Overpass API for ALPR devices with retry logic
 * @param {Object} bounds - Bounding box {south, west, north, east}
 * @param {Function} progressCallback - Optional callback for progress updates
 * @param {number} retryCount - Current retry attempt (internal use)
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<Array>} Array of OSM nodes with ALPR data
 */
export async function queryOSMALPRs(bounds = null, progressCallback = null, retryCount = 0, maxRetries = 3) {
  // Default to a reasonable bounding box if none provided
  const bbox = bounds 
    ? `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`
    : '-90,-180,90,180'; // Worldwide (can be slow, better to use specific regions)

  // OSM tags for surveillance devices (ALPRs, cameras, etc.)
  // Query for all surveillance devices, not just ALPRs, so we can properly categorize by brand
  const overpassQuery = `
    [out:json][timeout:180];
    (
      node["man_made"="surveillance"](${bbox});
      node["surveillance"](${bbox});
      node["surveillance:type"](${bbox});
      way["man_made"="surveillance"](${bbox});
      way["surveillance"](${bbox});
      way["surveillance:type"](${bbox});
      relation["man_made"="surveillance"](${bbox});
      relation["surveillance"](${bbox});
      relation["surveillance:type"](${bbox});
    );
    out center meta;
  `;

  try {
    if (progressCallback && retryCount === 0) {
      progressCallback({ status: 'querying', message: 'Querying OpenStreetMap...' });
    } else if (progressCallback && retryCount > 0) {
      progressCallback({ status: 'retrying', message: `Retrying query (attempt ${retryCount + 1}/${maxRetries + 1})...` });
    }

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      // Check for rate limiting or gateway timeout
      if (response.status === 429 || response.status === 503) {
        if (retryCount < maxRetries) {
          // Exponential backoff: wait longer with each retry
          const waitTime = Math.min(5000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
          if (progressCallback) {
            progressCallback({ 
              status: 'waiting', 
              message: `Rate limited. Waiting ${Math.round(waitTime / 1000)} seconds before retry...` 
            });
          }
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return queryOSMALPRs(bounds, progressCallback, retryCount + 1, maxRetries);
        }
        throw new Error('Rate limit exceeded after multiple retries. Please try again later with a smaller region.');
      }
      
      // Gateway timeout (504) or other server errors
      if (response.status === 504 || response.status >= 500) {
        if (retryCount < maxRetries) {
          const waitTime = Math.min(3000 * Math.pow(2, retryCount), 20000); // Max 20 seconds
          if (progressCallback) {
            progressCallback({ 
              status: 'waiting', 
              message: `Server timeout. Waiting ${Math.round(waitTime / 1000)} seconds before retry...` 
            });
          }
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return queryOSMALPRs(bounds, progressCallback, retryCount + 1, maxRetries);
        }
        throw new Error(`Server error (${response.status}): ${response.statusText}. Please try again with a smaller region.`);
      }
      
      throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data = await response.json();
    const elements = data.elements || [];
    
    if (progressCallback) {
      progressCallback({ status: 'complete', message: `Found ${elements.length} devices`, count: elements.length });
    }

    return elements;
  } catch (error) {
    // Network errors or JSON parsing errors
    if (retryCount < maxRetries && (error.message.includes('fetch') || error.message.includes('JSON'))) {
      const waitTime = Math.min(2000 * Math.pow(2, retryCount), 10000);
      if (progressCallback) {
        progressCallback({ 
          status: 'waiting', 
          message: `Network error. Waiting ${Math.round(waitTime / 1000)} seconds before retry...` 
        });
      }
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return queryOSMALPRs(bounds, progressCallback, retryCount + 1, maxRetries);
    }
    
    if (progressCallback) {
      progressCallback({ status: 'error', message: error.message });
    }
    console.error('Error querying OSM:', error);
    throw error;
  }
}

/**
 * Query OSM in batches (splits large regions into smaller chunks)
 * @param {Object} bounds - Bounding box {south, west, north, east}
 * @param {number} chunksPerDimension - Number of chunks per dimension (default: 3 = 9 total chunks)
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<Array>} Combined array of all OSM elements
 */
export async function queryOSMALPRsBatched(bounds, chunksPerDimension = 3, progressCallback = null) {
  const chunks = splitBoundingBox(bounds, chunksPerDimension);
  const allElements = [];
  const totalChunks = chunks.length;
  const failedChunks = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    if (progressCallback) {
      progressCallback({
        status: 'querying',
        message: `Querying chunk ${i + 1} of ${totalChunks}...`,
        progress: ((i + 1) / totalChunks) * 50, // First 50% is querying
      });
    }

    try {
      // Increased delay between requests: 2.5 seconds (more conservative to avoid rate limits)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2500));
      }

      // Use a minimal progress callback for individual chunks
      const chunkCallback = (progress) => {
        if (progressCallback && progress.status === 'waiting') {
          progressCallback({
            status: 'waiting',
            message: `Chunk ${i + 1}: ${progress.message}`,
            progress: ((i + 1) / totalChunks) * 50,
          });
        }
      };

      const elements = await queryOSMALPRs(chunk, chunkCallback);
      allElements.push(...elements);
    } catch (error) {
      console.error(`Error querying chunk ${i + 1}:`, error);
      failedChunks.push({ chunk: i + 1, error: error.message });
      
      // If rate limited or gateway timeout, wait longer before continuing
      if (error.message.includes('Rate limit') || error.message.includes('timeout') || error.message.includes('Gateway')) {
        const waitTime = error.message.includes('Rate limit') ? 10000 : 5000; // 10s for rate limit, 5s for timeout
        if (progressCallback) {
          progressCallback({
            status: 'waiting',
            message: `Waiting ${waitTime / 1000}s before next chunk due to ${error.message.includes('Rate limit') ? 'rate limit' : 'timeout'}...`,
            progress: ((i + 1) / totalChunks) * 50,
          });
        }
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      // Continue with other chunks even if one fails
    }
  }

  // Remove duplicates (same OSM ID)
  const uniqueElements = Array.from(
    new Map(allElements.map(el => [el.id, el])).values()
  );

  if (progressCallback) {
    const successCount = totalChunks - failedChunks.length;
    let message = `Found ${uniqueElements.length} unique devices from ${successCount} of ${totalChunks} chunks`;
    if (failedChunks.length > 0) {
      message += ` (${failedChunks.length} chunks failed)`;
    }
    progressCallback({
      status: failedChunks.length > 0 ? 'partial' : 'complete',
      message,
      count: uniqueElements.length,
      failedChunks: failedChunks.length > 0 ? failedChunks : undefined,
    });
  }

  return uniqueElements;
}

/**
 * Convert OSM element to PeekBack device format
 * @param {Object} osmElement - OSM node/way/relation
 * @returns {Object|null} Device data in PeekBack format, or null if invalid
 */
export function convertOSMToPeekBack(osmElement) {
  // OSM elements can be nodes, ways, or relations
  // For nodes: use lat/lon directly
  // For ways/relations: use center coordinates
  let latitude, longitude;

  if (osmElement.type === 'node') {
    latitude = osmElement.lat;
    longitude = osmElement.lon;
  } else if (osmElement.center) {
    latitude = osmElement.center.lat;
    longitude = osmElement.center.lon;
  } else {
    return null; // Can't determine location
  }

  // Extract device type from OSM tags
  const tags = osmElement.tags || {};
  let deviceType = 'other'; // Default fallback
  
  // Priority order: Check brand/operator first, then surveillance type
  // This ensures Flock cameras are categorized correctly even if tagged as ALPR
  
  // Check for Flock cameras (brand takes priority)
  const brand = tags.brand?.toLowerCase() || ''
  const operator = tags.operator?.toLowerCase() || ''
  const manufacturer = tags.manufacturer?.toLowerCase() || ''
  
  if (brand.includes('flock') || operator.includes('flock') || manufacturer.includes('flock')) {
    deviceType = 'flock';
  }
  // Check for other specific brands that are ALPRs
  else if (brand.includes('vigilant') || brand.includes('motorola') || brand.includes('genetec') || 
           operator.includes('vigilant') || operator.includes('motorola') || operator.includes('genetec')) {
    deviceType = 'license_plate_reader';
  }
  // Check surveillance type tags
  else if (tags['surveillance:type'] === 'ALPR' || tags.surveillance === 'ALPR' || 
           tags['surveillance:type'] === 'alpr' || tags.surveillance === 'alpr') {
    deviceType = 'license_plate_reader';
  }
  else if (tags['surveillance:type'] === 'camera' || tags.surveillance === 'camera' ||
           tags['surveillance:type'] === 'Camera' || tags.surveillance === 'Camera') {
    deviceType = 'security_camera';
  }
  else if (tags['surveillance:type'] === 'traffic' || tags.surveillance === 'traffic' ||
           tags['surveillance:type'] === 'Traffic' || tags.surveillance === 'Traffic') {
    deviceType = 'traffic_camera';
  }
  // Check for man_made=surveillance without specific type (default to security camera)
  else if (tags['man_made'] === 'surveillance') {
    deviceType = 'security_camera';
  }

  // Build description from OSM tags
  const descriptionParts = [];
  if (tags.brand) descriptionParts.push(`Brand: ${tags.brand}`);
  if (tags.manufacturer) descriptionParts.push(`Manufacturer: ${tags.manufacturer}`);
  if (tags.operator) descriptionParts.push(`Operator: ${tags.operator}`);
  if (tags['surveillance:type']) descriptionParts.push(`Type: ${tags['surveillance:type']}`);
  if (tags.surveillance) descriptionParts.push(`Surveillance: ${tags.surveillance}`);
  if (tags.direction) descriptionParts.push(`Direction: ${tags.direction}`);
  if (tags.note) descriptionParts.push(tags.note);
  if (tags.description) descriptionParts.push(tags.description);
  
  const description = descriptionParts.length > 0 
    ? descriptionParts.join(' | ') 
    : null;

  // Build address from OSM tags or use name
  const address = tags['addr:full'] || 
                  (tags['addr:street'] && tags['addr:city'] 
                    ? `${tags['addr:street']}, ${tags['addr:city']}` 
                    : tags.name) || 
                  null;

  return {
    type: deviceType,
    latitude,
    longitude,
    address,
    description,
    // Metadata to track that this came from OSM
    source: 'osm',
    osmId: osmElement.id,
    osmType: osmElement.type,
    importedAt: new Date().toISOString(),
  };
}

/**
 * Generate a Firestore document ID from OSM ID and type
 * OSM IDs can be negative (local/temporary), so we prefix with type
 * @param {number} osmId - OSM element ID
 * @param {string} osmType - OSM element type (node, way, relation)
 * @returns {string} Firestore-safe document ID
 */
export function generateOSMDocumentId(osmId, osmType) {
  // OSM IDs can be negative, so we create a safe string ID
  // Format: osm_{type}_{id} (e.g., osm_node_12345 or osm_way_-123)
  return `osm_${osmType}_${osmId}`;
}

/**
 * Batch import OSM data into PeekBack using Firestore batch writes
 * @param {Array} osmElements - Array of OSM elements
 * @param {Function} batchAddDevices - Function to batch add devices (from services)
 * @param {Object} user - Firebase user object (for attribution)
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<Object>} Import results
 */
export async function importOSMData(osmElements, batchAddDevices, user, progressCallback = null) {
  const results = {
    total: osmElements.length,
    imported: 0,
    skipped: 0,
    errors: 0,
    errorsList: [],
  };

  // Convert OSM elements to PeekBack format and generate document IDs
  const devicesToImport = [];
  const documentIds = [];
  
  if (progressCallback) {
    progressCallback({ status: 'converting', message: 'Converting OSM data...', progress: 0 });
  }

  for (let i = 0; i < osmElements.length; i++) {
    const element = osmElements[i];
    const deviceData = convertOSMToPeekBack(element);
    
    if (!deviceData) {
      results.skipped++;
      continue;
    }

    // Generate document ID from OSM ID to prevent duplicates
    const documentId = generateOSMDocumentId(deviceData.osmId, deviceData.osmType);

    // Remove metadata fields that shouldn't be in Firestore (but keep osmId for reference)
    const { source, osmType, importedAt, ...firestoreData } = deviceData;
    
    devicesToImport.push({
      ...firestoreData,
      // Store osmId in the document for reference (not as metadata)
      osmId: deviceData.osmId,
      reportedBy: {
        uid: user.uid,
        isAnonymous: user.isAnonymous,
        // Email is NOT stored to protect user privacy
      },
      thumbsUp: 0,
      thumbsUpUsers: [],
      inactiveReports: 0,
      inactiveReportUsers: [],
    });
    
    documentIds.push(documentId);

    if (progressCallback && i % 100 === 0) {
      progressCallback({
        status: 'converting',
        message: `Converting ${i + 1} of ${osmElements.length}...`,
        progress: ((i + 1) / osmElements.length) * 50, // First 50% is conversion
      });
    }
  }

  if (progressCallback) {
    progressCallback({
      status: 'importing',
      message: `Importing ${devicesToImport.length} devices...`,
      progress: 50,
    });
  }

  // Batch write to Firestore (500 documents per batch - Firestore limit)
  // Using set() with document IDs will create or update - no need to check first
  const BATCH_SIZE = 500;
  const totalBatches = Math.ceil(devicesToImport.length / BATCH_SIZE);

  for (let i = 0; i < devicesToImport.length; i += BATCH_SIZE) {
    const batch = devicesToImport.slice(i, i + BATCH_SIZE);
    const batchIds = documentIds.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    try {
      await batchAddDevices(batch, batchIds);
      results.imported += batch.length;

      if (progressCallback) {
        const progress = 50 + ((batchNumber / totalBatches) * 50); // Second 50% is importing
        progressCallback({
          status: 'importing',
          message: `Imported batch ${batchNumber} of ${totalBatches} (${results.imported} total)`,
          progress,
        });
      }

      // Small delay between batches to avoid overwhelming Firestore
      if (i + BATCH_SIZE < devicesToImport.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      // If batch fails, log error but continue
      console.error(`Error importing batch ${batchNumber}:`, error);
      
      results.errors += batch.length;
      results.errorsList.push({
        error: error.message,
        batch: batchNumber,
        count: batch.length,
      });
    }
  }

  if (progressCallback) {
    progressCallback({
      status: 'complete',
      message: `Import complete: ${results.imported} imported, ${results.skipped} skipped, ${results.errors} errors`,
      progress: 100,
    });
  }

  return results;
}

