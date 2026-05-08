import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

export default function JobDetail() {
    const { id } = useParams()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)
    const [msg, setMsg] = useState('')
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    useEffect(() => {
        axios.get(`${API}/jobs/${id}`)
            .then(res => { setJob(res.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [id])

    const handleApply = async () => {
        if (!token) return navigate('/login')
        setApplying(true)
        setMsg('')
        try {
            const res = await axios.post(`${API}/applications`,
                { job_id: parseInt(id), resume_id: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setApplied(true)
            setMsg(`Application submitted! AI Score: ${res.data.ai_score || 'pending'}`)
        } catch (err) {
            if (err.response?.status === 409) {
                setApplied(true)
                setMsg('You already applied to this job')
            } else {
                setMsg(err.response?.data?.error || 'Application failed. Make sure you have a candidate profile.')
            }
        }
        setApplying(false)
    }

    if (loading) return <div className="loading">Loading...</div>
    if (!job) return <div className="page-container"><div className="glass-card"><p>Job not found</p></div></div>

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
            <button onClick={() => navigate('/')} style={{
                background: 'none', border: 'none', color: '#78716C', cursor: 'pointer',
                fontSize: 13, marginBottom: 24, fontWeight: 500
            }}>
                ← Back to Jobs
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 30 }}>
                {/* Main */}
                <div className="glass-card" style={{ padding: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                        {job.title}
                    </h1>
                    <p style={{ color: '#0F766E', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{job.company}</p>
                    <p style={{ color: '#78716C', fontSize: 13, marginBottom: 24 }}>
                        Status: <span className="badge badge-shortlisted">{job.status}</span>
                        {job.deadline && ` · Deadline: ${new Date(job.deadline).toLocaleDateString()}`}
                    </p>

                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1C1917' }}>Description</h3>
                    <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: 32, whiteSpace: 'pre-wrap' }}>
                        {job.description}
                    </p>

                    {job.requirements && (
                        <>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1C1917' }}>Requirements</h3>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {job.requirements.split(',').map(s => (
                                    <span key={s} style={{
                                        padding: '6px 14px', borderRadius: 8, background: '#F0FDFA',
                                        color: '#0F766E', fontSize: 13, fontWeight: 600
                                    }}>
                                        {s.trim()}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar */}
                <div>
                    <div className="glass-card" style={{ padding: 24, position: 'sticky', top: 90 }}>
                        {msg && (
                            <div style={{
                                padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center',
                                background: applied ? '#F0FDFA' : '#fff7ed',
                                color: applied ? '#0F766E' : '#c2410c', fontSize: 13, fontWeight: 600
                            }}>
                                {msg}
                            </div>
                        )}

                        {(!token || role === 'candidate' || role === 'admin') ? (
                            applied ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                                    <p style={{ fontWeight: 600, color: '#0F766E' }}>Application Submitted!</p>
                                    <p style={{ fontSize: 12, color: '#78716C', marginTop: 4 }}>AI is screening your resume</p>
                                    <button className="btn btn-primary btn-sm" style={{ marginTop: 20, width: '100%' }}
                                        onClick={() => navigate('/my-applications')}>
                                        View My Applications
                                    </button>
                                </div>
                            ) : (
                                <button className="btn btn-primary" onClick={handleApply} disabled={applying}
                                    style={{ marginBottom: 16 }}>
                                    {applying ? 'Submitting...' : 'Apply Now'}
                                </button>
                            )
                        ) : (
                            <p style={{ color: '#78716C', textAlign: 'center', fontSize: 13 }}>
                                Switch to a candidate account to apply
                            </p>
                        )}

                        <div style={{ marginTop: 24, padding: '16px 0', borderTop: '1px solid #E7E5E4' }}>
                            <p style={{ fontSize: 12, color: '#78716C', marginBottom: 4 }}>Company</p>
                            <p style={{ fontWeight: 600 }}>{job.company}</p>
                        </div>

                        <div style={{ padding: '16px 0', borderTop: '1px solid #E7E5E4' }}>
                            <p style={{ fontSize: 12, color: '#78716C', marginBottom: 4 }}>Posted</p>
                            <p style={{ fontWeight: 600 }}>{new Date(job.created_at).toLocaleDateString()}</p>
                        </div>

                        <div style={{ padding: '16px 0', borderTop: '1px solid #E7E5E4' }}>
                            <p style={{ fontSize: 12, color: '#78716C', marginBottom: 4 }}>Job ID</p>
                            <p style={{ fontWeight: 600, fontFamily: 'monospace' }}>#{job.job_id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}