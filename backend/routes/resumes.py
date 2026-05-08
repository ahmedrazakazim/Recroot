import fitz  # PyMuPDF
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Resume, Candidate
import os

resumes_bp = Blueprint('resumes', __name__)

@resumes_bp.route('/resumes/upload', methods=['POST'])
@jwt_required()
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.pdf'):
        user_id = int(get_jwt_identity())
        candidate = Candidate.query.filter_by(user_id=user_id).first()
        if not candidate:
            return jsonify({'error': 'Candidate profile not found'}), 400
            
        # Extract text
        doc = fitz.open(stream=file.read(), filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        
        # Save to database
        new_resume = Resume(
            candidate_id=candidate.candidate_id,
            file_path="uploads/" + file.filename, # Simple path
            extracted_text=text
        )
        db.session.add(new_resume)
        db.session.commit()
        
        return jsonify({'message': 'Resume uploaded', 'resume_id': new_resume.resume_id}), 201
        
    return jsonify({'error': 'Invalid file type'}), 400
