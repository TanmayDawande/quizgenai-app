document.addEventListener('DOMContentLoaded', () => {
    // Get the containers and form elements
    const quizContainer = document.getElementById('quiz-container');
    const resultsContainer = document.getElementById('results-container');
    const quizForm = document.getElementById('quiz-form');
    const scoreDisplay = document.getElementById('score-display');
    const feedbackArea = document.getElementById('feedback-area');

    // Get the quiz data that was passed from the Django template
    const quizDataElement = document.getElementById('quiz-data');
    let quizData = [];
    try {
        // Safely parse the JSON data
        quizData = JSON.parse(quizDataElement.textContent);
    } catch (e) {
        console.error("Could not parse quiz data:", e);
        quizForm.innerHTML = "<p>Error: Could not load the quiz data.</p>";
        return;
    }

    // --- Main Functions ---
    
    // Display the quiz as soon as the page loads
    displayQuiz(quizData);

    // Add listener for when the user submits their answers
    quizForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const score = calculateScore();
        displayResults(score);
        quizContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
    });


    // --- Helper Functions ---

    function displayQuiz(questions) {
        if (!questions || !Array.isArray(questions)) return;
        
        quizForm.innerHTML = ''; // Clear any existing content
        
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

                // Add event listener to make the entire box clickable
                optionItem.addEventListener('click', () => {
                    radioInput.checked = true;
                });
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
});
