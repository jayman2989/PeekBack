import L from 'leaflet'

// Create custom SVG icon markers with distinct designs for each device type
function createCustomIcon(type, color) {
  const svgIcon = `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 24 16 24s16-15.163 16-24C32 7.163 24.837 0 16 0z" 
            fill="${color}" 
            filter="url(#shadow)"/>
      <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
    </svg>
  `
  
  return L.divIcon({
    className: 'custom-device-icon',
    html: svgIcon,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}

// Device-specific icons with unique designs
export const deviceIcons = {
  flock: (() => {
    // Camera icon for Flock cameras
    const svgIcon = `
      <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow-flock" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/>
          </filter>
        </defs>
        <path d="M18 0C8.059 0 0 8.059 0 18c0 9.941 18 26 18 26s18-16.059 18-26C36 8.059 27.941 0 18 0z" 
              fill="#EF4444" 
              filter="url(#shadow-flock)"/>
        <rect x="10" y="12" width="16" height="12" rx="2" fill="white" opacity="0.95"/>
        <circle cx="18" cy="18" r="4" fill="#EF4444"/>
        <circle cx="18" cy="18" r="2" fill="white"/>
      </svg>
    `
    return L.divIcon({
      className: 'custom-device-icon flock-icon',
      html: svgIcon,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
    })
  })(),
  
  license_plate_reader: (() => {
    // Rectangle/barcode icon for license plate readers
    const svgIcon = `
      <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow-lpr" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/>
          </filter>
        </defs>
        <path d="M18 0C8.059 0 0 8.059 0 18c0 9.941 18 26 18 26s18-16.059 18-26C36 8.059 27.941 0 18 0z" 
              fill="#3B82F6" 
              filter="url(#shadow-lpr)"/>
        <rect x="8" y="14" width="20" height="8" rx="1" fill="white" opacity="0.95"/>
        <line x1="10" y1="16" x2="26" y2="16" stroke="#3B82F6" stroke-width="1"/>
        <line x1="10" y1="18" x2="26" y2="18" stroke="#3B82F6" stroke-width="1"/>
        <line x1="10" y1="20" x2="26" y2="20" stroke="#3B82F6" stroke-width="1"/>
      </svg>
    `
    return L.divIcon({
      className: 'custom-device-icon lpr-icon',
      html: svgIcon,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
    })
  })(),
  
  traffic_camera: (() => {
    // Traffic light/circle icon for traffic cameras
    const svgIcon = `
      <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow-traffic" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/>
          </filter>
        </defs>
        <path d="M18 0C8.059 0 0 8.059 0 18c0 9.941 18 26 18 26s18-16.059 18-26C36 8.059 27.941 0 18 0z" 
              fill="#F59E0B" 
              filter="url(#shadow-traffic)"/>
        <rect x="12" y="12" width="12" height="12" rx="2" fill="white" opacity="0.95"/>
        <circle cx="15" cy="15" r="2" fill="#EF4444"/>
        <circle cx="21" cy="15" r="2" fill="#F59E0B"/>
        <circle cx="18" cy="21" r="2" fill="#10B981"/>
      </svg>
    `
    return L.divIcon({
      className: 'custom-device-icon traffic-icon',
      html: svgIcon,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
    })
  })(),
  
  security_camera: (() => {
    // Dome/eye icon for security cameras
    const svgIcon = `
      <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow-security" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/>
          </filter>
        </defs>
        <path d="M18 0C8.059 0 0 8.059 0 18c0 9.941 18 26 18 26s18-16.059 18-26C36 8.059 27.941 0 18 0z" 
              fill="#10B981" 
              filter="url(#shadow-security)"/>
        <ellipse cx="18" cy="16" rx="10" ry="8" fill="white" opacity="0.95"/>
        <ellipse cx="18" cy="16" rx="8" ry="6" fill="#10B981" opacity="0.3"/>
        <circle cx="18" cy="16" r="4" fill="#10B981"/>
        <circle cx="18" cy="16" r="2" fill="white"/>
      </svg>
    `
    return L.divIcon({
      className: 'custom-device-icon security-icon',
      html: svgIcon,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
    })
  })(),
  
  other: (() => {
    // Question mark icon for other devices
    const svgIcon = `
      <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow-other" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/>
          </filter>
        </defs>
        <path d="M18 0C8.059 0 0 8.059 0 18c0 9.941 18 26 18 26s18-16.059 18-26C36 8.059 27.941 0 18 0z" 
              fill="#8B5CF6" 
              filter="url(#shadow-other)"/>
        <circle cx="18" cy="18" r="8" fill="white" opacity="0.95"/>
        <text x="18" y="22" font-family="Arial, sans-serif" font-size="14" font-weight="bold" 
              fill="#8B5CF6" text-anchor="middle">?</text>
      </svg>
    `
    return L.divIcon({
      className: 'custom-device-icon other-icon',
      html: svgIcon,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
    })
  })(),
}

