# 📚 QuizGenAI - Intelligent Quiz Generator

## Overview

**QuizGenAI** is an intelligent web application that automatically generates quizzes from PDF documents using state-of-the-art AI technology. Whether you're an educator looking to create assessments quickly, a student preparing study materials, or anyone needing to test knowledge retention, QuizGenAI makes the process seamless and effortless.

Simply upload a PDF, and let our AI-powered engine extract key concepts and create meaningful, well-structured quiz questions in seconds.

---

## ✨ Key Features

### 🎯 **Smart Quiz Generation**
- Automatically generates quiz questions from PDF content
- Uses advanced AI models (Google Generative AI, OpenAI) for intelligent question creation
- Customizable number of questions to fit your needs
- Support for custom instructions to tailor question difficulty and style

### 📖 **Quiz Management**
- Save and organize all generated quizzes
- View complete quiz history with timestamps
- Unique identifiers for easy tracking and sharing

### 🔄 **Interactive Quiz Interface**
- View-only mode to review quiz details
- Retake functionality to re-attempt quizzes
- Clean, intuitive user interface
- Real-time quiz generation with progress feedback

### 💾 **Data Persistence**
- SQLite database for reliable data storage
- Persistent quiz history across sessions
- JSON-based quiz data storage for flexibility

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 5.2.6
- **Language**: Python
- **Database**: SQLite3
- **AI Integration**: Google Generative AI, OpenAI
- **Authentication**: Django-allauth

### Frontend
- **HTML/CSS/JavaScript** (Vanilla)
- **Interactive Quiz Interfaces**
- **Responsive Design**

### Key Dependencies
- `google-generativeai` - AI-powered quiz generation
- `openai` - Alternative AI model support
- `django-allauth` - User authentication
- `beautifulsoup4` - PDF text extraction
- `requests` - HTTP requests
- And many more (see `requirements.txt`)

---

## 📋 Project Structure

```
quizgenai_project/
├── manage.py                  # Django management script
├── requirements.txt           # Python dependencies
├── db.sqlite3                 # SQLite database
│
├── hello/                     # Main Django project folder
│   ├── settings.py           # Django configuration
│   ├── urls.py               # URL routing
│   ├── wsgi.py               # WSGI application
│   └── asgi.py               # ASGI application
│
├── home/                      # Main application
│   ├── models.py             # Quiz data model
│   ├── views.py              # View handlers and API endpoints
│   ├── services.py           # Business logic and AI integration
│   ├── urls.py               # App URL patterns
│   ├── admin.py              # Django admin configuration
│   └── migrations/           # Database migration files
│
├── static/                    # Static assets
│   ├── style.css             # Main stylesheet
│   ├── script.js             # Frontend logic
│   ├── quiz_detail.js        # Quiz detail page functionality
│   ├── quiz_retake.js        # Quiz retake page functionality
│   └── history.css           # History page styling
│
├── templates/                 # HTML templates
│   ├── index.html            # Quiz generator main page
│   ├── history.html          # Quiz history page
│   ├── quiz_detail.html      # Quiz view page
│   └── quiz_retake.html      # Quiz retake page
│
└── staticfiles/              # Collected static files
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- A web browser

### Installation

1. **Clone the Repository** (or download the project)
   ```bash
   cd d:\Tanmay\Python\WebDev\quizgenai_project
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set Up Environment Variables**
   
   Create a `.env` file in the project root with your API keys:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run Database Migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the Development Server**
   ```bash
   python manage.py runserver
   ```

6. **Access the Application**
   
   Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

---

## 📖 How to Use

### Generate a Quiz

1. **Navigate to the main page** - You'll see the quiz generator interface
2. **Upload a PDF file** - Click the upload button and select your PDF document
3. **Specify number of questions** - Choose how many questions you want (default: 5)
4. **Add custom instructions** (Optional) - Provide specific guidelines for question generation:
   - Difficulty level preferences
   - Question types you want
   - Topics to focus on
   - Any other specific requirements

5. **Click Generate** - The AI will process your PDF and create the quiz
6. **Review and interact** - Use the quiz immediately or save it for later

### View Quiz History

- Click on **History** in the navigation menu
- See all previously generated quizzes with creation dates
- Click on any quiz to view its details

### Retake a Quiz

- From the history or quiz detail page, click **Retake Quiz**
- Answer the questions again to test your knowledge
- Track your progress over time

---

## 🔧 Core Components

### Models (`home/models.py`)
- **Quiz Model**: Stores quiz metadata and JSON question data
  - Unique UUID for each quiz
  - Title (PDF filename)
  - Quiz data in JSON format
  - Creation timestamp

### Views (`home/views.py`)
- `index()` - Main quiz generator page
- `history_view()` - Display all saved quizzes
- `quiz_detail_view()` - View a specific quiz
- `quiz_retake_view()` - Retake a quiz
- `generate_quiz_view()` - API endpoint for quiz generation

### Services (`home/services.py`)
- `generate_quiz_from_pdf()` - Core AI-powered quiz generation logic
- PDF text extraction
- AI prompt engineering
- Response parsing and validation

---

## 🤖 AI Integration

QuizGenAI leverages cutting-edge AI models for intelligent question generation:

### Supported Models
- **Google Generative AI** - Fast, reliable, and powerful
- **OpenAI API** - Advanced language understanding

### How It Works
1. PDF content is extracted and processed
2. Key concepts and topics are identified
3. AI generates contextual, relevant questions
4. Questions are formatted and validated
5. Quiz is saved to the database

### Custom Instructions
You can guide the AI generation process with custom instructions:
- **Difficulty**: Easy, Medium, Hard
- **Question Types**: Multiple choice, True/False, Short answer
- **Focus Areas**: Specific chapters or topics
- **Format Preferences**: Any specific style or structure

---

## 📝 API Endpoints

### Generate Quiz
- **Endpoint**: `POST /api/generate-quiz/`
- **Parameters**:
  - `pdf` (file) - PDF document to process
  - `num_questions` (integer) - Number of questions (default: 5)
  - `custom_instructions` (string) - Optional AI instructions
- **Response**: Generated quiz in JSON format

### Get Quiz History
- **Endpoint**: `GET /history/`
- **Response**: List of all saved quizzes

### View Quiz
- **Endpoint**: `GET /quiz/<quiz_id>/`
- **Response**: Detailed quiz information

### Retake Quiz
- **Endpoint**: `GET /quiz/<quiz_id>/retake/`
- **Response**: Interactive quiz interface

---

## 🔐 Environment Configuration

The application uses environment variables for sensitive data. Create a `.env` file:

```bash
# AI API Keys
GOOGLE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here

# Django Settings
DEBUG=True
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

## 🚨 Troubleshooting

### Common Issues

**"No PDF file provided"**
- Ensure you've selected a valid PDF before clicking Generate
- Check file size and format

**"API Key Error"**
- Verify API keys are correctly set in `.env` file
- Check that API keys have appropriate permissions

**"Database Error"**
- Run migrations: `python manage.py migrate`
- Check SQLite database permissions

**Quiz takes too long to generate**
- Large PDFs may take longer to process
- Check internet connection (for AI API calls)
- Consider reducing number of questions

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Issues** - Found a bug? Let us know!
2. **Suggest Features** - Have an idea? We'd love to hear it
3. **Submit Pull Requests** - Help improve the codebase

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Tanmay Dawande**

- GitHub: [@TanmayDawande](https://github.com/TanmayDawande)
- Repository: [quizgenai-app](https://github.com/TanmayDawande/quizgenai-app)

---

## 🙏 Acknowledgments

- Thanks to Google and OpenAI for powerful AI APIs
- Django framework for robust web development
- The open-source community for amazing tools and libraries

---

## 📞 Support

If you need help or have questions:
- Check the troubleshooting section above
- Review the project repository
- Feel free to reach out to the developer

---

## 🎯 Future Roadmap

- [ ] Support for multiple document formats (DOCX, EPUB, etc.)
- [ ] Advanced question analytics and performance tracking
- [ ] Team collaboration features
- [ ] Mobile application
- [ ] Question bank export (PDF, DOCX, etc.)
- [ ] Integration with learning management systems (LMS)
- [ ] Multi-language support
- [ ] Custom quiz styling and branding

---

**Happy Learning! 🎓**

*Last Updated: November 2025*