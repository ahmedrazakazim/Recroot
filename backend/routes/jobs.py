from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Job, Company, Resume
from ai_screening import screen_resume
import json

jobs_bp = Blueprint('jobs', __name__)

# Get all open jobs
@jobs_bp.route('/jobs', methods=['GET'])
def get_jobs():
    jobs = Job.query.filter_by(status='open').all()
    result = []
    for j in jobs:
        company = Company.query.get(j.company_id)
        result.append({
            'job_id': j.job_id,
            'title': j.title,
            'description': j.description,
            'requirements': j.requirements,
            'company': 'Confidential' if getattr(j, 'anonymous', False) else (company.company_name if company else 'Unknown'),
            'deadline': str(j.deadline) if j.deadline else None,
            'created_at': str(j.created_at)
        })
    return jsonify(result), 200

# Get single job
@jobs_bp.route('/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    j = Job.query.get_or_404(job_id)
    company = Company.query.get(j.company_id)
    return jsonify({
        'job_id': j.job_id,
        'title': j.title,
        'description': j.description,
        'requirements': j.requirements,
        'company': company.company_name if company else 'Unknown',
        'status': j.status,
        'deadline': str(j.deadline) if j.deadline else None,
        'created_at': str(j.created_at)
    }), 200

# Create job (recruiter only)
@jobs_bp.route('/jobs', methods=['POST'])
@jwt_required()
def create_job():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Use provided company_id or find recruiter's default company
    company_id = data.get('company_id')
    if not company_id:
        company = Company.query.filter_by(user_id=user_id).first()
        if not company:
            return jsonify({'error': 'No company profile found. Create a company first.'}), 400
        company_id = company.company_id
    
    job = Job(
        company_id=company_id,
        title=data['title'],
        description=data.get('description'),
        requirements=data.get('requirements'),
        deadline=data.get('deadline'),
        job_type=data.get('job_type', 'Full-time'),
        salary_range=data.get('salary_range'),
        anonymous=data.get('anonymous', False)
    )
    db.session.add(job)
    db.session.commit()
    
    return jsonify({'message': 'Job created', 'job_id': job.job_id}), 201
# Update job status
@jobs_bp.route('/jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    job = Job.query.get_or_404(job_id)
    data = request.get_json()
    
    if 'status' in data:
        job.status = data['status']
    if 'title' in data:
        job.title = data['title']
    if 'description' in data:
        job.description = data['description']
    if 'job_type' in data:
        job.job_type = data['job_type']
    if 'salary_range' in data:
        job.salary_range = data['salary_range']
    
    db.session.commit()
    return jsonify({'message': 'Job updated'}), 200

# Delete job
@jobs_bp.route('/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    job = Job.query.get_or_404(job_id)
    db.session.delete(job)
    db.session.commit()
    return jsonify({'message': 'Job deleted'}), 200


# Get recruiter's own jobs
@jobs_bp.route('/jobs/mine', methods=['GET'])
@jwt_required()
def my_jobs():
    user_id = int(get_jwt_identity())
    company = Company.query.filter_by(user_id=user_id).first()
    if not company:
        return jsonify([]), 200
    
    jobs = Job.query.filter_by(company_id=company.company_id).all()
    result = []
    for j in jobs:
        result.append({
    'job_id': j.job_id,
    'title': j.title,
    'description': j.description,
    'requirements': j.requirements,
    'company': company.company_name,
    'status': j.status,
    'job_type': getattr(j, 'job_type', 'Full-time'),
    'salary_range': getattr(j, 'salary_range', None),
    'deadline': str(j.deadline) if j.deadline else None,
    'created_at': str(j.created_at)
})
    return jsonify(result), 200


# Get applications for a job (recruiter view)
@jobs_bp.route('/jobs/<int:job_id>/applicants', methods=['GET'])
@jwt_required()
def job_applicants(job_id):
    from models import Application, Candidate, User
    apps = Application.query.filter_by(job_id=job_id).order_by(Application.ai_score.desc()).all()
    result = []
    for a in apps:
        candidate = Candidate.query.get(a.candidate_id)
        user = User.query.get(candidate.user_id) if candidate else None
        result.append({
            'application_id': a.application_id,
            'candidate_name': user.full_name if user else 'Unknown',
            'status': a.status,
            'ai_score': float(a.ai_score) if a.ai_score else None,
            'ai_feedback': a.ai_feedback,
            'applied_at': str(a.applied_at),
            'bias_flagged': a.bias_flagged or 0
        })
    return jsonify(result), 200



# Screening endpoint
@jobs_bp.route('/screen', methods=['POST'])
@jwt_required()
def screen_resume_route():
    data = request.get_json()
    resume_id = data.get('resume_id')
    job_id = data.get('job_id')
    
    resume = Resume.query.get(resume_id)
    job = Job.query.get(job_id)
    
    if not resume or not job:
        return jsonify({'error': 'Resume or job not found'}), 400
    
    if not resume.extracted_text:
        return jsonify({'error': 'No text extracted from resume'}), 400
    
    job_desc = job.description + "\n" + (job.requirements or "")
    
    try:
        result = screen_resume(resume.extracted_text, job_desc)
        return jsonify({
            'ai_score': result.get('score'),
            'ai_feedback': json.dumps({
                'strengths': result.get('strengths'),
                'gaps': result.get('gaps'),
                'questions': result.get('questions')
            })
        }), 200
    except Exception as e:
        return jsonify({'error': f'Screening failed: {str(e)}'}), 500
    

@jobs_bp.route('/companies/mine', methods=['GET'])
@jwt_required()
def my_companies():
    user_id = int(get_jwt_identity())
    companies = Company.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'company_id': c.company_id,
        'company_name': c.company_name
    } for c in companies]), 200