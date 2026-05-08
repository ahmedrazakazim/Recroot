# Recroot — AI-Powered Recruitment Management System

A full-stack web application that modernizes the hiring process with AI-powered resume screening, structured MySQL database, and role-based dashboards.

## 🚀 Features

- **AI Resume Screening** — Upload PDF resumes, get instant AI scores (0–100), strengths, skill gaps, and interview questions via Groq API (Llama 3.3 70B)
- **Role-Based Dashboards** — Candidate, Recruiter, and Admin portals with tailored functionality
- **Job Board** — Browse, search, and filter job listings with salary ranges and job types
- **Application Tracking** — Real-time status updates (Pending → Shortlisted → Interview → Hired/Rejected)
- **Automated Email Notifications** — n8n workflow sends emails on status changes via Gmail SMTP
- **Weighted Candidate Ranking** — Multi-criteria SQL ranking combining AI score, experience, and education
- **Stored Procedures & Triggers** — Atomic transactions, auto-notifications on status changes
- **Admin Panel** — System-wide stats, user management, role assignment

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React (Vite), React Router, Axios, CSS |
| **Backend** | Python 3.11+, Flask, Flask-JWT-Extended, Flask-SQLAlchemy |
| **Database** | MySQL 8.0 (normalized schema, views, stored procedures, triggers) |
| **AI** | Groq API — Llama 3.3 70B |
| **PDF Processing** | PyMuPDF (fitz) |
| **Automation** | n8n (webhook-triggered email notifications) |

## 📁 Project Structure
Recroot/
├── backend/
│ ├── app.py # Flask entry point
│ ├── config.py # Database & JWT config
│ ├── models.py # SQLAlchemy models (8 tables)
│ ├── ai_screening.py # Groq API integration
│ ├── routes/
│ │ ├── auth.py # Login, register, admin endpoints
│ │ ├── jobs.py # Job CRUD, recruiter views
│ │ ├── applications.py # Apply, AI screening, status updates
│ │ └── resumes.py # PDF upload & text extraction
│ ├── procedures.sql # Stored procedures & triggers
│ └── views.sql # Views (ranked applicants, job stats)
├── frontend/
│ └── src/
│ ├── components/ # Navbar, Footer, Splash
│ └── pages/ # Login, Register, JobBoard, JobDetail,
│ # MyApplications, RecruiterDashboard,
│ # AdminDashboard, Applicants
└── recroot.sql # Database schema

text

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Groq API key (free — [console.groq.com](https://console.groq.com))

### 1. Clone the Repository
```bash
git clone https://github.com/ahmedrazakazim/Recroot.git
cd Recroot
2. Database Setup
bash
mysql -u root -p
CREATE DATABASE recroot;
USE recroot;
source recroot_fixed.sql;
source backend/procedures.sql;
source backend/views.sql;
3. Backend Setup
bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate      # Mac/Linux
pip install flask flask-sqlalchemy flask-jwt-extended flask-cors pymysql pymupdf groq python-dotenv requests
Create .env in backend/:

text
SECRET_KEY=recroot-super-secret-key-2026
JWT_SECRET_KEY=recroot-jwt-secret-2026
DATABASE_URL=mysql+pymysql://root:admin@localhost/recroot
GROQ_API_KEY=gsk_your_groq_api_key_here
bash
python app.py
# Server runs on http://127.0.0.1:5000
4. Frontend Setup
bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
5. n8n Setup (Optional — Email Notifications)
bash
npm install -g n8n
n8n start
Go to http://localhost:5678 → Create account

Create workflow: Webhook (POST /status-change) → Email (SMTP)

Configure Gmail SMTP with App Password

Activate workflow

👥 User Roles
Role	Capabilities
Candidate	Browse jobs, upload resume, get AI screening, apply, track applications
Recruiter	Post jobs, view AI-ranked applicants, update application status (shortlist/reject/interview)
Admin	View system stats, manage users, change roles, delete accounts
🧠 AI Screening Flow
Candidate uploads PDF resume

PyMuPDF extracts raw text

Text + job description sent to Groq API (Llama 3.3 70B)

AI returns JSON: { score, strengths, gaps, questions }

Results displayed before candidate decides to apply

Score stored in database for recruiter ranking

📊 Database Features
8 Normalized Tables: users, companies, jobs, candidates, resumes, applications, interviews, notifications

Stored Procedures: sp_submit_application(), sp_update_status(), sp_get_ranked_candidates()

Views: v_ranked_applicants, v_job_stats, v_candidate_dashboard

Trigger: trg_application_status_change — auto-logs notifications

Weighted Ranking: 0.6×AI_score + 0.2×experience + 0.1×education + 0.1×keyword_match

📝 Demo Accounts
Role	Email	Password
Admin	admin@recroot.com	admin123
Recruiter	hassan@recroot.com	hassan123
Candidate	ahmedraza@gmail.com	(set during registration)
👨‍💻 Team
Ahmed Raza — 24K-1010

Simal Hassan — 24K-0688

Laiba Jamil — 24K-0812

FAST NUCES — Spring 2026
Database Systems (CS 2005) + Artificial Intelligence