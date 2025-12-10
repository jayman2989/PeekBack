import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Submit from './pages/Submit'
import Map from './pages/Map'
import Privacy from './pages/Privacy'
import About from './pages/About'
import AboutDevices from './pages/AboutDevices'
import DataManagement from './pages/DataManagement'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/map" element={<Map />} />
          <Route path="/*" element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/submit" element={<Submit />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/devices" element={<AboutDevices />} />
                  <Route path="/data" element={<DataManagement />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

