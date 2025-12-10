# PeekBack

A free and public crowdsourcing website for tracking Flock cameras and other mass surveillance devices.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Firebase** - Backend (Firestore, Authentication, Analytics)
- **Leaflet** - Interactive maps

## Project Structure

```
src/
  components/     # Reusable components
  pages/          # Page components
  App.jsx         # Main app component with routing
  main.jsx        # Entry point
  index.css       # Global styles with Tailwind
```

## Firebase Setup

### Firestore Rules

The Firestore security rules are defined in `firestore.rules`. To deploy them:

1. Install Firebase CLI (if not already installed):
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

### Firestore Rules Overview

- **Read access**: Public (anyone can read device data)
- **Create access**: Authenticated users only (including anonymous)
- **Update/Delete access**: Users can only modify their own submissions
- **Validation**: Enforces required fields and data types for device submissions

## Data Sharing & Integration

PeekBack supports data sharing with other surveillance tracking platforms:

### Import from OpenStreetMap

DeFlock (https://github.com/FoggedLens/deflock) uses OpenStreetMap to store ALPR data. You can import their data into PeekBack:

1. Visit `/data` in the app
2. Set the geographic bounds for the region you want to import
3. Click "Import from OSM" to fetch and import ALPR devices from OpenStreetMap

### Export PeekBack Data

Export PeekBack data in multiple formats for sharing:

- **JSON**: Full device data with metadata
- **CSV**: Spreadsheet-compatible format
- **GeoJSON**: Standard geographic data format for mapping tools

Visit `/data` to export data.

### Data Format

PeekBack devices include:
- `type`: Device type (flock, license_plate_reader, traffic_camera, etc.)
- `latitude` / `longitude`: Geographic coordinates
- `address`: Optional address string
- `description`: Optional description
- `thumbsUp`: Community verification count
- `inactiveReports`: Reports of device being removed

## Contributing

This is a public crowdsourcing project. Contributions are welcome!

