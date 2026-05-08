# Recroot — AI-Powered Recruitment Management System

A full-stack web application that modernizes the hiring process with AI-powered resume screening, structured MySQL database, and role-based dashboards.

## 🚀 Features

- **AI Resume Screening** — Upload PDF resumes, get instant AI scores (0–100), strengths, skill gaps, and interview questions via Groq API (Llama 3.3 70B)
- **Role-Based Dashboards** — Candidate, Recruiter, and Admin portals
- **Job Board** — Browse, search, and filter jobs with salary ranges and job types
- **Application Tracking** — Real-time status updates (Pending → Shortlisted → Interview → Rejected)
- **Automated Emails** — n8n workflow sends email notifications on status changes
- **Weighted Candidate Ranking** — SQL ranking combining AI score, experience, and education
- **Stored Procedures & Triggers** — Atomic transactions, auto-notifications
- **Admin Panel** — System stats, user management, role assignment

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), React Router, Axios, CSS |
| Backend | Python 3.11+, Flask, Flask-JWT-Extended, Flask-SQLAlchemy |
| Database | MySQL 8.0 (views, stored procedures, triggers) |
| AI | Groq API — Llama 3.3 70B |
| PDF Processing | PyMuPDF |
| Automation | n8n (webhook → Gmail SMTP) |

## 📁 Project Structure
Recroot/
├── backend/
│ ├── app.py
│ ├── config.py
│ ├── models.py
│ ├── ai_screening.py
│ ├── routes/
│ │ ├── auth.py
│ │ ├── jobs.py
│ │ ├── applications.py
│ │ └── resumes.py
│ ├── procedures.sql
│ └── views.sql
├── frontend/
│ └── src/
│ ├── components/
│ └── pages/
└── recroot.sql

text

## ⚙️ Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone

```bash
git clone https://github.com/ahmedrazakazim/Recroot.git
cd Recroot
2. Database
bash
mysql -u root -p
CREATE DATABASE recroot;
USE recroot;
source recroot_fixed.sql;
source backend/procedures.sql;
source backend/views.sql;
3. Backend
bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install flask flask-sqlalchemy flask-jwt-extended flask-cors pymysql pymupdf groq python-dotenv requests
Create .env in backend/:

text
SECRET_KEY=recroot-super-secret-key-2026
JWT_SECRET_KEY=recroot-jwt-secret-2026
DATABASE_URL=mysql+pymysql://root:admin@localhost/recroot
GROQ_API_KEY=gsk_your_key_here
bash
python app.py
4. Frontend
bash
cd frontend
npm install
npm run dev
5. n8n (Optional)
bash
npm install -g n8n
n8n start
👥 Roles
Role	Capabilities
Candidate	Browse jobs, upload resume, AI screening, apply, track applications
Recruiter	Post jobs, view ranked applicants, update status
Admin	System stats, manage users, change roles
📝 Demo Accounts
Role	Email	Password
Admin	admin@recroot.com	admin123
Recruiter	hassan@recroot.com	hassan123
Candidate	ahmedraza@gmail.com	(register)
👨‍💻 Team
Ahmed Raza — 24K-1010

Simal Hassan — 24K-0688

Laiba Jamil — 24K-0812

FAST NUCES — Spring 2026
Database Systems + Artificial Intelligence
