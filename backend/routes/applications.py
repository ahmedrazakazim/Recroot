import json
import requests
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Application, Candidate, Job, Resume
from ai_screening import screen_resume

apps_bp = Blueprint('applications', __name__)

# -------------------------------------------------------------------
# ROUTE 1: Candidate applies to a job (WITH AI SCREENING)
# -------------------------------------------------------------------
@apps_bp.route('/applications', methods=['POST'])
@jwt_required()
def apply():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    # Step 1: Find this user's candidate profile (candidates table)
    candidate = Candidate.query.filter_by(user_id=user_id).first()
    if not candidate:
        return jsonify({'error': 'Candidate profile not found'}), 400

    # Step 2: Prevent duplicate applications (UNIQUE constraint on candidate+job)
    existing = Application.query.filter_by(
        candidate_id=candidate.candidate_id,
        job_id=data['job_id']
    ).first()
    if existing:
        return jsonify({'error': 'You already applied to this job'}), 409

    # Step 3: Get resume text (if candidate uploaded a resume)
    resume_id = data.get('resume_id')
    resume_text = ""
    if resume_id:
        resume = Resume.query.get(resume_id)
        if resume and resume.extracted_text:
            resume_text = resume.extracted_text

    # Step 4: Get job description (for AI to compare against)
    job = Job.query.get(data['job_id'])
    job_desc = job.description + "\n" + (job.requirements or "")

    # Step 5: AI SCREENING — the core AI feature
    ai_score = None
    ai_feedback = None

    if resume_text and job_desc:
        try:
            result = screen_resume(resume_text, job_desc)
            ai_score = result.get('score')
            ai_feedback = json.dumps({
                'strengths': result.get('strengths'),
                'gaps': result.get('gaps'),
                'questions': result.get('questions')
            })
        except Exception as e:
            print(f"AI screening failed: {e}")
            # Application still goes through even if AI fails

    # Step 6: Create the application record in MySQL
    app = Application(
        candidate_id=candidate.candidate_id,
        job_id=data['job_id'],
        resume_id=resume_id,
        status='pending',
        ai_score=ai_score,
        ai_feedback=ai_feedback
    )
    db.session.add(app)
    db.session.commit()

    return jsonify({
        'message': 'Application submitted with AI screening',
        'application_id': app.application_id,
        'ai_score': ai_score
    }), 201


# -------------------------------------------------------------------
# ROUTE 2: Candidate views their own applications
# -------------------------------------------------------------------
@apps_bp.route('/applications/mine', methods=['GET'])
@jwt_required()
def my_applications():
    user_id = int(get_jwt_identity())
    candidate = Candidate.query.filter_by(user_id=user_id).first()
    if not candidate:
        return jsonify({'error': 'Candidate profile not found'}), 400

    apps = Application.query.filter_by(candidate_id=candidate.candidate_id).all()
    result = []
    for a in apps:
        job = Job.query.get(a.job_id)
        result.append({
    'application_id': a.application_id,
    'job_id': a.job_id,
    'job_title': job.title if job else 'Unknown',
    'status': a.status,
    'ai_score': float(a.ai_score) if a.ai_score else None,
    'ai_feedback': a.ai_feedback,
    'applied_at': str(a.applied_at)
})
    return jsonify(result), 200


# -------------------------------------------------------------------
# ROUTE 3: Recruiter sees all applications for a job (ranked by AI score)
# -------------------------------------------------------------------
@apps_bp.route('/jobs/<int:job_id>/applications', methods=['GET'])
@jwt_required()
def job_applications(job_id):
    # ORDER BY ai_score DESC = best candidates first
    apps = Application.query.filter_by(job_id=job_id)\
        .order_by(Application.ai_score.desc()).all()

    result = []
    for a in apps:
        candidate = Candidate.query.get(a.candidate_id)
        user = candidate.user if candidate else None
        result.append({
    'application_id': a.application_id,
    'job_title': job.title if job else 'Unknown',
    'status': a.status,
    'ai_score': float(a.ai_score) if a.ai_score else None,
    'ai_feedback': a.ai_feedback,           # <-- ADD THIS LINE
    'applied_at': str(a.applied_at)
})
    return jsonify(result), 200


# -------------------------------------------------------------------
# ROUTE 4: Recruiter updates application status
# -------------------------------------------------------------------
@apps_bp.route('/applications/<int:app_id>', methods=['PUT'])
@jwt_required()
def update_status(app_id):
    app = Application.query.get_or_404(app_id)
    data = request.get_json()

    if 'status' in data:
        app.status = data['status']
    if 'ai_score' in data:
        app.ai_score = data['ai_score']
    if 'ai_feedback' in data:
        app.ai_feedback = data['ai_feedback']
    db.session.commit()

    # Send email via Mailtrap
    print("DEBUG: Starting email send...")
    try:
        from models import User, Candidate
        candidate = Candidate.query.get(app.candidate_id)
        print(f"DEBUG: candidate found: {candidate}")
        if candidate:
            user = User.query.get(candidate.user_id)
            print(f"DEBUG: user found: {user}, email: {user.email if user else 'N/A'}")
            if user and user.email:
                print(f"DEBUG: Sending to {user.email}")
                resp = requests.post('https://send.api.mailtrap.io/api/send',
                    headers={
                        'Authorization': 'Bearer YOUR_MAILTRAP_TOKEN',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'from': {'email': 'hello@demomailtrap.co', 'name': 'Recroot'},
                        'to': [{'email': user.email}],
                        'subject': f'Recroot - Application {app.status}',
                        'text': f'Hello {user.full_name}, your application has been {app.status}.'
                    },
                    timeout=5
                )
                print(f"DEBUG: Mailtrap response: {resp.status_code} - {resp.text}")
    except Exception as e:
        import traceback
        print(f"Email failed: {e}")
        traceback.print_exc()

    return jsonify({'message': 'Application updated'}), 200