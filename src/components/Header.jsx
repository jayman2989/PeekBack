import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Header() {
  const { currentUser } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img 
              src="/peekback-white-logo-only.png" 
              alt="PeekBack" 
              className="h-6 sm:h-8 w-auto brightness-0"
            />
            <span className="text-xl sm:text-2xl font-bold text-gray-800">PeekBack</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link to="/map" className="text-gray-700 hover:text-gray-900 font-medium text-sm lg:text-base">
              Map
            </Link>
            <Link to="/submit" className="text-gray-700 hover:text-gray-900 font-medium text-sm lg:text-base">
              Submit
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-gray-900 font-medium text-sm lg:text-base">
              About
            </Link>
            <Link to="/privacy" className="text-gray-700 hover:text-gray-900 font-medium text-sm lg:text-base">
              Privacy
            </Link>
            {currentUser && (
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600 ml-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="hidden lg:inline">
                  {currentUser.isAnonymous ? 'Guest' : currentUser.email || 'Signed in'}
                </span>
                <span className="lg:hidden">Guest</span>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-3 pt-4">
              <Link
                to="/map"
                className="text-gray-700 hover:text-gray-900 font-medium py-2 px-2 rounded-md hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Map
              </Link>
              <Link
                to="/submit"
                className="text-gray-700 hover:text-gray-900 font-medium py-2 px-2 rounded-md hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Submit
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-gray-900 font-medium py-2 px-2 rounded-md hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/privacy"
                className="text-gray-700 hover:text-gray-900 font-medium py-2 px-2 rounded-md hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Privacy
              </Link>
              {currentUser && (
                <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 px-2 border-t border-gray-100">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>{currentUser.isAnonymous ? 'Guest' : currentUser.email || 'Signed in'}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header

