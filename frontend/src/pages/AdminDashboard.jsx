import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, totalApplications: 0, avgAiScore: 0 })
    const [users, setUsers] = useState([])
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('users')
    const [companyForm, setCompanyForm] = useState({ company_name: '', industry: '', location: '', user_id: '' })
    const [showCompanyForm, setShowCompanyForm] = useState(false)
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

        axios.get(`${API}/admin/companies`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setCompanies(res.data))
            .catch(() => { })
    }, [])

    const changeRole = async (userId, newRole) => {
        await axios.put(`${API}/admin/users/${userId}`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } })
        setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u))
    }

    const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently? This action cannot be undone.')) return
    try {
        await axios.delete(`${API}/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
        setUsers(prev => prev.filter(u => u.user_id !== userId))
    } catch (err) {
        alert(err.response?.data?.error || 'Delete failed')
    }
}

    const createCompany = async (e) => {
        e.preventDefault()
        await axios.post(`${API}/admin/companies`, companyForm, { headers: { Authorization: `Bearer ${token}` } })
        setShowCompanyForm(false)
        setCompanyForm({ company_name: '', industry: '', location: '', user_id: '' })
        const res = await axios.get(`${API}/admin/companies`, { headers: { Authorization: `Bearer ${token}` } })
        setCompanies(res.data)
    }

    const deleteCompany = async (companyId) => {
    if (!window.confirm('Delete this company? All associated jobs must be deleted first.')) return
    try {
        await axios.delete(`${API}/admin/companies/${companyId}`, { headers: { Authorization: `Bearer ${token}` } })
        setCompanies(prev => prev.filter(c => c.company_id !== companyId))
    } catch (err) {
        alert(err.response?.data?.error || 'Delete failed')
    }
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

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <button className={`btn btn-sm ${tab === 'users' ? 'btn-primary' : 'btn-outline'}`} style={{ width: 'auto' }} onClick={() => setTab('users')}>Users</button>
                <button className={`btn btn-sm ${tab === 'companies' ? 'btn-primary' : 'btn-outline'}`} style={{ width: 'auto' }} onClick={() => setTab('companies')}>Companies</button>
            </div>

            {tab === 'users' && (
                <div className="glass-card wide" style={{ overflow: 'hidden', padding: 0 }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #E7E5E4' }}><h3 style={{ fontSize: 16, fontWeight: 600 }}>User Management</h3></div>
                    <table className="data-table">
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Change Role</th><th>Actions</th></tr></thead>
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
                                    <td><button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.user_id)}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'companies' && (
                <div className="glass-card wide" style={{ overflow: 'hidden', padding: 0 }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #E7E5E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Company Management</h3>
                        <button className="btn btn-sm btn-primary" style={{ width: 'auto' }} onClick={() => setShowCompanyForm(!showCompanyForm)}>+ Add Company</button>
                    </div>
                    {showCompanyForm && (
                        <form onSubmit={createCompany} style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <input placeholder="Company Name" required value={companyForm.company_name} onChange={e => setCompanyForm({ ...companyForm, company_name: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #E7E5E4' }} />
                            <input placeholder="Industry" value={companyForm.industry} onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #E7E5E4' }} />
                            <input placeholder="Location" value={companyForm.location} onChange={e => setCompanyForm({ ...companyForm, location: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #E7E5E4' }} />
                            <input placeholder="User ID (optional)" value={companyForm.user_id} onChange={e => setCompanyForm({ ...companyForm, user_id: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #E7E5E4' }} />
                            <button type="submit" className="btn btn-primary btn-sm" style={{ gridColumn: 'span 2' }}>Create Company</button>
                        </form>
                    )}
                    <table className="data-table">
                        <thead><tr><th>Company</th><th>Industry</th><th>Location</th><th>Actions</th></tr></thead>
                        <tbody>
                            {companies.map(c => (
                                <tr key={c.company_id}>
                                    <td style={{ fontWeight: 600 }}>{c.company_name}</td>
                                    <td>{c.industry || '—'}</td>
                                    <td>{c.location || '—'}</td>
                                    <td><button className="btn btn-sm btn-danger" onClick={() => deleteCompany(c.company_id)}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}