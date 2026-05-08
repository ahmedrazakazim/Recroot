import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

export default function Register() {
    const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'candidate' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        try {
            await axios.post(`${API}/register`, form)
            setSuccess('Account created! Redirecting to login...')
            setTimeout(() => navigate('/login'), 1500)
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed')
        }
    }

    return (
        <div className="page-container">
            <div className="glass-card">
                <h2 style={{ textAlign: 'center', marginBottom: 6, fontSize: 24, fontWeight: 700 }}>Create Account</h2>
                <p style={{ textAlign: 'center', color: '#78716C', marginBottom: 24, fontSize: 13 }}>
                    Join Recroot and find your next opportunity
                </p>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input type="text" required value={form.full_name}
                            onChange={e => setForm({ ...form, full_name: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" required value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" required value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Role</label>
                        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                            <option value="candidate">Candidate</option>
                            <option value="recruiter">Recruiter</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">Create Account</button>
                </form>

                <div className="link-text">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    )
}