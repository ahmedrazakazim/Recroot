export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-grid">
                <div>
                    <div className="footer-brand">Recroot</div>
                    <p style={{ color: '#a8a29e', fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>
                        AI-powered recruitment for the modern workforce.
                        Matching talent with opportunity since 2026.
                    </p>
                </div>

                <div className="footer-col">
                    <h4>For Candidates</h4>
                    <a href="/">Browse Jobs</a>
                    <a href="/register">Create Profile</a>
                    <a href="/my-applications">Track Applications</a>
                </div>

                <div className="footer-col">
                    <h4>For Recruiters</h4>
                    <a href="/register">Create Account</a>
                    <a href="/dashboard">Post Jobs</a>
                    <a href="/dashboard">View Applicants</a>
                </div>

                <div className="footer-col">
                    <h4>Company</h4>
                    <a href="#">About Recroot</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Contact</a>
                </div>
            </div>

            <div className="footer-bottom">
                © {new Date().getFullYear()} Recroot. All rights reserved.
                Built with ❤️ by Team Recroot — FAST NUCES
            </div>
        </footer>
    )
}