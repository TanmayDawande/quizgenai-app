# QuizGenAI

A web app that generates quizzes from PDFs using AI. Upload a PDF, pick how many questions you want, and the app will create a quiz for you in seconds.

## What It Does

- **Generate quizzes** from PDF files automatically
- **Save and revisit** all your generated quizzes
- **Retake quizzes** to test yourself again
- **Customize** questions with special instructions

## Tech

- **Backend**: Django, Python
- **Database**: SQLite
- **AI**: Google Generative AI & OpenAI
- **Frontend**: Vanilla HTML/CSS/JavaScript

## Setup

### Requirements
- Python 3.8+
- pip

### Installation

1. Clone and navigate to the project:
   ```bash
   cd quizgenai_project
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file with your API keys:
   ```
   GOOGLE_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the server:
   ```bash
   python manage.py runserver
   ```

6. Open your browser to `http://localhost:8000`

## How to Use

1. **Upload a PDF** - Click the upload button and select your document
2. **Choose number of questions** - Default is 5, but you can change it
3. **Add instructions** (optional) - Tell the AI what kind of questions you want (e.g., "Make them harder", "Focus on chapter 3")
4. **Generate** - Wait a few seconds while the AI creates your quiz
5. **Take the quiz** - Answer the questions or save it for later

You can view all your past quizzes in the History page and retake any of them.

## Project Structure

```
quizgenai_project/
├── manage.py
├── requirements.txt
├── hello/              # Django project config
├── home/               # Main app
│   ├── models.py      # Quiz model
│   ├── views.py       # Routes and API
│   ├── services.py    # AI integration
│   └── migrations/
├── static/            # CSS, JS, images
└── templates/         # HTML files
```

## Troubleshooting

**"No PDF file provided"** - Make sure you selected a file before generating

**"API Key Error"** - Check that your API keys are correctly set in `.env`

**Quiz generation is slow** - Larger PDFs take longer. Check your internet connection too

## Author

Tanmay Dawande - [GitHub](https://github.com/TanmayDawande)