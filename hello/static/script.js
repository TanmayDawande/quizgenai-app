document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the necessary DOM elements
    const uploadContainer = document.getElementById('upload-container');
    const loadingContainer = document.getElementById('loading-container');
    const quizContainer = document.getElementById('quiz-container');
    const resultsContainer = document.getElementById('results-container');

    const pdfInput = document.getElementById('pdf-input');
    const fileNameDisplay = document.getElementById('file-name-display');
    const generateBtn = document.getElementById('generate-btn');

    const quizForm = document.getElementById('quiz-form');
    const scoreDisplay = document.getElementById('score-display');
    const feedbackArea = document.getElementById('feedback-area');
    const resetBtn = document.getElementById('reset-btn');

    let quizData = []; // To store the generated quiz questions

    // --- Event Listeners ---

    // 1. When a file is selected
    pdfInput.addEventListener('change', () => {
        if (pdfInput.files.length > 0) {
            const fileName = pdfInput.files[0].name;
            fileNameDisplay.textContent = fileName;
            generateBtn.disabled = false;
        } else {
            fileNameDisplay.textContent = 'No file selected';
            generateBtn.disabled = true;
        }
    });

    // 2. When the "Generate Quiz" button is clicked
    generateBtn.addEventListener('click', async () => {
        const file = pdfInput.files[0];
        if (!file) {
            alert("Please select a PDF file first.");
            return;
        }

        // --- UX: Switch to loading view ---
        uploadContainer.classList.add('hidden');
        loadingContainer.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        quizContainer.classList.add('hidden');


        // --- REAL BACKEND API CALL ---
        const formData = new FormData();
        formData.append('pdf', file); 

        try {
            // Send the file to your Django endpoint
            const response = await fetch('/api/generate-quiz/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong on the server.');
            }
            
            quizData = data; 
            displayQuiz(quizData);

            // --- UX: Switch to quiz view ---
            loadingContainer.classList.add('hidden');
            quizContainer.classList.remove('hidden');

        } catch (error) {
            console.error("Error generating quiz:", error);
            alert(`An error occurred: ${error.message}`);
            
            // Switch back to upload view on error
            loadingContainer.classList.add('hidden');
            uploadContainer.classList.remove('hidden');
        }
    });

    // 3. When the quiz form is submitted
    quizForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const score = calculateScore();
        displayResults(score);
        quizContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
    });

    // 4. When the "Try Another PDF" button is clicked
    resetBtn.addEventListener('click', () => {
        resultsContainer.classList.add('hidden');
        uploadContainer.classList.remove('hidden');
        pdfInput.value = '';
        fileNameDisplay.textContent = 'No file selected';
        generateBtn.disabled = true;
        quizForm.innerHTML = '';
        feedbackArea.innerHTML = '';
        quizData = [];
    });


    // --- Helper Functions ---

    function displayQuiz(questions) {
        quizForm.innerHTML = '';
        questions.forEach((q, index) => {
            const questionBlock = document.createElement('div');
            questionBlock.classList.add('question-block');
            
            const questionText = document.createElement('p');
            questionText.classList.add('question-text');
            questionText.textContent = `${index + 1}. ${q.question}`;
            
            const optionsList = document.createElement('ul');
            optionsList.classList.add('options-list');
            
            q.options.forEach((option, optionIndex) => {
                const optionItem = document.createElement('li');
                optionItem.classList.add('option');
                
                const radioInput = document.createElement('input');
                radioInput.type = 'radio';
                radioInput.name = `question-${index}`;
                radioInput.value = optionIndex;
                radioInput.id = `q${index}-o${optionIndex}`;
                radioInput.required = true;
                
                const optionLabel = document.createElement('label');
                optionLabel.textContent = option;
                optionLabel.htmlFor = `q${index}-o${optionIndex}`;
                
                optionItem.appendChild(radioInput);
                optionItem.appendChild(optionLabel);
                optionsList.appendChild(optionItem);
            });
            
            questionBlock.appendChild(questionText);
            questionBlock.appendChild(optionsList);
            quizForm.appendChild(questionBlock);
        });
    }

    function calculateScore() {
        let score = 0;
        quizData.forEach((q, index) => {
            const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
            if (selectedOption && parseInt(selectedOption.value) === q.correctAnswer) {
                score++;
            }
        });
        return score;
    }

    function displayResults(score) {
        scoreDisplay.textContent = `You scored ${score} out of ${quizData.length}!`;
        feedbackArea.innerHTML = '';

        quizData.forEach((q, index) => {
            const feedbackBlock = document.createElement('div');
            feedbackBlock.classList.add('question-block');

            const questionText = document.createElement('p');
            questionText.classList.add('question-text');
            questionText.textContent = `${index + 1}. ${q.question}`;
            feedbackBlock.appendChild(questionText);

            const userAnswerInput = document.querySelector(`input[name="question-${index}"]:checked`);
            const userAnswerIndex = userAnswerInput ? parseInt(userAnswerInput.value) : -1;
            const correctAnswerIndex = q.correctAnswer;

            const resultText = document.createElement('p');
            if (userAnswerIndex === correctAnswerIndex) {
                feedbackBlock.classList.add('correct');
                resultText.textContent = `Your answer: ${q.options[userAnswerIndex]} (Correct)`;
            } else {
                feedbackBlock.classList.add('incorrect');
                const userAnswerText = userAnswerIndex !== -1 ? q.options[userAnswerIndex] : 'No answer';
                resultText.textContent = `Your answer: ${userAnswerText} (Incorrect)`;
                
                const correctAnswerDisplay = document.createElement('span');
                correctAnswerDisplay.classList.add('correct-answer-text');
                correctAnswerDisplay.textContent = `Correct answer: ${q.options[correctAnswerIndex]}`;
                resultText.appendChild(correctAnswerDisplay);
            }
            feedbackBlock.appendChild(resultText);
            feedbackArea.appendChild(feedbackBlock);
        });
    }

    // Helper function required for Django POST requests
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});