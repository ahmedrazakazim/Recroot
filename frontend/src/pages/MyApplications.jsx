import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

export default function MyApplications() {
    const [apps, setApps] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) return navigate('/login')
        axios.get(`${API}/applications/mine`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => { setApps(res.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading">Loading...</div>

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
            <h1 className="page-title">My Applications</h1>

            {apps.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 60 }}>
                    <p style={{ fontSize: 48, marginBottom: 16 }}>📬</p>
                    <p style={{ fontSize: 18, fontWeight: 600 }}>No applications yet</p>
                    <p style={{ color: '#78716C', marginTop: 8, marginBottom: 24 }}>Your next opportunity is waiting</p>
                    <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/')}>
                        Browse Jobs
                    </button>
                </div>
            ) : (
                <div className="glass-card wide" style={{ overflow: 'hidden', padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Job</th>
                                <th>Status</th>
                                <th>AI Score</th>
                                <th>Applied</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apps.map(app => (
                                <tr key={app.application_id}>
                                    <td style={{ fontWeight: 600 }}>{app.job_title}</td>
                                    <td><span className={`badge badge-${app.status === 'interview_scheduled' ? 'interview' : app.status}`}>{app.status.replace('_', ' ')}</span></td>
                                    <td>
                                        {app.ai_score ? (
                                            <div className="ai-score">
                                                <div className="score-ring">{app.ai_score}</div>
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td style={{ color: '#78716C', fontSize: 12 }}>
                                        {new Date(app.applied_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}