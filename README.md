# Recroot — AI-Powered Recruitment Management System

A full-stack web application that modernizes the hiring process with AI-powered resume screening, structured MySQL database, and role-based dashboards.

## Features

- **AI Resume Screening** — Upload PDF resumes, get instant AI scores (0–100), strengths, skill gaps, and 5 tailored interview questions via Groq API (Llama 3.3 70B)
- **Role-Based Dashboards** — Candidate, Recruiter, and Admin portals with tailored functionality
- **Job Board** — Browse, search, and filter job listings with salary ranges and job types
- **Application Tracking** — Real-time status updates (Pending → Shortlisted → Interview → Hired/Rejected)
- **Interview Scheduling** — Recruiters schedule interviews with date picker, stored in database, email sent via n8n
- **Automated Email Notifications** — Gmail OAuth via n8n sends professional HTML emails on status changes
- **Weighted Candidate Ranking** — Multi-criteria SQL ranking: 0.6×AI + 0.2×experience + 0.1×education + 0.1×keyword
- **Stored Procedures & Triggers** — Atomic transactions, auto-notifications on status changes
- **Admin Panel** — System-wide stats, user management, role assignment
- **Notifications Page** — Users see all their application updates in real-time

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), React Router, Axios, CSS |
| Backend | Python 3.11+, Flask, Flask-JWT-Extended, Flask-SQLAlchemy |
| Database | MySQL 8.0 (views, stored procedures, triggers, transactions) |
| AI | Groq API — Llama 3.3 70B (provider-agnostic, Mistral fallback ready) |
| PDF Processing | PyMuPDF (fitz) |
| Automation | n8n (Gmail OAuth, webhook-triggered workflows) |

## Setup

### Prerequisites

- Python 3.11+, Node.js 18+, MySQL 8.0+, Groq API key, n8n (optional)

### 1. Clone

```bash
git clone https://github.com/ahmedrazakazim/Recroot.git
cd Recroot
```

### 2. Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE recroot;
USE recroot;
source recroot_fixed.sql;
source backend/procedures.sql;
source backend/views.sql;
```

### 3. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install flask flask-sqlalchemy flask-jwt-extended flask-cors pymysql pymupdf groq python-dotenv requests
```

Create `.env` in `backend/`:

```
SECRET_KEY=recroot-super-secret-key-2026
JWT_SECRET_KEY=recroot-jwt-secret-2026
DATABASE_URL=mysql+pymysql://root:admin@localhost/recroot
GROQ_API_KEY=your_key_here
```

```bash
python app.py
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. n8n (Optional — Email Notifications)

```bash
n8n start
```

- Import workflows from `n8n/` folder
- Configure Gmail OAuth credential
- Activate workflows

## User Roles

| Role | Capabilities |
|------|-------------|
| Candidate | Browse jobs, upload resume (PDF), AI screening, apply, track applications, view notifications |
| Recruiter | Post/edit/delete jobs, view AI-ranked applicants, update status, schedule interviews |
| Admin | System stats, manage users (role change, delete), oversee all jobs and applications |

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@recroot.com | admin123 |
| Recruiter | hassan@recroot.com | hassan123 |
| Candidate | Register via signup page | — |

## Team

- Ahmed Raza — 24K-1010
- Simal Hassan — 24K-0688
- Laiba Jamil — 24K-0812

FAST NUCES — Spring 2026  
Database Systems + Artificial Intelligence