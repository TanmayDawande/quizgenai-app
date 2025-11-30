# QuizGenAI

A web app that generates quizzes from PDFs or PPT/PPTX or a website link using AI. Upload the documents or provide the link, select the number of questions from the slider (default at 5; max 25) and generate the quiz. You can also add custom prompts in the custom instructions field (Eg: Generate the questions in a GenZ lingo). Only 5 quizes available to be stored in history for logged out sessions!

CLick here!: <a href="https://tanmaydawande.tech/quizgenai" target="_blank">tanmaydawande.tech/quizgenai</a>


## Tech

- **Backend**: Django, Python
- **Database**: PostgreSQL (hosted on Neon.tech)
- **AI**: Google Gemini 1.5 Flash API
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **App Hosting**: Render (Web Service)
- **Traffic Routing**: Cloudflare Workers (Reverse Proxy)

I calculated that the free PostgreSQL (hosted on Neon.tech) can store ~25,000 bundles ( A bundle being a new user data + 25 questions quiz).
Also, the free Gemini plan provides 1500 tokens per day per an API key so that means 1500 quizzes a day.

### Problems Faced

The app also had a feature where the user could provide a youtube video link and generate a quiz based on the video caption/transcript. This feature had to be removed because youtube blocks requests from cloud provider IPs like Render. This is a common issue with the `youtube-transcript-api` library. Also tried to use `yt-dlp` for youtube transcriptions but could'nt get it to work. Might add this feature in the future updates! 

