import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


const API = 'https://recroot-xd7u.onrender.com/api'

export default function MyApplications() {
    const [apps, setApps] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(null)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) return navigate('/login')
        axios.get(`${API}/applications/mine`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => { setApps(res.data); setLoading(false) })
            .catch(err => {
                if (err.response?.status === 401) {
                    localStorage.clear()
                    navigate('/login')
                }
                setLoading(false)
            })
    }, [])



    const parseFeedback = (fb) => {
        try {
            return typeof fb === 'string' ? JSON.parse(fb) : fb
        } catch {
            return null
        }
    }

    const getScoreClass = (score) => {
        if (score >= 80) return 'score-high'
        if (score >= 60) return 'score-mid'
        return 'score-low'
    }

    if (loading) return <div className="loading">Loading your applications...</div>

    return (
        <div className="content-area">
            <h1 className="page-title">My Applications</h1>
            <p className="page-subtitle">Track your applications and view AI feedback</p>

            {apps.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 60 }}>
                    <img src="/images/empty-state.svg" alt="Empty" style={{ width: 80, marginBottom: 20, opacity: 0.5 }} />
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No applications yet</h3>
                    <p style={{ color: '#78716C', marginBottom: 24 }}>Your next opportunity is waiting</p>
                    <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/')}>
                        Browse Jobs
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {apps.map(app => {
                        const fb = parseFeedback(app.ai_feedback)
                        const isExpanded = expanded === app.application_id
                        const scoreClass = getScoreClass(app.ai_score || 0)

                        return (
                            <div key={app.application_id} className="glass-card wide fade-in"
                                style={{ padding: 0, overflow: 'hidden', cursor: fb ? 'pointer' : 'default' }}
                                onClick={() => fb && setExpanded(isExpanded ? null : app.application_id)}>

                                {/* Summary Row */}
                                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        {app.ai_score ? (
                                            <div className="ai-score">
                                                <div className={`score-ring ${scoreClass}`}>{app.ai_score}</div>
                                            </div>
                                        ) : (
                                            <div className="score-ring score-low" style={{ fontSize: 12 }}>N/A</div>
                                        )}
                                        <div>
                                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2, cursor: 'pointer', color: '#0F766E' }}
                                                onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${app.job_id}`) }}>
                                                {app.job_title}
                                            </h3>
                                            <span className={`badge badge-${app.status === 'interview_scheduled' ? 'interview' : app.status}`}>
                                                {app.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 12, color: '#78716C' }}>
                                            {new Date(app.applied_at).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </p>
                                        {fb && (
                                            <span style={{ fontSize: 12, color: '#0F766E', fontWeight: 600 }}>
                                                {isExpanded ? '▲ Hide AI Feedback' : '▼ View AI Feedback'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded AI Feedback */}
                                {isExpanded && fb && (
                                    <div style={{
                                        padding: '24px', background: '#FAFAF9',
                                        borderTop: '1px solid #E7E5E4', animation: 'fadeIn 0.3s ease'
                                    }}>
                                        {fb.strengths && (
                                            <div className="ai-feedback-section">
                                                <strong>✅ Strengths</strong>
                                                <p>{fb.strengths}</p>
                                            </div>
                                        )}
                                        {fb.gaps && (
                                            <div className="ai-feedback-section">
                                                <strong>⚠️ Skill Gaps</strong>
                                                <p>{fb.gaps}</p>
                                            </div>
                                        )}
                                        {fb.questions && fb.questions.length > 0 && (
                                            <div className="ai-feedback-section">
                                                <strong>🎤 Interview Questions</strong>
                                                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                                                    {fb.questions.map((q, i) => (
                                                        <li key={i} style={{ marginBottom: 6, color: '#475569', fontSize: 13 }}>{q}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}