import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

export default function RecruiterDashboard() {
    const [jobs, setJobs] = useState([])
    const [stats, setStats] = useState({ total: 0, active: 0 })
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingJobId, setEditingJobId] = useState(null)
    const [form, setForm] = useState({
        title: '', description: '', requirements: '', deadline: '',
        job_type: 'Full-time', salary_range: ''
    })
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) return navigate('/login')
        axios.get(`${API}/jobs/mine`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                setJobs(res.data)
                setStats({ total: res.data.length, active: res.data.filter(j => j.status === 'open').length })
                setLoading(false)
            }).catch(err => {
                if (err.response?.status === 401) {
                    localStorage.clear()
                    navigate('/login')
                }
                setLoading(false)
            })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingJobId) {
                await axios.put(`${API}/jobs/${editingJobId}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            } else {
                await axios.post(`${API}/jobs`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }
            setShowForm(false)
            setEditingJobId(null)
            setForm({ title: '', description: '', requirements: '', deadline: '', job_type: 'Full-time', salary_range: '' })
            window.location.reload()
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.clear()
                navigate('/login')
            }
            alert(err.response?.data?.error || 'Failed to save job')
        }
    }

    const handleDeleteJob = async (jobId) => {
        if (!confirm('Delete this job permanently? All applications will be lost.')) return
        try {
            await axios.delete(`${API}/jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setJobs(prev => prev.filter(j => j.job_id !== jobId))
            setStats(prev => ({ ...prev, total: prev.total - 1 }))
        } catch (err) {
            alert('Delete failed')
        }
    }

    const handleEdit = (job) => {
        setForm({
            title: job.title || '',
            description: job.description || '',
            requirements: job.requirements || '',
            deadline: job.deadline || '',
            job_type: job.job_type || 'Full-time',
            salary_range: job.salary_range || ''
        })
        setEditingJobId(job.job_id)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (loading) return <div className="loading">Loading...</div>

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
                <button className="btn btn-primary" style={{ width: 'auto' }}
                    onClick={() => {
                        setEditingJobId(null)
                        setForm({ title: '', description: '', requirements: '', deadline: '', job_type: 'Full-time', salary_range: '' })
                        setShowForm(!showForm)
                    }}>
                    + New Job
                </button>
            </div>

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

            {showForm && (
                <div className="glass-card wide" style={{ marginBottom: 30 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
                        {editingJobId ? 'Edit Job' : 'Post New Job'}
                    </h3>
                    <form onSubmit={handleSubmit}>
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="input-group">
                                <label>Job Type</label>
                                <select value={form.job_type} onChange={e => setForm({ ...form, job_type: e.target.value })}>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Salary Range</label>
                                <input type="text" value={form.salary_range}
                                    onChange={e => setForm({ ...form, salary_range: e.target.value })}
                                    placeholder="e.g. 150K-250K or Competitive" />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Deadline</label>
                            <input type="date" value={form.deadline}
                                onChange={e => setForm({ ...form, deadline: e.target.value })} />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            {editingJobId ? 'Update Job' : 'Post Job'}
                        </button>
                    </form>
                </div>
            )}

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
                                <th>Type</th>
                                <th>Status</th>
                                <th>Deadline</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job.job_id}>
                                    <td style={{ fontWeight: 600 }}>{job.title}</td>
                                    <td>
                                        {job.job_type && (
                                            <span className={`job-type-badge job-type-${(job.job_type || '').toLowerCase().replace(' ', '')}`}>
                                                {job.job_type}
                                            </span>
                                        )}
                                    </td>
                                    <td><span className="badge badge-shortlisted">{job.status}</span></td>
                                    <td style={{ color: '#78716C', fontSize: 12 }}>
                                        {job.deadline ? new Date(job.deadline).toLocaleDateString() : '—'}
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-primary"
                                            onClick={() => navigate(`/jobs/${job.job_id}/applicants`)}>
                                            View Applicants
                                        </button>
                                        <button className="btn btn-sm btn-outline" style={{ marginLeft: 6 }}
                                            onClick={() => handleEdit(job)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-sm btn-danger" style={{ marginLeft: 6 }}
                                            onClick={() => handleDeleteJob(job.job_id)}>
                                            Delete
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