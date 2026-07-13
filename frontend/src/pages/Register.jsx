import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://recroot-xd7u.onrender.com/api'

export default function Register() {
    const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'candidate' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (localStorage.getItem('token')) navigate('/')
    }, [])

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        try {
            await axios.post(`${API}/register`, form)
            setSuccess('Account created! Redirecting...')
            setTimeout(() => navigate('/login'), 1500)
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed')
        }
    }

    if (localStorage.getItem('token')) return null

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-content">
                    <h2>Join Recroot</h2>
                    <p>Create an account to apply for jobs, get AI-matched, and track your applications.</p>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-card">
                    <h3>Create Account</h3>
                    <p className="subtitle">Start your journey with Recroot</p>

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <form onSubmit={handleRegister}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Ahmed Raza"
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>I am a...</label>
                            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                <option value="candidate">Candidate — looking for jobs</option>
                                <option value="recruiter">Recruiter — hiring talent</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                            Create Account
                        </button>
                    </form>

                    <div className="link-text">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}