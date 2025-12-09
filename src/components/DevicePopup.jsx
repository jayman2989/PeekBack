import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { thumbsUpDevice, reportDeviceInactive } from '../firebase/services'

function DevicePopup({ device, deviceTypeLabels }) {
  const { currentUser } = useAuth()
  const [thumbsUp, setThumbsUp] = useState(device.thumbsUp || 0)
  const [inactiveReports, setInactiveReports] = useState(device.inactiveReports || 0)
  const [hasThumbsUpped, setHasThumbsUpped] = useState(false)
  const [hasReportedInactive, setHasReportedInactive] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

  useEffect(() => {
    if (currentUser && device.thumbsUpUsers) {
      setHasThumbsUpped(device.thumbsUpUsers.includes(currentUser.uid))
    }
    if (currentUser && device.inactiveReportUsers) {
      setHasReportedInactive(device.inactiveReportUsers.includes(currentUser.uid))
    }
    setThumbsUp(device.thumbsUp || 0)
    setInactiveReports(device.inactiveReports || 0)
  }, [device, currentUser])

  const handleThumbsUp = async () => {
    if (!currentUser || isVoting) return
    
    setIsVoting(true)
    try {
      const result = await thumbsUpDevice(device.id, currentUser.uid)
      setThumbsUp(result.thumbsUp)
      setHasThumbsUpped(result.action === 'added')
    } catch (error) {
      console.error('Error thumbs upping:', error)
      alert('Failed to update vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  const handleReportInactive = async () => {
    if (!currentUser || isVoting) return
    
    setIsVoting(true)
    try {
      const result = await reportDeviceInactive(device.id, currentUser.uid)
      setInactiveReports(result.inactiveReports)
      setHasReportedInactive(result.action === 'added')
    } catch (error) {
      console.error('Error reporting inactive:', error)
      alert('Failed to report. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const isInactive = (inactiveReports || 0) > 0

  return (
    <div className="min-w-[240px]">
      {isInactive && (
        <div className="mb-2 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
          ⚠️ {inactiveReports} report{inactiveReports !== 1 ? 's' : ''} as inactive
        </div>
      )}
      
      <h3 className="font-semibold text-lg mb-2">
        {deviceTypeLabels[device.type] || 'Unknown Device'}
      </h3>
      
      {device.address && (
        <p className="text-sm text-gray-600 mb-2">
          📍 {device.address}
        </p>
      )}
      
      {device.description && (
        <p className="text-sm text-gray-700 mb-3">
          {device.description}
        </p>
      )}
      
      <div className="flex gap-2 mb-3">
        <button
          onClick={handleThumbsUp}
          disabled={!currentUser || isVoting}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            hasThumbsUpped
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span>👍</span>
          <span>{thumbsUp || 0}</span>
        </button>
        
        <button
          onClick={handleReportInactive}
          disabled={!currentUser || isVoting}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            hasReportedInactive
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span>❌</span>
          <span>Not Here</span>
        </button>
      </div>
      
      <div className="text-xs text-gray-500 space-y-1 border-t pt-2">
        <p>Coordinates: {device.latitude.toFixed(6)}, {device.longitude.toFixed(6)}</p>
        {device.createdAt && (
          <p>Reported: {formatDate(device.createdAt)}</p>
        )}
      </div>
    </div>
  )
}

export default DevicePopup

