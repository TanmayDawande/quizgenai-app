# QuizGenAi - PDF to Multiple-Choice Quiz Generator

QuizGenAi is a web application built with Django. It allows users to upload PDF documents and automatically generates multiple-choice quizzes based on the document's content using the Google Gemini AI.

## Features

* **PDF Upload:** Select and upload PDF files via the web interface.
* **Configurable Question Count:** Use a slider to specify the desired number of quiz questions (1-30).
* **AI-Powered Quiz Generation:** Extracts text from the PDF and utilizes the Google Gemini API to generate relevant multiple-choice questions and identify the correct answers.
* **Interactive Quiz:** Users can take the generated quiz directly within the browser.
* **Results Display:** Provides immediate feedback on the user's score after submission.
* **Quiz History:** Automatically saves generated quizzes to a database. Users can view a history of their past quizzes and retake them.

## Technology Stack

* **Backend:** Python 3, Django
* **AI:** Google Gemini API (`google-generativeai` library)
* **PDF Processing:** PyMuPDF (`fitz`)
* **Frontend:** HTML, CSS, JavaScript (Vanilla)
* **Database:** SQLite 3 (Default with Django)
* **Configuration:** `python-decouple` (for managing environment variables)

## Local Setup and Installation

Follow these steps to run the project locally:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/TanmayDawande/quizgenai-app.git](https://github.com/TanmayDawande/quizgenai-app.git)
    cd quizgenai-app
    ```

2.  **Create and Activate a Virtual Environment:**
    ```bash
    # Create
    python -m venv venv
    # Activate (Windows)
    venv\Scripts\activate
    # Activate (macOS/Linux)
    source venv/bin/activate
    ```

3.  **Install Dependencies:**
    (Ensure you have a `requirements.txt` file in your project root created via `pip freeze > requirements.txt`)
    ```bash
    pip install -r requirements.txt
    ```
    *Required packages include `django`, `google-generativeai`, `PyMuPDF`, and `python-decouple`.*

4.  **Configure Environment Variables:**
    Create a `.env` file in the project root directory (alongside `manage.py`) with the following content:
    ```dotenv
    SECRET_KEY=your_django_secret_key_here
    GEMINI_API_KEY=your_google_gemini_api_key_here
    ```
    *Replace `your_django_secret_key_here` with the actual `SECRET_KEY` found in `settings.py` (or generate a new one).*
    *Replace `your_google_gemini_api_key_here` with your API key from Google AI Studio.*

5.  **Apply Database Migrations:**
    This command initializes the database schema based on your models.
    ```bash
    python manage.py migrate
    ```

6.  **Run the Development Server:**
    ```bash
    python manage.py runserver
    ```

7.  **Access the Application:**
    Open your web browser and navigate to `http://127.0.0.1:8000/`.

## Usage

1.  Navigate to the main page.
2.  Click "Choose a PDF" to upload a document.
3.  Use the slider to select the number of questions desired.
4.  Click "Generate Quiz". The application will process the PDF and generate questions using the AI.
5.  The quiz will be displayed. Answer the questions and click "Submit Answers".
6.  The results page will show your score and feedback.
7.  Navigate to the "History" section via the sidebar to view or retake previously generated quizzes.
