import json
import os
from groq import Groq
import re

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

If the job description is vague or minimal, infer the likely requirements from the job title and industry context.
Always find something meaningful to evaluate — every candidate has strengths and areas to grow.

Return ONLY valid JSON (no markdown, no extra text):
{{
    "score": <number between 0-100>,
    "strengths": "<2-3 sentences highlighting skills that match or could transfer to this role>",
    "gaps": "<2-3 sentences identifying specific areas for improvement relevant to the role>"
}}

Scoring guidelines:
- Strong match for explicit or inferred requirements: 80-95
- Moderate match with transferable skills: 55-75
- Entry-level or career changer with potential: 30-50
- Minimal relevance: 10-25

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

def anonymize_text(text):
    """Remove personally identifiable information from resume text."""
    # Remove email addresses
    text = re.sub(r'\S+@\S+\.\S+', '[EMAIL REDACTED]', text)
    
    # Remove phone numbers (various formats)
    text = re.sub(r'\+?\d[\d\s\-\(\)]{7,}\d', '[PHONE REDACTED]', text)
    
    # Remove common Pakistani university names
    universities = [
        'FAST', 'NUCES', 'LUMS', 'NUST', 'GIKI', 'IBA', 'Habib University',
        'University of Karachi', 'University of Lahore', 'Punjab University',
        'COMSATS', 'SZABIST', 'Bahria University', 'Air University'
    ]
    for uni in universities:
        text = re.sub(uni, '[UNIVERSITY REDACTED]', text, flags=re.IGNORECASE)
    
    # Remove gender-indicating words
    gender_words = [
        r'\bhe\b', r'\bshe\b', r'\bhis\b', r'\bher\b', r'\bhim\b',
        r'\bmr\b', r'\bms\b', r'\bmrs\b', r'\bmiss\b', r'\bsir\b',
        r'\bhimself\b', r'\bherself\b', r'\bmale\b', r'\bfemale\b'
    ]
    for word in gender_words:
        text = re.sub(word, '[PRONOUN REDACTED]', text, flags=re.IGNORECASE)
    
    # Remove names (heuristic: lines that look like a name at the top)
    # This is simple but effective — most resumes start with a name
    lines = text.split('\n')
    cleaned_lines = []
    for i, line in enumerate(lines):
        # First 3 lines often contain the name — redact short lines
        if i < 3 and len(line.strip()) < 50 and line.strip():
            cleaned_lines.append('[NAME REDACTED]')
        else:
            cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)