import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/')
        }
    }, [])

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

    if (localStorage.getItem('token')) return null

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-content">
                    <h2>Welcome Back!</h2>
                    <p>Log in to access your dashboard, track applications, and connect with top talent.</p>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-card">
                    <h3>Sign In</h3>
                    <p className="subtitle">Enter your credentials to continue</p>

                    {error && <div className="error">{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                            Sign In
                        </button>
                    </form>

                    <div className="link-text">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}