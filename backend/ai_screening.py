import json
from groq import Groq
import os

def screen_resume(resume_text, job_description):
    """Send resume + job description to Groq API, return AI score and feedback."""
    
    client = Groq(api_key=os.getenv('GROQ_API_KEY'))
    
    prompt = f"""You are an expert HR recruiter. Analyze this resume against the job description.
Return ONLY valid JSON in this exact format:
{{
    "score": <number between 0-100>,
    "strengths": "<2-3 sentences about candidate strengths>",
    "gaps": "<2-3 sentences about missing skills or experience>",
    "questions": ["<interview question 1>", "<question 2>", "<question 3>", "<question 4>", "<question 5>"]
}}

Job Description:
{job_description}

Resume:
{resume_text}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1000
    )
    
    result = response.choices[0].message.content
    
    # Extract JSON from response
    if "```json" in result:
        result = result.split("```json")[1].split("```")[0]
    elif "```" in result:
        result = result.split("```")[1].split("```")[0]
    
    return json.loads(result)