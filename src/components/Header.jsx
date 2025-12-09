import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Header() {
  const { currentUser } = useAuth()

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="/peekback-white-logo-only.png" 
              alt="PeekBack" 
              className="h-8 w-auto brightness-0"
            />
            <span className="text-2xl font-bold text-gray-800">PeekBack</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/map" className="text-gray-700 hover:text-gray-900 font-medium">
              Map
            </Link>
            <Link to="/submit" className="text-gray-700 hover:text-gray-900 font-medium">
              Submit
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-gray-900 font-medium">
              About
            </Link>
            <Link to="/privacy" className="text-gray-700 hover:text-gray-900 font-medium">
              Privacy
            </Link>
            {currentUser && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>
                  {currentUser.isAnonymous ? 'Guest' : currentUser.email || 'Signed in'}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header

