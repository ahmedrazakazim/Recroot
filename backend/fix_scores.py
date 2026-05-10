from app import create_app
from models import db, Application, Resume, Job
from ai_screening import get_keyword_match

app = create_app()

with app.app_context():
    apps = Application.query.filter(Application.keyword_score == None).all()
    for a in apps:
        resume = Resume.query.get(a.resume_id)
        job = Job.query.get(a.job_id)
        if resume and job and resume.extracted_text:
            score = get_keyword_match(resume.extracted_text, job.description + " " + (job.requirements or ""))
            a.keyword_score = score
            db.session.commit()
            print(f"App {a.application_id}: {score}")
    print("Done!")