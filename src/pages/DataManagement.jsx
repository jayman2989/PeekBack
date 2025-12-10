import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { addDevice, getAllDevices } from '../firebase/services'
import { queryOSMALPRsBatched, importOSMData } from '../utils/osmImporter'
import { batchAddDevices } from '../firebase/services'
import { exportToJSON, exportToCSV, exportToGeoJSON, downloadFile } from '../utils/dataExport'
import RegionPicker from '../components/RegionPicker'

function DataManagement() {
  const { currentUser } = useAuth()
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResults, setImportResults] = useState(null)
  const [importProgress, setImportProgress] = useState(null)
  const [useBatchedQuery, setUseBatchedQuery] = useState(true)
  const [importRegion, setImportRegion] = useState({
    south: 40.5,
    west: -74.3,
    north: 40.9,
    east: -73.7,
  }) // Default: NYC area

  const handleImportOSM = async () => {
    if (!currentUser) {
      alert('Please sign in to import data')
      return
    }

    setImporting(true)
    setImportResults(null)
    setImportProgress({ status: 'starting', message: 'Starting import...', progress: 0 })

    try {
      // Query OSM for ALPRs in the specified region
      // Use batched query for large regions to avoid rate limits
      const progressCallback = (progress) => {
        setImportProgress(progress)
      }

      const osmElements = useBatchedQuery
        ? await queryOSMALPRsBatched(importRegion, 3, progressCallback)
        : await queryOSMALPRs(importRegion, progressCallback)
      
      if (osmElements.length === 0) {
        setImportResults({
          total: 0,
          imported: 0,
          skipped: 0,
          errors: 0,
          message: 'No ALPR devices found in this region on OpenStreetMap',
        })
        setImporting(false)
        setImportProgress(null)
        return
      }

      // Import the data using batch writes
      const results = await importOSMData(osmElements, batchAddDevices, currentUser, progressCallback)
      setImportResults(results)
    } catch (error) {
      console.error('Import error:', error)
      setImportResults({
        total: 0,
        imported: 0,
        skipped: 0,
        errors: 1,
        errorsList: [{ error: error.message }],
        message: `Import failed: ${error.message}`,
      })
    } finally {
      setImporting(false)
      setImportProgress(null)
    }
  }

  const handleExport = async (format) => {
    setExporting(true)
    try {
      let content, filename, mimeType;

      switch (format) {
        case 'json':
          content = await exportToJSON()
          filename = `peekback-devices-${new Date().toISOString().split('T')[0]}.json`
          mimeType = 'application/json'
          break
        case 'csv':
          content = await exportToCSV()
          filename = `peekback-devices-${new Date().toISOString().split('T')[0]}.csv`
          mimeType = 'text/csv'
          break
        case 'geojson':
          content = await exportToGeoJSON()
          filename = `peekback-devices-${new Date().toISOString().split('T')[0]}.geojson`
          mimeType = 'application/geo+json'
          break
        default:
          throw new Error('Unknown export format')
      }

      downloadFile(content, filename, mimeType)
    } catch (error) {
      console.error('Export error:', error)
      alert(`Export failed: ${error.message}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
        Data Management
      </h1>
      <p className="text-sm sm:text-base text-gray-600 mb-8">
        {process.env.NODE_ENV === 'development' 
          ? 'Import data from OpenStreetMap (used by DeFlock) or export PeekBack data for sharing.'
          : 'Export PeekBack data for sharing with other platforms.'}
      </p>

      {/* Import Section - Only in Development */}
      {process.env.NODE_ENV === 'development' && (
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Import from OpenStreetMap</h2>
        <p className="text-sm text-gray-600 mb-4">
          Import ALPR devices from OpenStreetMap. DeFlock stores its data in OSM, so this will import their data.
        </p>

        {/* Map Region Picker */}
        <div className="mb-6">
          <RegionPicker
            bounds={importRegion}
            onBoundsChange={(newBounds) => {
              if (newBounds) {
                setImportRegion(newBounds)
              } else {
                setImportRegion({
                  south: 40.5,
                  west: -74.3,
                  north: 40.9,
                  east: -73.7,
                })
              }
            }}
            height="350px"
          />
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Or enter coordinates manually:</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              South (Latitude)
            </label>
            <input
              type="number"
              step="any"
              value={isNaN(importRegion.south) ? '' : importRegion.south}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setImportRegion({ ...importRegion, south: isNaN(val) ? importRegion.south : val });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              North (Latitude)
            </label>
            <input
              type="number"
              step="any"
              value={isNaN(importRegion.north) ? '' : importRegion.north}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setImportRegion({ ...importRegion, north: isNaN(val) ? importRegion.north : val });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              West (Longitude)
            </label>
            <input
              type="number"
              step="any"
              value={isNaN(importRegion.west) ? '' : importRegion.west}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setImportRegion({ ...importRegion, west: isNaN(val) ? importRegion.west : val });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              East (Longitude)
            </label>
            <input
              type="number"
              step="any"
              value={isNaN(importRegion.east) ? '' : importRegion.east}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setImportRegion({ ...importRegion, east: isNaN(val) ? importRegion.east : val });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={useBatchedQuery}
              onChange={(e) => setUseBatchedQuery(e.target.checked)}
              className="rounded"
            />
            <span>Use batched queries (recommended for large regions - splits into smaller chunks to avoid rate limits)</span>
          </label>
        </div>

        {importProgress && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">{importProgress.message}</span>
              {importProgress.progress !== undefined && (
                <span className="text-sm text-blue-700">{Math.round(importProgress.progress)}%</span>
              )}
            </div>
            {importProgress.progress !== undefined && (
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress.progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleImportOSM}
          disabled={importing || !currentUser}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {importing ? 'Importing...' : 'Import from OSM'}
        </button>

        {importResults && (
          <div className={`mt-4 p-4 rounded-lg ${
            importResults.errors > 0 || importResults.failedChunks ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
          }`}>
            <p className="text-sm font-medium mb-2">
              Import Results: {importResults.imported} imported, {importResults.skipped} skipped, {importResults.errors} errors
            </p>
            {importResults.message && (
              <p className="text-sm text-gray-600">{importResults.message}</p>
            )}
            {importResults.failedChunks && importResults.failedChunks.length > 0 && (
              <div className="mt-2 p-2 bg-yellow-100 rounded">
                <p className="text-xs font-medium text-yellow-900 mb-1">Failed Chunks:</p>
                <ul className="text-xs text-yellow-800 list-disc list-inside">
                  {importResults.failedChunks.map((failed, idx) => (
                    <li key={idx}>Chunk {failed.chunk}: {failed.error}</li>
                  ))}
                </ul>
                <p className="text-xs text-yellow-800 mt-2">
                  You can retry the import - it will skip already imported devices and only fetch missing chunks.
                </p>
              </div>
            )}
            {importResults.errorsList && importResults.errorsList.length > 0 && (
              <details className="mt-2">
                <summary className="text-sm cursor-pointer text-gray-700">View individual errors</summary>
                <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
                  {importResults.errorsList.map((err, idx) => (
                    <li key={idx}>{err.osmId || 'Unknown'}: {err.error}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
      )}

      {/* Export Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Export PeekBack Data</h2>
        <p className="text-sm text-gray-600 mb-4">
          Export all PeekBack device data in various formats for sharing with other platforms.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {exporting ? 'Exporting...' : 'Export JSON'}
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => handleExport('geojson')}
            disabled={exporting}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {exporting ? 'Exporting...' : 'Export GeoJSON'}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Exported data can be shared with DeFlock or other surveillance tracking platforms.
        </p>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">About Data Sharing</h3>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>DeFlock uses OpenStreetMap as its data source (MIT licensed)</li>
          <li>You can import their data via OSM Overpass API</li>
          <li>You can export PeekBack data to share with other platforms</li>
          <li>All data sharing respects privacy and attribution requirements</li>
        </ul>
      </div>
    </div>
  )
}

export default DataManagement

