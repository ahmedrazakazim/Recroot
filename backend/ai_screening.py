import json
import os
from groq import Groq

def screen_resume(resume_text, job_description):
    """Send resume + job description to Groq API. Falls back to Mistral if needed."""
    
    # Try Groq first
    try:
        client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        return _call_llm(client, resume_text, job_description, provider='groq')
    except Exception as e:
        print(f"Groq failed: {e}, trying Mistral fallback...")
        # In production, swap to Mistral client here
        # For now, return a graceful failure
        raise Exception(f"AI screening unavailable: {e}")


def _call_llm(client, resume_text, job_description, provider='groq'):
    """Make the actual LLM call with prompt engineering."""
    
    prompt = f"""You are a professional HR evaluator with 15 years of experience in technical recruiting. 
Your task is to analyze a candidate's resume against a job description and produce a structured evaluation.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{{
    "score": <number between 0-100>,
    "strengths": "<2-3 sentences highlighting specific matching skills and experience>",
    "gaps": "<2-3 sentences identifying missing qualifications or experience>",
    "questions": ["<tailored technical question 1>", "<question 2>", "<question 3>", "<question 4>", "<question 5>"]
}}

Example of expected output quality:
For a Python developer role:
- If candidate knows Python but not Flask: score 60-75, gaps mention Flask missing
- If candidate knows Python + Flask + SQL: score 85-95
- If candidate has no relevant experience: score 10-25

Job Description:
{job_description}

Resume:
{resume_text}"""

    if provider == 'groq':
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert HR recruiter. Always respond with ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
    else:
        # Mistral fallback would go here
        raise Exception("Mistral not configured")
    
    result = response.choices[0].message.content
    
    # Extract JSON (handle markdown wrapping)
    result = result.strip()
    if result.startswith("```json"):
        result = result[7:]
    if result.startswith("```"):
        result = result[3:]
    if result.endswith("```"):
        result = result[:-3]
    result = result.strip()
    
    return json.loads(result)