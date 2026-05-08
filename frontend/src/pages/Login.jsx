import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const res = await axios.post(`${API}/login`, { email, password })
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('role', res.data.user.role)
            localStorage.setItem('name', res.data.user.name)
            navigate('/')
            window.location.reload()
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed')
        }
    }

    return (
        <div className="page-container">
            <div className="glass-card">
                <h2 style={{ textAlign: 'center', marginBottom: 30, fontSize: 26 }}>Welcome Back</h2>

                {error && <div className="error">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>

                <div className="link-text">
                    Don't have an account? <Link to="/register">Register</Link>
                </div>
            </div>
        </div>
    )
}