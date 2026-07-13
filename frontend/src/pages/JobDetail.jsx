import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://recroot-xd7u.onrender.com/api'

export default function JobDetail() {
    const { id } = useParams()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)
    const [aiResult, setAiResult] = useState(null)
    const [msg, setMsg] = useState('')
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [screening, setScreening] = useState(false)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    useEffect(() => {
        const loadJob = async () => {
            try {
                const res = await axios.get(`${API}/jobs/${id}`)
                setJob(res.data)

                if (token && (role === 'candidate' || role === 'admin')) {
                    try {
                        const appsRes = await axios.get(`${API}/applications/mine`, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                        const found = appsRes.data.find(a => a.job_title === res.data.title)
                        if (found) {
                            setApplied(true)
                            if (found.ai_score) {
                                setAiResult({ score: found.ai_score, feedback: found.ai_feedback })
                            }
                        }
                    } catch { }
                }
            } catch { }
            setLoading(false)
        }
        loadJob()
    }, [id])

    // Upload resume + trigger AI screening (no application yet)
    const handleUploadAndScreen = async () => {
        if (!file) return setMsg('Please select a PDF file')
        setUploading(true)
        setMsg('')
        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await axios.post(`${API}/resumes/upload`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            })
            const resumeId = res.data.resume_id
            localStorage.setItem('resumeId', resumeId)
            setMsg('Resume uploaded! Running AI screening...')
            setUploading(false)
            setScreening(true)

            // Trigger AI screening separately
            try {
                const screenRes = await axios.post(`${API}/screen`, {
                    job_id: parseInt(id),
                    resume_id: resumeId
                }, { headers: { Authorization: `Bearer ${token}` } })

                if (screenRes.data.ai_score) {
                    setAiResult({
                        score: screenRes.data.ai_score,
                        feedback: screenRes.data.ai_feedback
                    })
                    const score = screenRes.data.ai_score
                    if (score >= 60) {
                        setMsg(`AI Score: ${score}/100 — Strong match! You can apply now.`)
                    } else {
                        setMsg(`AI Score: ${score}/100 — Below threshold. You can still apply, but consider improving.`)
                    }
                }
            } catch (err) {
                setMsg('Screening failed. You can still apply.')
            }
            setScreening(false)
        } catch (err) {
            setMsg(err.response?.data?.error || 'Upload failed')
            setUploading(false)
        }
    }

    // Apply to job (after screening)
    const handleApply = async () => {
        if (!token) return navigate('/login')
        setApplying(true)
        setMsg('')
        try {
            const resumeId = localStorage.getItem('resumeId') || 1
            await axios.post(`${API}/applications`,
                { job_id: parseInt(id), resume_id: parseInt(resumeId) },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setApplied(true)
            setMsg('Application submitted successfully!')
        } catch (err) {
            if (err.response?.status === 409) {
                setApplied(true)
                setMsg('You already applied to this job')
            } else {
                setMsg(err.response?.data?.error || 'Application failed')
            }
        }
        setApplying(false)
    }

    const parseFeedback = (fb) => {
        try { return typeof fb === 'string' ? JSON.parse(fb) : fb }
        catch { return null }
    }

    const fb = parseFeedback(aiResult?.feedback)

    if (loading) return <div className="loading">Loading...</div>
    if (!job) return <div className="page-container"><div className="glass-card"><p>Job not found</p></div></div>

    return (
        <div className="content-area">
            <button onClick={() => navigate('/')} style={{
                background: 'none', border: 'none', color: '#78716C', cursor: 'pointer',
                fontSize: 14, fontWeight: 500, marginBottom: 24
            }}>
                ← Back to Jobs
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 30 }}>
                {/* Main */}
                <div className="glass-card" style={{ padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                                {job.title}
                            </h1>
                            <p style={{ color: '#0F766E', fontWeight: 600, fontSize: 15 }}>{job.company}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {job.job_type && (
                                <span className={`job-type-badge job-type-${(job.job_type || '').toLowerCase().replace(' ', '')}`}>
                                    {job.job_type}
                                </span>
                            )}
                            <span className="badge badge-open">{job.status}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 24, color: '#78716C', fontSize: 13 }}>
                        {job.salary_range && <span>💰 {job.salary_range}</span>}
                        {job.deadline && <span>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Description</h3>
                    <p style={{ color: '#475569', lineHeight: 1.8, marginBottom: 32, whiteSpace: 'pre-wrap' }}>
                        {job.description}
                    </p>

                    {job.requirements && (
                        <>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Requirements</h3>
                            <div className="skills-row" style={{ marginBottom: 32 }}>
                                {job.requirements.split(',').map(s => (
                                    <span key={s} className="skill-tag" style={{ padding: '8px 14px', fontSize: 13 }}>{s.trim()}</span>
                                ))}
                            </div>
                        </>
                    )}

                    {/* AI Screening Results (shown BEFORE applying) */}
                    {aiResult && fb && (
                        <div className="ai-feedback-card" style={{ marginBottom: 24 }}>
                            <h4>🤖 AI Screening Results</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                                <div className="ai-score">
                                    <div className={`score-ring ${aiResult.score >= 80 ? 'score-high' : aiResult.score >= 60 ? 'score-mid' : 'score-low'}`}>
                                        {aiResult.score}
                                    </div>
                                </div>
                                <span style={{
                                    fontWeight: 600,
                                    color: aiResult.score >= 60 ? '#0F766E' : '#D97706'
                                }}>
                                    {aiResult.score >= 80 ? 'Excellent Match!' : aiResult.score >= 60 ? 'Good Match' : 'Below Threshold'}
                                </span>
                            </div>
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
                                    <strong>🎤 Potential Interview Questions</strong>
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

                {/* Sidebar */}
                <div>
                    <div className="glass-card" style={{ padding: 24, position: 'sticky', top: 100 }}>
                        {msg && (
                            <div style={{
                                padding: 12, borderRadius: 8, marginBottom: 16,
                                background: aiResult?.score >= 60 ? '#F0FDFA' : '#fff7ed',
                                color: aiResult?.score >= 60 ? '#0F766E' : '#c2410c',
                                fontSize: 13, fontWeight: 600, textAlign: 'center'
                            }}>
                                {msg}
                            </div>
                        )}

                        {/* Upload Resume (screening only, no apply) */}
                        {token && (role === 'candidate' || role === 'admin') && !applied && (
                            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #E7E5E4' }}>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                                    📄 Upload Resume for AI Screening
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    style={{ fontSize: 12, marginBottom: 8, width: '100%' }}
                                />
                                <button
                                    className="btn btn-outline"
                                    onClick={handleUploadAndScreen}
                                    disabled={uploading || screening}
                                    style={{ width: '100%' }}
                                >
                                    {uploading ? 'Uploading...' : screening ? 'AI Screening...' : 'Upload & Screen'}
                                </button>
                                <p style={{ fontSize: 11, color: '#78716C', marginTop: 8, textAlign: 'center' }}>
                                    Upload first — AI will score your resume before you apply
                                </p>
                            </div>
                        )}

                        {/* Apply Button (only after screening) */}
                        {token && (role === 'candidate' || role === 'admin') && !applied && (
                            <button
                                className="btn btn-primary"
                                onClick={handleApply}
                                disabled={applying || !aiResult}
                                style={{ marginBottom: 8 }}
                            >
                                {applying ? 'Submitting...' : !aiResult ? 'Screen Resume First' : 'Apply Now'}
                            </button>
                        )}

                        {!token && (
                            <button className="btn btn-primary" onClick={() => navigate('/login')}>
                                Login to Apply
                            </button>
                        )}

                        {applied && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                                <p style={{ fontWeight: 600, color: '#0F766E' }}>Applied!</p>
                                <button className="btn btn-outline btn-sm" style={{ marginTop: 16, width: '100%' }}
                                    onClick={() => navigate('/my-applications')}>
                                    View My Applications
                                </button>
                            </div>
                        )}

                        {/* Company Info */}
                        <div style={{ marginTop: 24, padding: '16px 0', borderTop: '1px solid #E7E5E4' }}>
                            <p style={{ fontSize: 12, color: '#78716C', marginBottom: 4 }}>Company</p>
                            <p style={{ fontWeight: 600 }}>{job.company}</p>
                        </div>
                        <div style={{ padding: '16px 0', borderTop: '1px solid #E7E5E4' }}>
                            <p style={{ fontSize: 12, color: '#78716C', marginBottom: 4 }}>Posted</p>
                            <p style={{ fontWeight: 600 }}>{new Date(job.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}