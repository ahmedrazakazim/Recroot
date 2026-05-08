import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

export default function JobBoard() {
    const [jobs, setJobs] = useState([])
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    useEffect(() => {
        axios.get(`${API}/jobs`)
            .then(res => { setJobs(res.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const filtered = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.company.toLowerCase().includes(search.toLowerCase())
        return matchesSearch
    })

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>

            {/* Hero section */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
                    Find Your Next Role
                </h1>
                <p style={{ color: '#78716C', fontSize: 16 }}>
                    AI-powered matching that finds the right fit
                </p>
            </div>

            {/* Search bar */}
            <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <svg style={{ position: 'absolute', left: 14, top: 13, color: '#78716C' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <input
                        type="text"
                        placeholder="Search by title or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 42px',
                            border: '1px solid #E7E5E4',
                            borderRadius: 10,
                            fontSize: 14,
                            background: '#fff',
                            outline: 'none'
                        }}
                    />
                </div>
                {(token && role === 'recruiter') && (
                    <button className="btn btn-primary" style={{ width: 'auto', whiteSpace: 'nowrap' }}
                        onClick={() => navigate('/dashboard')}>
                        + Post Job
                    </button>
                )}
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {['all', 'Engineering', 'Marketing', 'Design', 'Remote'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: 20,
                            border: `1.5px solid ${filter === f ? '#0F766E' : '#E7E5E4'}`,
                            background: filter === f ? '#F0FDFA' : '#fff',
                            color: filter === f ? '#0F766E' : '#475569',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                    >
                        {f === 'all' ? 'All Jobs' : f}
                    </button>
                ))}
            </div>

            {/* Job cards */}
            {loading ? (
                <div className="loading">Loading jobs...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#78716C' }}>
                    <p style={{ fontSize: 18, fontWeight: 600 }}>No jobs found</p>
                    <p style={{ marginTop: 8 }}>Try a different search term</p>
                </div>
            ) : (
                <div className="jobs-grid">
                    {filtered.map(job => (
                        <div key={job.job_id} className="job-card" onClick={() => navigate(`/jobs/${job.job_id}`)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h3>{job.title}</h3>
                                    <p className="company">{job.company}</p>
                                </div>
                                {job.deadline && (
                                    <span className="badge badge-interview" style={{ fontSize: 10 }}>
                                        {new Date(job.deadline).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <p style={{ color: '#78716C', fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>
                                {job.description?.substring(0, 120)}...
                            </p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                                {job.requirements?.split(',').slice(0, 3).map(skill => (
                                    <span key={skill} style={{
                                        padding: '3px 10px',
                                        borderRadius: 6,
                                        background: '#F0FDFA',
                                        color: '#0F766E',
                                        fontSize: 11,
                                        fontWeight: 600
                                    }}>
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                            <button className="btn btn-primary btn-sm" style={{ marginTop: 16, width: '100%' }}>
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}