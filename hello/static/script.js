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
            generateBtn.disabled = false; // Enable the generate button
        } else {
            fileNameDisplay.textContent = 'No file selected';
            generateBtn.disabled = true; // Disable if no file
        }
    });

    // 2. When the "Generate Quiz" button is clicked
    generateBtn.addEventListener('click', () => {
        // --- UX: Switch to loading view ---
        uploadContainer.classList.add('hidden');
        loadingContainer.classList.remove('hidden');

        // --- BACKEND SIMULATION ---
        // In a real app, you would send the PDF to a server here.
        // We'll simulate a 3-second processing time.
        setTimeout(() => {
            // This is mock data. A real backend would generate this.
            const mockQuizData = [
                {
                    question: "What is the capital of France?",
                    options: ["Berlin", "Madrid", "Paris", "Rome"],
                    correctAnswer: 2 // Index of the correct answer
                },
                {
                    question: "Which planet is known as the Red Planet?",
                    options: ["Earth", "Mars", "Jupiter", "Venus"],
                    correctAnswer: 1
                },
                {
                    question: "What is the result of 2 + 2 * 2?",
                    options: ["8", "6", "4", "10"],
                    correctAnswer: 1
                }
            ];
            
            quizData = mockQuizData;
            displayQuiz(quizData);

            // --- UX: Switch to quiz view ---
            loadingContainer.classList.add('hidden');
            quizContainer.classList.remove('hidden');

        }, 3000); // 3-second delay
    });

    // 3. When the quiz form is submitted
    quizForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        
        const score = calculateScore();
        displayResults(score);

        // --- UX: Switch to results view ---
        quizContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
    });

    // 4. When the "Try Another PDF" button is clicked
    resetBtn.addEventListener('click', () => {
        // --- UX: Reset to initial upload screen ---
        resultsContainer.classList.add('hidden');
        uploadContainer.classList.remove('hidden');
        
        // Reset state
        pdfInput.value = '';
        fileNameDisplay.textContent = 'No file selected';
        generateBtn.disabled = true;
        quizForm.innerHTML = '';
        feedbackArea.innerHTML = '';
        quizData = [];
    });


    // --- Helper Functions ---

    /**
     * Dynamically creates and displays the quiz questions and options.
     * @param {Array} questions - The array of question objects.
     */
    function displayQuiz(questions) {
        quizForm.innerHTML = ''; // Clear previous quiz
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

    /**
     * Calculates the user's score based on their answers.
     * @returns {number} The number of correct answers.
     */
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

    /**
     * Displays the final score and provides feedback on each question.
     * @param {number} score - The user's final score.
     */
    function displayResults(score) {
        scoreDisplay.textContent = `You scored ${score} out of ${quizData.length}!`;
        feedbackArea.innerHTML = ''; // Clear previous feedback

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
});