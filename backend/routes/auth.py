from flask import Blueprint, request, jsonify
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
auth_bp = Blueprint('auth', __name__)

# Register
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        full_name=data['full_name'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role=data['role']
    )
    db.session.add(user)
    db.session.commit()
    if data['role'] == 'candidate':
        from models import Candidate
        new_candidate = Candidate(user_id=user.user_id)
        db.session.add(new_candidate)
        db.session.commit()
    
    if data['role'] == 'recruiter':
        from models import Company
        new_company = Company(
            user_id=user.user_id,
            company_name=data.get('company_name', f"{data['full_name']}'s Company")
        )
        db.session.add(new_company)
        db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

# Login
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    token = create_access_token(identity=str(user.user_id))
    return jsonify({
        'token': token,
        'user': {
            'id': user.user_id,
            'name': user.full_name,
            'role': user.role
        }
    }), 200

# Admin Stats
@auth_bp.route('/admin/stats', methods=['GET'])
@jwt_required()
def admin_stats():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    from models import Job, Application
    
    total_users = User.query.count()
    total_jobs = Job.query.count()
    total_apps = Application.query.count()
    avg_score = db.session.query(db.func.avg(Application.ai_score)).scalar()
    
    return jsonify({
        'totalUsers': total_users,
        'totalJobs': total_jobs,
        'totalApplications': total_apps,
        'avgAiScore': float(avg_score) if avg_score else 0
    }), 200


# Get all users
@auth_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def admin_users():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    users = User.query.all()
    return jsonify([{
        'user_id': u.user_id,
        'full_name': u.full_name,
        'email': u.email,
        'role': u.role
    } for u in users]), 200

# Update user role
@auth_bp.route('/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user_role(user_id):
    admin_id = int(get_jwt_identity())
    admin = User.query.get(admin_id)
    if admin.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    user.role = data['role']
    db.session.commit()
    return jsonify({'message': 'Role updated'}), 200


    # Get notifications for logged-in user
@auth_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    from models import Notification
    user_id = int(get_jwt_identity())
    notifs = Notification.query.filter_by(user_id=user_id)\
        .order_by(Notification.created_at.desc()).all()
    return jsonify([{
        'notification_id': n.notification_id,
        'message': n.message,
        'is_read': n.is_read,
        'created_at': str(n.created_at)
    } for n in notifs]), 200


# Get all companies
@auth_bp.route('/admin/companies', methods=['GET'])
@jwt_required()
def admin_companies():
    from models import Company
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    companies = Company.query.all()
    return jsonify([{
        'company_id': c.company_id,
        'company_name': c.company_name,
        'industry': c.industry,
        'location': c.location,
        'user_id': c.user_id
    } for c in companies]), 200

# Create company
@auth_bp.route('/admin/companies', methods=['POST'])
@jwt_required()
def create_company():
    from models import Company
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    company = Company(
        company_name=data['company_name'],
        industry=data.get('industry', ''),
        location=data.get('location', ''),
        user_id=data.get('user_id')
    )
    db.session.add(company)
    db.session.commit()
    return jsonify({'message': 'Company created', 'company_id': company.company_id}), 201

# Delete company
@auth_bp.route('/admin/companies/<int:company_id>', methods=['DELETE'])
@jwt_required()
def delete_company(company_id):
    from models import Company, Job
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    company = Company.query.get_or_404(company_id)
    
    # Check for linked jobs
    job_count = Job.query.filter_by(company_id=company_id).count()
    if job_count > 0:
        return jsonify({'error': f'Cannot delete: {job_count} job(s) linked to this company. Delete jobs first.'}), 400
    
    db.session.delete(company)
    db.session.commit()
    return jsonify({'message': 'Company deleted'}), 200

#delete user
@auth_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    from models import Candidate, Application, Company, Resume, Notification
    admin_id = int(get_jwt_identity())
    admin = User.query.get(admin_id)
    if admin.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    
    if user.user_id == admin_id:
        return jsonify({'error': 'Cannot delete yourself'}), 400
    
    # Delete related records in order
    candidate = Candidate.query.filter_by(user_id=user_id).first()
    if candidate:
        # Delete applications
        Application.query.filter_by(candidate_id=candidate.candidate_id).delete()
        # Delete resumes
        Resume.query.filter_by(candidate_id=candidate.candidate_id).delete()
        # Delete candidate profile
        db.session.delete(candidate)
    
    # Delete company if recruiter
    Company.query.filter_by(user_id=user_id).delete()
    
    # Delete notifications
    Notification.query.filter_by(user_id=user_id).delete()
    
    # Finally delete user
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'User deleted'}), 200