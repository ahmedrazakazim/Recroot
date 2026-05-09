import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

export default function Applicants() {
    const { id } = useParams()
    const [applicants, setApplicants] = useState([])
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [scheduleModal, setScheduleModal] = useState(null)
    const [interviewDate, setInterviewDate] = useState('')
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) return navigate('/login')

        axios.get(`${API}/jobs/${id}`)
            .then(res => setJob(res.data))

        axios.get(`${API}/jobs/${id}/applicants`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setApplicants(res.data)
            setLoading(false)
        }).catch(err => {
            if (err.response?.status === 401) { localStorage.clear(); navigate('/login') }
            setLoading(false)
        })
    }, [id])

    const handleSchedule = async (appId) => {
        await axios.post(`${API}/applications/${appId}/schedule`, {
            scheduled_at: interviewDate,
            ai_questions: null
        }, { headers: { Authorization: `Bearer ${token}` } })
        setScheduleModal(null)
        setInterviewDate('')
        window.location.reload()
    }

    const updateStatus = async (appId, newStatus) => {
        try {
            await axios.put(`${API}/applications/${appId}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setApplicants(prev => prev.map(a =>
                a.application_id === appId ? { ...a, status: newStatus } : a
            ))
        } catch (err) {
            alert('Update failed')
        }
    }

    if (loading) return <div className="loading">Loading applicants...</div>

    return (
        <div className="content-area">
            <button onClick={() => navigate('/dashboard')} style={{
                background: 'none', border: 'none', color: '#78716C', cursor: 'pointer',
                fontSize: 14, fontWeight: 500, marginBottom: 24
            }}>
                ← Back to Dashboard
            </button>

            <h1 className="page-title">{job?.title} — Applicants</h1>
            <p className="page-subtitle">{applicants.length} candidate(s) applied</p>

            {applicants.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 60 }}>
                    <p style={{ fontSize: 18, fontWeight: 600 }}>No applicants yet</p>
                    <p style={{ color: '#78716C', marginTop: 8 }}>Share this job to attract candidates</p>
                </div>
            ) : (
                <div className="glass-card wide" style={{ overflow: 'hidden', padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>AI Score</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.map(a => (
                                <tr key={a.application_id}>
                                    <td style={{ fontWeight: 600 }}>{a.candidate_name}</td>
                                    <td>
                                        {a.ai_score ? (
                                            <div className="ai-score">
                                                <div className={`score-ring ${a.ai_score >= 80 ? 'score-high' : a.ai_score >= 60 ? 'score-mid' : 'score-low'}`}>
                                                    {a.ai_score}
                                                </div>
                                            </div>
                                        ) : 'N/A'}
                                    </td>
                                    <td><span className={`badge badge-${a.status === 'interview_scheduled' ? 'interview' : a.status}`}>{a.status.replace('_', ' ')}</span></td>
                                    <td>
                                        <select
                                            value={a.status}
                                            onChange={(e) => updateStatus(a.application_id, e.target.value)}
                                            style={{
                                                padding: '6px 10px', borderRadius: 8, border: '1.5px solid #E7E5E4',
                                                background: '#fff', fontSize: 13, cursor: 'pointer', marginRight: 6
                                            }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="shortlisted">Shortlist</option>
                                            <option value="interview_scheduled">Interview</option>
                                            <option value="hired">Hire</option>
                                            <option value="rejected">Reject</option>
                                        </select>
                                        {a.status === 'interview_scheduled' && (
                                            <button className="btn btn-sm btn-outline"
                                                onClick={() => setScheduleModal(a.application_id)}>
                                                Schedule
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Schedule Interview Modal */}
            {scheduleModal && (
                <div className="modal-overlay" onClick={() => setScheduleModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Schedule Interview</h3>
                        <div className="input-group">
                            <label>Interview Date & Time</label>
                            <input type="datetime-local" value={interviewDate}
                                onChange={e => setInterviewDate(e.target.value)} />
                        </div>
                        <button className="btn btn-primary" onClick={() => handleSchedule(scheduleModal)}>
                            Schedule Interview
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}