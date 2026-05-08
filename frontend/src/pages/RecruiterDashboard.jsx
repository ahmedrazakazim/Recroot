import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

export default function RecruiterDashboard() {
    const [jobs, setJobs] = useState([])
    const [stats, setStats] = useState({ total: 0, active: 0 })
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', description: '', requirements: '', deadline: '' })
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) return navigate('/login')
        axios.get(`${API}/jobs`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                setJobs(res.data)
                setStats({ total: res.data.length, active: res.data.filter(j => j.status === 'open').length })
                setLoading(false)
            }).catch(() => setLoading(false))
    }, [])

    const handleCreateJob = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API}/jobs`, form, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setShowForm(false)
            setForm({ title: '', description: '', requirements: '', deadline: '' })
            window.location.reload()
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create job')
        }
    }

    if (loading) return <div className="loading">Loading...</div>

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
                <button className="btn btn-primary" style={{ width: 'auto' }}
                    onClick={() => setShowForm(!showForm)}>
                    + New Job
                </button>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Jobs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.active}</div>
                    <div className="stat-label">Active</div>
                </div>
            </div>

            {/* Create Job Form */}
            {showForm && (
                <div className="glass-card wide" style={{ marginBottom: 30 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Post New Job</h3>
                    <form onSubmit={handleCreateJob}>
                        <div className="input-group">
                            <label>Job Title</label>
                            <input type="text" required value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Description</label>
                            <textarea required value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Requirements (comma-separated)</label>
                            <input type="text" value={form.requirements}
                                onChange={e => setForm({ ...form, requirements: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Deadline</label>
                            <input type="date" value={form.deadline}
                                onChange={e => setForm({ ...form, deadline: e.target.value })} />
                        </div>
                        <button type="submit" className="btn btn-primary">Post Job</button>
                    </form>
                </div>
            )}

            {/* Jobs Table */}
            <div className="glass-card wide" style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E7E5E4' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>Your Jobs</h3>
                </div>
                {jobs.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#78716C' }}>
                        <p>No jobs posted yet</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Deadline</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job.job_id}>
                                    <td style={{ fontWeight: 600 }}>{job.title}</td>
                                    <td><span className="badge badge-shortlisted">{job.status}</span></td>
                                    <td style={{ color: '#78716C', fontSize: 12 }}>
                                        {job.deadline ? new Date(job.deadline).toLocaleDateString() : '—'}
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-primary"
                                            onClick={() => navigate(`/jobs/${job.job_id}`)}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}