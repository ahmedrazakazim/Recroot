import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('name')
        navigate('/login')
    }

    return (
        <nav className="navbar">
            <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
                Recroot
            </Link>

            <div className="nav-links">
                <Link to="/">Jobs</Link>

                {!token && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}

                {token && role === 'candidate' && (
                    <Link to="/my-applications">My Applications</Link>
                )}

                {token && role === 'recruiter' && (
                    <Link to="/dashboard">Dashboard</Link>
                )}

                {token && role === 'admin' && (
                    <Link to="/dashboard">Admin Panel</Link>
                )}

                {token && (
                    <a href="#" onClick={handleLogout} style={{ color: '#ff5252' }}>
                        Logout
                    </a>
                )}
            </div>
        </nav>
    )
}

export default Navbar