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

# Delete user
@auth_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    admin_id = int(get_jwt_identity())
    admin = User.query.get(admin_id)
    if admin.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200