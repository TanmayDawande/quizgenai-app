import fitz
import google.generativeai as genai
import json
from django.conf import settings

# Configure the Gemini model
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    # Using a suitable Flash model
    model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    print(f"Error configuring Gemini API in services.py: {e}")
    model = None

# Function signature accepts pdf_file, num_questions, and custom_instructions
def generate_quiz_from_pdf(pdf_file, num_questions, custom_instructions):
    """
    Extracts text from a PDF and uses Gemini to generate a quiz,
    incorporating custom user instructions.
    """
    if model is None:
        raise Exception("Gemini API model is not configured.")

    # 1. Extract text
    try:
        pdf_document = fitz.open(stream=pdf_file.read(), filetype="pdf")
        # Extract text from all pages and limit the total length
        pdf_text = "".join(page.get_text() for page in pdf_document)
    except Exception as fitz_error:
        print(f"Error opening or reading PDF: {fitz_error}")
        raise Exception(f"Could not process the PDF file: {fitz_error}")


    if not pdf_text.strip():
        raise Exception("Could not extract any meaningful text from the PDF.")

    # 2. Build the prompt, including custom instructions if provided
    prompt_base = f"""
    Based on the following text, create a multiple-choice quiz with {num_questions} questions.
    The response MUST be a valid JSON array and nothing else. Do not include any text, code block markers like ```json, or any other formatting before or after the JSON array.

    Each object in the array must have these exact keys:
    1. "question": A string for the question text.
    2. "options": An array of 4 strings representing the possible answers.
    3. "correctAnswer": The 0-based index of the correct answer within the "options" array.

    Example format:
    [
      {{"question": "What is the primary topic?", "options": ["A", "B", "C", "D"], "correctAnswer": 2}}
    ]
    IMPORTANT: You must generate questions that test the conceptual and scientific understanding of the topics presented in the text.
    GOOD QUESTIONS are about: chemical principles, scientific concepts, reactions, definitions, properties, and applications (e.g., "What is a thermodynamic function?", "What is the principle of potentiometry?").
    BAD QUESTIONS (DO NOT ASK): Trivial questions about the document's structure, layout, or metadata. This includes questions about page numbers, section headings, experiment numbers (e.g., "What is Experiment 1?"), assessment procedures, rubrics, or lists of content.
    """

    # Append custom instructions to the prompt if they exist and are not just whitespace
    if custom_instructions and custom_instructions.strip():
        prompt_instructions = f"\n\nFollow these additional instructions when generating the quiz: {custom_instructions.strip()}\n"
    else:
        prompt_instructions = ""

    prompt_text_section = f"""
    Here is the text to analyze:
    ---
    {pdf_text}
    ---
    """

    # Combine all parts of the prompt
    final_prompt = prompt_base + prompt_instructions + prompt_text_section

    # print(f"--- Sending Prompt to Gemini ---\n{final_prompt}\n------------------------------") # Optional: Uncomment for debugging the prompt

    # 3. Call the Gemini API with the final prompt
    try:
        response = model.generate_content(final_prompt)
    except Exception as api_error:
        print(f"Error calling Gemini API: {api_error}")
        raise Exception(f"Failed to communicate with the AI model: {api_error}")


    # 4. Check and parse the response
    try:
        # Check if the response text is empty or None
        if not response.text:
            # Log feedback if available (e.g., safety blocks)
            print(f"Gemini Response Feedback: {response.prompt_feedback}")
            raise Exception("The AI returned an empty response. This may be due to safety filters or the input content.")

        # Attempt to parse the JSON
        # print(f"--- Received Response from Gemini ---\n{response.text}\n-------------------------------") # Optional: Uncomment for debugging the response
        quiz_data = json.loads(response.text)

    except json.JSONDecodeError:
        print(f"Failed to decode JSON. Raw response: {response.text}") # Log the raw response for debugging
        raise Exception("The AI returned a malformed response that could not be parsed as JSON.")
    except Exception as parse_error: # Catch other potential errors with the response object
        print(f"Error accessing response text: {parse_error}")
        raise Exception("An unexpected error occurred while processing the AI response.")


    return quiz_data

