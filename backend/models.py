from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin', 'recruiter', 'candidate'), nullable=False)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)

class Company(db.Model):
    __tablename__ = 'companies'
    company_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    company_name = db.Column(db.String(150), nullable=False)
    industry = db.Column(db.String(100))
    location = db.Column(db.String(150))
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)

class Job(db.Model):
    __tablename__ = 'jobs'
    job_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.company_id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)
    status = db.Column(db.Enum('open', 'closed'), default='open')
    anonymous = db.Column(db.Boolean, default=False)
    deadline = db.Column(db.Date)
    job_type = db.Column(db.String(20), default='Full-time')       
    salary_range = db.Column(db.String(50), nullable=True)          
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)

class Candidate(db.Model):
    __tablename__ = 'candidates'
    candidate_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    skills = db.Column(db.Text)
    experience_years = db.Column(db.Integer, default=0)
    education = db.Column(db.String(150))

class Resume(db.Model):
    __tablename__ = 'resumes'
    resume_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.candidate_id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    extracted_text = db.Column(db.Text)
    uploaded_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)

class Application(db.Model):
    __tablename__ = 'applications'
    application_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.candidate_id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.job_id'), nullable=False)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.resume_id'))
    status = db.Column(db.Enum('pending', 'shortlisted', 'rejected', 'interview_scheduled', 'hired'), default='pending')
    ai_score = db.Column(db.Numeric(5, 2))
    ai_feedback = db.Column(db.Text)
    keyword_score = db.Column(db.Numeric(5, 2))
    applied_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)

class Interview(db.Model):
    __tablename__ = 'interviews'
    interview_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.application_id'), nullable=False)
    scheduled_at = db.Column(db.DateTime)
    ai_questions = db.Column(db.JSON)
    feedback = db.Column(db.Text)

class Notification(db.Model):
    __tablename__ = 'notifications'
    notification_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)