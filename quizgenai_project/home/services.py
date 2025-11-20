import fitz
import google.generativeai as genai
import json
import requests
from bs4 import BeautifulSoup
from django.conf import settings

try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    print(f"Error configuring Gemini API in services.py: {e}")
    model = None

def extract_text_from_url(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header", "aside"]):
            script.decompose()
            
        text = soup.get_text(separator=' ', strip=True)
        return text
    except Exception as e:
        print(f"Error extracting text from URL: {e}")
        raise Exception(f"Could not extract text from the URL: {e}")

def generate_quiz_from_text(text, num_questions, custom_instructions):
    if model is None:
        raise Exception("Gemini API model is not configured.")

    if not text.strip():
        raise Exception("Could not extract any meaningful text.")

    prompt_base = f"""
    Based on the following text, create a multiple-choice quiz with {num_questions} questions.
    The response MUST be a valid JSON array and nothing else. Do not include any text, code block markers like ```json, or any other formatting before or after the JSON array.

    Each object in the array must have these exact keys:
    1. "question": A string for the question text.
    2. "options": An array of 4 strings representing the possible answers.
    3. "correctAnswer": The 0-based index of the correct answer within the "options" array.
    4. "explanation": A short explanation (1-2 sentences) of why the correct answer is correct.

    Example format:
    [
      {{"question": "What is the primary topic?", "options": ["A", "B", "C", "D"], "correctAnswer": 2, "explanation": "Option C is correct because..."}}
    ]
    IMPORTANT: You must generate questions that test the conceptual and scientific understanding of the topics presented in the text.
    GOOD QUESTIONS are about: chemical principles, scientific concepts, reactions, definitions, properties, and applications (e.g., "What is a thermodynamic function?", "What is the principle of potentiometry?").
    BAD QUESTIONS (DO NOT ASK): Trivial questions about the document's structure, layout, or metadata. This includes questions about page numbers, section headings, experiment numbers (e.g., "What is Experiment 1?"), assessment procedures, rubrics, or lists of content.
    """

    if custom_instructions and custom_instructions.strip():
        prompt_instructions = f"\n\nFollow these additional instructions when generating the quiz: {custom_instructions.strip()}\n"
    else:
        prompt_instructions = ""

    # Truncate text if it's too long to avoid token limits (approx 30k chars is safe for Flash)
    # Gemini 1.5 Flash has a huge context window, but let's be safe and efficient
    max_chars = 100000 
    if len(text) > max_chars:
        text = text[:max_chars] + "...(truncated)"

    prompt_text_section = f"""
    Here is the text to analyze:
    ---
    {text}
    ---
    """

    final_prompt = prompt_base + prompt_instructions + prompt_text_section

    try:
        response = model.generate_content(final_prompt)
    except Exception as api_error:
        print(f"Error calling Gemini API: {api_error}")
        raise Exception(f"Failed to communicate with the AI model: {api_error}")

    try:
        if not response.text:
            print(f"Gemini Response Feedback: {response.prompt_feedback}")
            raise Exception("The AI returned an empty response. This may be due to safety filters or the input content.")

        response_text = response.text.strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        if response_text.startswith("<") or response_text.startswith("<!"):
            start_idx = response_text.find("[")
            if start_idx != -1:
                response_text = response_text[start_idx:]
        
        last_bracket = response_text.rfind("]")
        if last_bracket != -1:
            response_text = response_text[:last_bracket + 1]
        
        response_text = response_text.strip()

        quiz_data = json.loads(response_text)
        
        if not isinstance(quiz_data, list):
            raise Exception("The AI response is not a valid array of questions.")
        
        if len(quiz_data) == 0:
            raise Exception("The AI generated no questions. Please try again with a different PDF or fewer questions.")
        
        for i, question in enumerate(quiz_data):
            if not isinstance(question, dict):
                raise Exception(f"Question {i+1} is not a valid object.")
            if "question" not in question or "options" not in question or "correctAnswer" not in question:
                raise Exception(f"Question {i+1} is missing required fields (question, options, correctAnswer).")
            if not isinstance(question.get("options"), list) or len(question.get("options", [])) != 4:
                raise Exception(f"Question {i+1} does not have exactly 4 options.")
            # Explanation is optional for backward compatibility, but we expect it for new quizzes
            if "explanation" not in question:
                question["explanation"] = "No explanation provided."

    except json.JSONDecodeError as json_err:
        print(f"Failed to decode JSON. Raw response: {response.text}")
        raise Exception("The AI returned a malformed response. This sometimes happens with very large question counts. Try reducing the number of questions (max 25 recommended) or try again.")
    except Exception as parse_error:
        print(f"Error processing response: {parse_error}")
        if "JSON" not in str(parse_error):
            raise parse_error
        raise Exception("An error occurred while processing the AI response. Please try again with fewer questions.")

    return quiz_data

def generate_quiz_from_pdf(pdf_file, num_questions, custom_instructions):
    try:
        pdf_document = fitz.open(stream=pdf_file.read(), filetype="pdf")
        pdf_text = "".join(page.get_text() for page in pdf_document)
    except Exception as fitz_error:
        print(f"Error opening or reading PDF: {fitz_error}")
        raise Exception(f"Could not process the PDF file: {fitz_error}")

    return generate_quiz_from_text(pdf_text, num_questions, custom_instructions)

def generate_quiz_from_url(url, num_questions, custom_instructions):
    text = extract_text_from_url(url)
    return generate_quiz_from_text(text, num_questions, custom_instructions)


def estimate_generation_time(pdf_text_length, num_questions):
    base_min = 15
    base_max = 25
    
    size_factor_min = (pdf_text_length / 10000) * 5
    size_factor_max = (pdf_text_length / 10000) * 8
    
    questions_factor_min = int(num_questions) * 3
    questions_factor_max = int(num_questions) * 5
    
    total_min = int(base_min + size_factor_min + questions_factor_min)
    total_max = int(base_max + size_factor_max + questions_factor_max)
    
    total_min = min(total_min, 180)
    total_max = min(total_max, 180)
    
    return (total_min, total_max)

