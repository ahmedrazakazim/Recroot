import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import JobBoard from './pages/JobBoard'
import JobDetail from './pages/JobDetail'
import MyApplications from './pages/MyApplications'
import RecruiterDashboard from './pages/RecruiterDashboard'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<JobBoard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/dashboard" element={<RecruiterDashboard />} />
      </Routes>
    </>
  )
}

export default App