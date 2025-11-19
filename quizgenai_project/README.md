# QuizGenAI

A web app that generates quizzes from PDFs using AI. Upload a PDF, pick how many questions you want, and the app will create a quiz for you in seconds.

## What It Does

- Uploads a PDF document
- Generates multiple-choice questions automatically
- Supports custom instructions for question generation
- Saves quiz history
- Sign in feature for user authentication
- Retake quizzes anytime

## Features

- **AI-Powered**: Uses Google Gemini to generate intelligent questions
- **Customizable**: Set number of questions (1-30)
- **Custom Instructions**: Guide the AI with specific prompts
- **Quiz History**: Access all your previously generated quizzes
- **Sign In**: User authentication to manage personal quizzes
- **Instant Feedback**: See correct answers immediately

## Tech Stack

- Django (Backend)
- SQLite (Database)
- Google Gemini API (AI)
- JavaScript (Frontend)

## Getting Started

1. Clone the repository
2. Install requirements: `pip install -r requirements.txt`
3. Set `GEMINI_API_KEY` environment variable
4. Run migrations: `python manage.py migrate`
5. Start server: `python manage.py runserver`
6. Visit `http://localhost:8000`
