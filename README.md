# QuizGenAI

A web app that generates quizzes from PDFs or PPT/PPTX or a website link or a Youtube video (if it as transcript) using AI. Upload the documents or provide the link, select the number of questions from the slider (default at 5; max 25) and generate the quiz. You can also add custom prompts in the custom instructions field (Eg: Generate the questions in a GenZ lingo). Only 5 quizes available to be stored in history for logged out sessions!

<a href="https://tanmaydawande.tech/quizgenai" target="_blank">QuizGenAi</a>


## Tech

- **Backend**: Django, Python
- **Database**: PostgreSQL (hosted on Neon.tech)
- **AI**: Google Gemini 1.5 Falsh API
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **App Hosting**: Render (Web Serice)
- **Traffic Routing**: Cloudflare Workers (Reverse Proxy)

I calcuated that the free PostgreSQL (hosted on Neon.tech) can store ~25,000 bundles ( A bundle being a new user data + 25 questions quiz).
Also, the free Gemini plan provides 1500 tokens per day per an API key so that means 1500 quizzes a day.

