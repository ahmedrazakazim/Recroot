import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://127.0.0.1:5000/api'

export default function Notifications() {
    const [notifs, setNotifs] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) return navigate('/login')
        axios.get(`${API}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => { setNotifs(res.data); setLoading(false) })
            .catch(err => {
                if (err.response?.status === 401) { localStorage.clear(); navigate('/login') }
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="loading">Loading notifications...</div>

    return (
        <div className="content-area">
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">Stay updated on your applications</p>

            {notifs.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 60 }}>
                    <p style={{ fontSize: 48, marginBottom: 16 }}>🔔</p>
                    <p style={{ fontSize: 18, fontWeight: 600 }}>No notifications yet</p>
                    <p style={{ color: '#78716C', marginTop: 8 }}>Updates about your applications will appear here</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {notifs.map(n => (
                        <div key={n.notification_id} className="glass-card fade-in"
                            style={{ padding: 20, borderLeft: n.is_read ? '3px solid #E7E5E4' : '3px solid #0F766E' }}>
                            <p style={{ fontSize: 14, color: n.is_read ? '#78716C' : '#1C1917' }}>{n.message}</p>
                            <span style={{ color: '#78716C', fontSize: 11, marginTop: 8, display: 'block' }}>
                                {new Date(n.created_at).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}