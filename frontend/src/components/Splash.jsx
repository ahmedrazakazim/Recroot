import { useState, useEffect } from 'react'

export default function Splash({ onFinish }) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const seen = sessionStorage.getItem('splashSeen')
        if (seen) {
            onFinish()
            setVisible(false)
            return
        }

        const timer = setTimeout(() => {
            setVisible(false)
            sessionStorage.setItem('splashSeen', 'true')
            setTimeout(onFinish, 600)
        }, 2200)

        return () => clearTimeout(timer)
    }, [])

    if (!visible) return null

    return (
        <div className="splash-screen">
            <div className="splash-content">
                <div className="splash-logo">Recroot</div>
                <div className="splash-tagline">AI-Powered Recruitment</div>
            </div>
        </div>
    )
}