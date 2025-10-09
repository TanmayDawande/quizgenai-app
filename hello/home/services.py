# hello/home/services.py

import fitz
import google.generativeai as genai
import json
from django.conf import settings

# Configure the Gemini model
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    print(f"Error configuring Gemini API in services.py: {e}")
    model = None

def generate_quiz_from_pdf(pdf_file):
    """
    Extracts text from a PDF and uses Gemini to generate a quiz.
    This version includes robust error handling for the AI's response.
    """
    if model is None:
        raise Exception("Gemini API model is not configured.")

    # 1. Extract text
    pdf_document = fitz.open(stream=pdf_file.read(), filetype="pdf")
    pdf_text = "".join(page.get_text() for page in pdf_document)[:8000]

    if not pdf_text.strip():
        raise Exception("Could not extract any text from the PDF.")

    # 2. Create the prompt for the AI
    prompt = f"""
    Based on the following text, create a multiple-choice quiz with 5 questions.
    The response MUST be a valid JSON array and nothing else. Do not include any text, code block markers like ```json, or any other formatting before or after the JSON array.

    Each object in the array must have these exact keys:
    1. "question": A string for the question text.
    2. "options": An array of 4 strings representing the possible answers.
    3. "correctAnswer": The 0-based index of the correct answer within the "options" array.

    Example format:
    [
      {{"question": "What is the primary topic?", "options": ["A", "B", "C", "D"], "correctAnswer": 2}}
    ]

    Here is the text to analyze:
    ---
    {pdf_text}
    ---
    """

    # 3. Call the Gemini API
    response = model.generate_content(prompt)
    
    # 4. NEW: Add a check to ensure the response is valid before parsing
    try:
        # Check if the response text is empty or None
        if not response.text:
            raise Exception("The AI returned an empty response. This may be due to safety filters or the input content.")
        
        # Attempt to parse the JSON
        quiz_data = json.loads(response.text)
        
    except json.JSONDecodeError:
        # This will catch cases where the AI returns text that is not valid JSON
        raise Exception("The AI returned a malformed response that could not be parsed.")
    
    return quiz_data