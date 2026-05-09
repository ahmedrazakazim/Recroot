import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Splash from './components/Splash'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import JobBoard from './pages/JobBoard'
import JobDetail from './pages/JobDetail'
import MyApplications from './pages/MyApplications'
import RecruiterDashboard from './pages/RecruiterDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Applicants from './pages/Applicants'
import Notifications from './pages/Notifications'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  const [showApp, setShowApp] = useState(false)

  return (
    <>
      {!showApp && <Splash onFinish={() => setShowApp(true)} />}

      {showApp && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <ScrollToTop />
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<JobBoard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/jobs/:id/applicants" element={<Applicants />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/dashboard" element={<RecruiterDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
          <Footer />
        </div>
      )}
    </>
  )
}

export default App