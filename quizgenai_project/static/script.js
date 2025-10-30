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

    // Get the slider elements
    const questionCountSlider = document.getElementById('question-count-slider');
    const sliderValueDisplay = document.getElementById('slider-value');
    // Get the custom instructions textarea
    const customInstructionsInput = document.getElementById('custom-instructions');

    let quizData = []; // To store the generated quiz questions

    // --- Event Listeners ---

    // 1. Update slider value display when it's moved
    if (questionCountSlider && sliderValueDisplay) {
        questionCountSlider.addEventListener('input', () => {
            sliderValueDisplay.textContent = questionCountSlider.value;
        });
    }

    // 2. When a file is selected, update the file name display
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

    // 3. When the "Generate Quiz" button is clicked, call the backend
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


        // --- Prepare data for the backend ---
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('num_questions', questionCountSlider ? questionCountSlider.value : '5');
        // Append the custom instructions value
        formData.append('custom_instructions', customInstructionsInput ? customInstructionsInput.value : '');

        // --- REAL BACKEND API CALL ---
        try {
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

    // 4. When the quiz form is submitted, calculate and display score
    quizForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const score = calculateScore();
        displayResults(score);
        quizContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
    });

    // 5. When the "Try Another PDF" button is clicked, reset the UI
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resultsContainer.classList.add('hidden');
            uploadContainer.classList.remove('hidden');
            pdfInput.value = '';
            fileNameDisplay.textContent = 'No file selected';
            generateBtn.disabled = true;
            quizForm.innerHTML = '';
            feedbackArea.innerHTML = '';
            if (questionCountSlider) questionCountSlider.value = 5;
            if (sliderValueDisplay) sliderValueDisplay.textContent = '5';
            if (customInstructionsInput) customInstructionsInput.value = ''; // Clear instructions
            quizData = [];
        });
    }


    // --- Helper Functions ---

    function displayQuiz(questions) {
        if (!questions || !Array.isArray(questions)) return;

        quizForm.innerHTML = '';
        questions.forEach((q, index) => {
            const questionBlock = document.createElement('div');
            questionBlock.classList.add('question-block');

            const questionText = document.createElement('p');
            questionText.classList.add('question-text');
            questionText.textContent = `${index + 1}. ${q.question}`;

            const optionsList = document.createElement('ul');
            optionsList.classList.add('options-list');

            if (q.options && Array.isArray(q.options)) {
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

                    optionItem.addEventListener('click', () => {
                        radioInput.checked = true;
                    });

                    optionsList.appendChild(optionItem);
                });
            }

            questionBlock.appendChild(questionText);
            questionBlock.appendChild(optionsList);
            quizForm.appendChild(questionBlock);
        });
    }

    function calculateScore() {
        let score = 0;
        quizData.forEach((q, index) => {
            const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
            if (selectedOption && typeof q.correctAnswer !== 'undefined' && parseInt(selectedOption.value) === q.correctAnswer) {
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
            if (q.options && Array.isArray(q.options) && typeof correctAnswerIndex !== 'undefined') {
                if (userAnswerIndex === correctAnswerIndex) {
                    feedbackBlock.classList.add('correct');
                    resultText.textContent = `Your answer: ${q.options[userAnswerIndex]} (Correct)`;
                } else {
                    feedbackBlock.classList.add('incorrect');
                    const userAnswerText = userAnswerIndex !== -1 && q.options[userAnswerIndex] ? q.options[userAnswerIndex] : 'No answer';
                    resultText.textContent = `Your answer: ${userAnswerText} (Incorrect)`;

                    if (q.options[correctAnswerIndex]) {
                        const correctAnswerDisplay = document.createElement('span');
                        correctAnswerDisplay.classList.add('correct-answer-text');
                        correctAnswerDisplay.textContent = `Correct answer: ${q.options[correctAnswerIndex]}`;
                        resultText.appendChild(correctAnswerDisplay);
                    }
                }
            } else {
                 resultText.textContent = "Could not display feedback for this question.";
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
                const cookie = cookies[i].trim(); // Corrected typo here
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});

