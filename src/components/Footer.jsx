import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/peekback-white-logo-only.png" 
                alt="PeekBack" 
                className="h-6 w-auto brightness-0 invert"
              />
              <h3 className="text-lg font-semibold text-white">PeekBack</h3>
            </div>
            <p className="text-gray-400">
              A free and public crowdsourcing platform for tracking Flock cameras 
              and other mass surveillance devices.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-white">Map</a>
              </li>
              <li>
                <a href="/submit" className="hover:text-white">Submit Device</a>
              </li>
              <li>
                <Link to="/about" className="hover:text-white">About</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
              </li>
              <li>
                <a href="https://github.com/jayman2989/PeekBack" className="hover:text-white">Contribute</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-4 sm:pt-6">
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-blue-100 text-center">
              <strong>🔒 Privacy First:</strong> We don't track your location, collect personal data, or use cookies for tracking. 
              <Link to="/privacy" className="underline ml-1 hover:text-white">Learn more</Link>
            </p>
          </div>
          <div className="text-center text-gray-400 text-xs sm:text-sm">
            <p>&copy; {new Date().getFullYear()} PeekBack. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

