# Recroot — AI-Powered Recruitment Management System

A full-stack web application that modernizes the hiring process with AI-powered resume screening, structured MySQL database, and role-based dashboards.

## Features

- AI Resume Screening — Upload PDF resumes, get instant AI scores (0-100), strengths, skill gaps, and interview questions via Groq API (Llama 3.3 70B)
- Role-Based Dashboards — Candidate, Recruiter, and Admin portals with tailored functionality
- Job Board — Browse, search, and filter job listings with salary ranges and job types
- Application Tracking — Real-time status updates (Pending to Shortlisted to Interview to Rejected)
- Automated Email Notifications — Status changes trigger real email delivery via Mailtrap API
- Weighted Candidate Ranking — Multi-criteria SQL ranking combining AI score, experience, and education
- Stored Procedures and Triggers — Atomic transactions, auto-notifications on status changes
- Admin Panel — System-wide stats, user management, role assignment

## Tech Stack

Frontend: React (Vite), React Router and Axios
Backend: Python 3.11+, Flask, Flask-JWT-Extended, Flask-SQLAlchemy
Database: MySQL 8.0 with views, stored procedures, and triggers
AI: Groq API using Llama 3.3 70B
PDF Processing: PyMuPDF
Email: Mailtrap API

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Groq API key from console.groq.com

### 1. Clone the repository
git clone https://github.com/ahmedrazakazim/Recroot.git
cd Recroot

### 2. Database
mysql -u root -p
CREATE DATABASE recroot;
USE recroot;
source recroot_fixed.sql;
source backend/procedures.sql;
source backend/views.sql;

### 3. Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install flask flask-sqlalchemy flask-jwt-extended flask-cors pymysql pymupdf groq python-dotenv requests

Create a .env file in backend with:
SECRET_KEY=recroot-super-secret-key-2026
JWT_SECRET_KEY=recroot-jwt-secret-2026
DATABASE_URL=mysql+pymysql://root:admin@localhost/recroot
GROQ_API_KEY=your_groq_api_key_here

python app.py

### 4. Frontend
cd frontend
npm install
npm run dev

## User Roles

Candidate: Browse jobs, upload resume, AI screening, apply, and track applications
Recruiter: Post jobs, view ranked applicants, and update application status
Admin: View system stats, manage users, change roles, and delete accounts

## Demo Accounts

Admin: admin@recroot.com / admin123
Recruiter: hassan@recroot.com / hassan123
Candidate: Register via the signup page

## Team

Ahmed Raza (24K-1010)
Simal Hassan (24K-0688)
Laiba Jamil (24K-0812)

FAST NUCES, Spring 2026
Database Systems and Artificial Intelligence
