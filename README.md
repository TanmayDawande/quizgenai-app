# QuizGenAi - PDF to Multiple-Choice Quiz Generator

QuizGenAi is a web application designed to streamline the creation of multiple-choice quizzes from PDF documents. It leverages artificial intelligence to analyze document content and generate relevant questions, providing an efficient tool for educational and assessment purposes.

## Features

* **PDF Document Upload:** Users can securely upload PDF files through an intuitive web interface.
* **Customizable Question Count:** A user-friendly slider allows selection of the desired number of quiz questions, ranging from 1 to 30.
* **AI-Powered Question Generation:** The application processes the uploaded PDF text and integrates with the Google Gemini API to intelligently generate multiple-choice questions complete with correct answers.
* **Interactive Quiz Interface:** Provides an engaging platform for users to take the generated quizzes directly within their web browser.
* **Instant Result Feedback:** Upon quiz submission, users receive immediate scoring and performance feedback.
* **Comprehensive Quiz History:** All generated quizzes are automatically saved, enabling users to review past quizzes or retake them at their convenience.

## Technology Stack

This project is built using a robust combination of backend and frontend technologies.

### Backend Technologies
These are the core server-side components and AI integration:

* **Python 3:** ![Python Logo](assets/img/python_logo.png)
* **Django:** ![Django Logo](assets/img/django_logo.png)
* **Google Gemini API:** ![Gemini Logo](assets/img/gemini_logo.png)
* **PyMuPDF (`fitz`):** For efficient PDF parsing and text extraction.
* **`python-decouple`:** For secure management of environment variables.

### Frontend Technologies
These define the user interface and client-side interactivity:

* **HTML:** ![HTML Logo](assets/img/html_logo.png)
* **CSS:** ![CSS Logo](assets/img/css_logo.png)
* **JavaScript (Vanilla):** ![JavaScript Logo](assets/img/javascript_logo.png)

### Database

* **SQLite 3:** ![SQLite Logo](assets/img/sqlite_logo.png) (Default Django database, suitable for local development)

## Local Setup and Installation

To get QuizGenAi running on your local machine, please follow these instructions:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/TanmayDawande/quizgenai-app.git](https://github.com/TanmayDawande/quizgenai-app.git)
    cd quizgenai-app
    ```

2.  **Create and Activate a Python Virtual Environment:**
    ```bash
    # Create the virtual environment
    python -m venv venv
    # Activate on Windows
    .\venv\Scripts\activate
    # Activate on macOS/Linux
    source venv/bin/activate
    ```

3.  **Install Project Dependencies:**
    Ensure you have a `requirements.txt` file in your project root (which can be generated via `pip freeze > requirements.txt` if not present) and then install all required packages:
    ```bash
    pip install -r requirements.txt
    ```
    *Key packages include `django`, `google-generativeai`, `PyMuPDF`, and `python-decouple`.*

4.  **Configure Environment Variables:**
    Create a file named `.env` in the project's root directory (adjacent to `manage.py`) and populate it with your confidential keys:
    ```dotenv
    SECRET_KEY=your_django_secret_key_here
    GEMINI_API_KEY=your_google_gemini_api_key_here
    ```
    *Replace `your_django_secret_key_here` with a unique Django `SECRET_KEY` (e.g., from your `settings.py` or generated afresh).*
    *Replace `your_google_gemini_api_key_here` with your API key obtained from Google AI Studio.*

5.  **Apply Database Migrations:**
    Initialize the database schema by running Django's migration command:
    ```bash
    python manage.py migrate
    ```

6.  **Start the Development Server:**
    ```bash
    python manage.py runserver
    ```

7.  **Access the Application:**
    Open your web browser and navigate to `http://127.0.0.1:8000/`.

## Usage Instructions

1.  **Navigate to the Home Page:** Access the main application interface.
2.  **Upload a PDF:** Click the "Choose a PDF" button and select the desired document.
3.  **Set Question Count:** Adjust the slider to specify the number of quiz questions to be generated.
4.  **Initiate Generation:** Click "Generate Quiz." The application will process the PDF and create questions using the integrated AI.
5.  **Take the Quiz:** The generated quiz will be displayed. Select your answers and click "Submit Answers."
6.  **Review Results:** A results page will show your score and performance summary.
7.  **Explore History:** Use the sidebar to navigate to the "History" section, where you can view or retake any previously generated quizzes.
