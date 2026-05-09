import json
import os
from groq import Groq

def screen_resume(resume_text, job_description):
    """Screen resume with Groq. Returns score, strengths, gaps, and interview questions."""
    
    client = Groq(api_key=os.getenv('GROQ_API_KEY'))
    
    # Call 1: Deterministic scoring at temperature 0.3
    score_result = _get_score_and_feedback(client, resume_text, job_description)
    
    # Call 2: Creative question generation at temperature 0.7
    questions = _get_interview_questions(client, resume_text, job_description)
    
    return {
        'score': score_result['score'],
        'strengths': score_result['strengths'],
        'gaps': score_result['gaps'],
        'questions': questions
    }


def _get_score_and_feedback(client, resume_text, job_description):
    """Deterministic call: strict scoring at temperature 0.3."""
    
    prompt = f"""You are a professional HR evaluator with 15 years of experience in technical recruiting.
Analyze this resume against the job description and produce a structured evaluation.

Return ONLY valid JSON (no markdown, no extra text):
{{
    "score": <number between 0-100>,
    "strengths": "<2-3 sentences highlighting specific matching skills>",
    "gaps": "<2-3 sentences identifying missing qualifications>"
}}

Scoring examples:
- Candidate matches all required skills + has bonus experience: 85-95
- Candidate matches most required skills, missing 1-2: 60-75
- Candidate has relevant background but missing key requirements: 30-55
- Candidate has no relevant experience: 10-25

Job Description:
{job_description}

Resume:
{resume_text}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an expert HR recruiter. Always respond with ONLY valid JSON. No markdown, no explanation."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=500
    )
    
    return _parse_json(response.choices[0].message.content)


def _get_interview_questions(client, resume_text, job_description):
    """Creative call: generate tailored interview questions at temperature 0.7."""
    
    prompt = f"""You are a thoughtful technical interviewer. Based on the candidate's resume and the job description, 
generate 5 tailored interview questions that probe their experience, skills, and potential gaps.

Return ONLY a JSON array of strings:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]

Focus on:
- Questions that reveal depth of experience
- Questions about technologies mentioned in the job but not the resume
- Behavioral questions about teamwork and problem-solving
- One question about how they handle unfamiliar tech

Job Description:
{job_description}

Resume:
{resume_text}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an expert technical interviewer. Return ONLY a JSON array of 5 strings."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=400
    )
    
    result = _parse_json(response.choices[0].message.content)
    
    # Ensure we got a list of strings
    if isinstance(result, list):
        return result
    elif isinstance(result, dict) and 'questions' in result:
        return result['questions']
    else:
        return ["Tell me about your experience.", "What are your strengths?", 
                "Where do you see yourself in 5 years?", "Why this role?", 
                "Do you have any questions for us?"]


def _parse_json(raw):
    """Extract JSON from LLM response (handles markdown wrapping)."""
    raw = raw.strip()
    if raw.startswith("```json"):
        raw = raw[7:]
    elif raw.startswith("```"):
        raw = raw[3:]
    if raw.endswith("```"):
        raw = raw[:-3]
    return json.loads(raw.strip())