import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, totalApplications: 0, avgAiScore: 0 })
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token || localStorage.getItem('role') !== 'admin') return navigate('/login')

        axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setStats(res.data))
            .catch(err => { if (err.response?.status === 401) { localStorage.clear(); navigate('/login') } })

        axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => { setUsers(res.data); setLoading(false) })
            .catch(err => { if (err.response?.status === 401) { localStorage.clear(); navigate('/login') } })
    }, [])

    const changeRole = async (userId, newRole) => {
        await axios.put(`${API}/admin/users/${userId}`, { role: newRole }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u))
    }

    const deleteUser = async (userId) => {
        if (!confirm('Delete this user?')) return
        await axios.delete(`${API}/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        setUsers(prev => prev.filter(u => u.user_id !== userId))
    }

    if (loading) return <div className="loading">Loading admin panel...</div>

    return (
        <div className="content-area">
            <h1 className="page-title">Admin Dashboard</h1>

            <div className="stats-row">
                <div className="stat-card"><div className="stat-value">{stats.totalUsers}</div><div className="stat-label">Total Users</div></div>
                <div className="stat-card"><div className="stat-value">{stats.totalJobs}</div><div className="stat-label">Total Jobs</div></div>
                <div className="stat-card"><div className="stat-value">{stats.totalApplications}</div><div className="stat-label">Applications</div></div>
                <div className="stat-card"><div className="stat-value">{stats.avgAiScore.toFixed(1)}</div><div className="stat-label">Avg AI Score</div></div>
            </div>

            <div className="glass-card wide" style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #E7E5E4' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>User Management</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Change Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.user_id}>
                                <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                                <td>{u.email}</td>
                                <td><span className={`badge badge-${u.role === 'admin' ? 'shortlisted' : u.role === 'recruiter' ? 'interview' : 'pending'}`}>{u.role}</span></td>
                                <td>
                                    <select value={u.role} onChange={(e) => changeRole(u.user_id, e.target.value)}
                                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #E7E5E4', fontSize: 12 }}>
                                        <option value="candidate">Candidate</option>
                                        <option value="recruiter">Recruiter</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.user_id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}