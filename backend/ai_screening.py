import json
import os
from groq import Groq
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def get_keyword_match(resume_text, job_description):
    """Calculate TF-IDF cosine similarity between resume and job description."""
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
    return round(similarity[0][0] * 100, 2)
"""Screen resume with Groq. Returns score, strengths, gaps, and interview questions."""
def screen_resume(resume_text, job_description):
    client = Groq(api_key=os.getenv('GROQ_API_KEY'))
    
    score_result = _get_score_and_feedback(client, resume_text, job_description)
    questions = _get_interview_questions(client, resume_text, job_description)
    keyword_match = get_keyword_match(resume_text, job_description)
    
    return {
        'score': score_result['score'],
        'strengths': score_result['strengths'],
        'gaps': score_result['gaps'],
        'questions': questions,
        'keyword_match': keyword_match
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