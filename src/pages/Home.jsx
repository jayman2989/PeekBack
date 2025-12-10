import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 px-2">
          Track Mass Surveillance Devices
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-4 px-2">
          PeekBack is a free, public crowdsourcing platform where people can report 
          and track Flock cameras and other mass surveillance devices in their communities.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 max-w-2xl mx-auto mx-2">
          <p className="text-xs sm:text-sm text-gray-700 text-center">
            <strong>🔒 Privacy First:</strong> We don't track your location, collect personal data, or use tracking cookies. 
            <Link to="/privacy" className="text-green-700 hover:text-green-900 underline ml-1">Learn more about our privacy policy</Link>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
        <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md">
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📍</div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Interactive Map</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Explore reported surveillance devices on an interactive map. 
            See what's being tracked in your area.
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md">
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">➕</div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Submit Reports</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Help build the database by submitting locations of Flock cameras 
            and other surveillance devices you've spotted.
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md">
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🔍</div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Stay Informed</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Access public information about surveillance infrastructure 
            in your community and beyond.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 sm:p-8 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
          Ready to get started?
        </h2>
        <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
          Join the community effort to map surveillance devices and increase transparency.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link 
            to="/submit" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block text-sm sm:text-base"
          >
            Submit a Device
          </Link>
          <Link 
            to="/map" 
            className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block text-sm sm:text-base"
          >
            View Map
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home

