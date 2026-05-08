import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

const filterPills = ['All', 'Full-time', 'Remote', 'Hybrid', 'Contract', 'Internship']

export default function JobBoard() {
    const [jobs, setJobs] = useState([])
    const [stats, setStats] = useState({ jobs: 0, companies: 0 })
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState('All')
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    useEffect(() => {
        axios.get(`${API}/jobs`)
            .then(res => {
                setJobs(res.data)
                const companies = [...new Set(res.data.map(j => j.company))]
                setStats({ jobs: res.data.length, companies: companies.length })
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const filtered = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.company.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = activeFilter === 'All' ||
            (job.job_type && job.job_type.toLowerCase() === activeFilter.toLowerCase())
        return matchesSearch && matchesFilter
    })

    return (
        <>
            {/* Hero */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Find Your <span>Next Role</span></h1>
                    <p>AI-powered matching that connects you with the right opportunities. Our intelligent screening ensures you find the perfect fit.</p>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-value">{stats.jobs}</div>
                            <div className="hero-stat-label">Open Positions</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">{stats.companies}</div>
                            <div className="hero-stat-label">Companies</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">85+</div>
                            <div className="hero-stat-label">Avg AI Score</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <div className="content-area">
                {/* Search + Post */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <svg style={{ position: 'absolute', left: 14, top: 13, color: '#78716C' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        <input
                            type="text"
                            placeholder="Search by title or company..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px 12px 42px',
                                border: '1.5px solid #E7E5E4', borderRadius: 10,
                                fontSize: 14, background: '#fff', outline: 'none'
                            }}
                        />
                    </div>
                    {token && role === 'recruiter' && (
                        <button className="btn btn-primary" style={{ width: 'auto', whiteSpace: 'nowrap' }}
                            onClick={() => navigate('/dashboard')}>
                            + Post Job
                        </button>
                    )}
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                    {filterPills.map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            style={{
                                padding: '7px 18px', borderRadius: 20,
                                border: `1.5px solid ${activeFilter === f ? '#0F766E' : '#E7E5E4'}`,
                                background: activeFilter === f ? '#F0FDFA' : '#fff',
                                color: activeFilter === f ? '#0F766E' : '#475569',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Job Cards */}
                {loading ? (
                    <div className="loading">Loading opportunities...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 80 }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                        <h3 style={{ fontSize: 20, fontWeight: 700 }}>No jobs found</h3>
                        <p style={{ color: '#78716C', marginTop: 8 }}>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="jobs-grid">
                        {filtered.map(job => (
                            <div key={job.job_id} className="job-card fade-in" onClick={() => navigate(`/jobs/${job.job_id}`)}>
                                <div className="job-card-header">
                                    <div>
                                        <h3>{job.title}</h3>
                                        <p className="company">{job.company}</p>
                                    </div>
                                    {job.deadline && (
                                        <span className="badge badge-open" style={{ fontSize: 10 }}>
                                            {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                </div>

                                <p style={{ color: '#78716C', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
                                    {job.description?.substring(0, 120)}...
                                </p>

                                <div className="meta-row">
                                    {job.job_type && (
                                        <span className={`job-type-badge job-type-${(job.job_type || '').toLowerCase().replace(' ', '')}`}>
                                            {job.job_type}
                                        </span>
                                    )}
                                    {job.salary_range && (
                                        <span className="salary">{job.salary_range}</span>
                                    )}
                                </div>

                                <div className="skills-row">
                                    {job.requirements?.split(',').slice(0, 4).map(skill => (
                                        <span key={skill} className="skill-tag">{skill.trim()}</span>
                                    ))}
                                    {job.requirements?.split(',').length > 4 && (
                                        <span className="skill-tag">+{job.requirements.split(',').length - 4}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}