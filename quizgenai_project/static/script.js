document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const toggleIcon = document.querySelector('.toggle-icon');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (toggleIcon) toggleIcon.textContent = '☀️';
    } else {
        if (toggleIcon) toggleIcon.textContent = '🌙';
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            if (toggleIcon) {
                toggleIcon.textContent = isDark ? '☀️' : '🌙';
            }
        });
    }

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

    const questionCountSlider = document.getElementById('question-count-slider');
    const sliderValueDisplay = document.getElementById('slider-value');
    const customInstructionsInput = document.getElementById('custom-instructions');

    let quizData = [];
    let countdownInterval = null;

    if (questionCountSlider && sliderValueDisplay) {
        questionCountSlider.addEventListener('input', () => {
            sliderValueDisplay.textContent = questionCountSlider.value;
        });
    }

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

    generateBtn.addEventListener('click', async () => {
        const file = pdfInput.files[0];
        if (!file) {
            alert("Please select a PDF file first.");
            return;
        }

        const numQuestions = parseInt(questionCountSlider ? questionCountSlider.value : '5');
        const fileSizeMB = file.size / (1024 * 1024);
        
        let estimatedMin = 15;
        let estimatedMax = 25;
        
        estimatedMin += Math.ceil(fileSizeMB * 5);
        estimatedMax += Math.ceil(fileSizeMB * 8);
        
        estimatedMin += (numQuestions * 3);
        estimatedMax += (numQuestions * 5);
        
        estimatedMin = Math.min(estimatedMin, 180);
        estimatedMax = Math.min(estimatedMax, 180);
        
        const countdownSeconds = Math.ceil((estimatedMin + estimatedMax) / 2);
        
        uploadContainer.classList.add('hidden');
        loadingContainer.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        quizContainer.classList.add('hidden');

        let secondsRemaining = countdownSeconds;
        const countdownTimer = document.getElementById('countdown-timer');
        
        const formatTime = (totalSeconds) => {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };
        
        if (countdownTimer) {
            countdownTimer.textContent = formatTime(secondsRemaining);
        }
        
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        countdownInterval = setInterval(() => {
            secondsRemaining--;
            if (countdownTimer) {
                countdownTimer.textContent = formatTime(secondsRemaining);
            }
            
            if (secondsRemaining <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('num_questions', numQuestions);
        formData.append('custom_instructions', customInstructionsInput ? customInstructionsInput.value : '');

        try {
            const response = await fetch('/api/generate-quiz/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: formData,
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                let errorMessage = 'Something went wrong on the server.';
                
                try {
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        errorMessage = data.error || errorMessage;
                    } else {
                        const text = await response.text();
                        if (text.includes('error')) {
                            errorMessage = text.substring(0, 200);
                        }
                    }
                } catch (e) {
                    console.error("Error parsing error response:", e);
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid quiz data format received from server');
            }

            quizData = data;
            displayQuiz(quizData);

            // Hide loading container and show quiz immediately when data loads
            clearInterval(countdownInterval);
            loadingContainer.classList.add('hidden');
            quizContainer.classList.remove('hidden');

        } catch (error) {
            console.error("Error generating quiz:", error);
            alert(`An error occurred: ${error.message}`);

            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            loadingContainer.classList.add('hidden');
            uploadContainer.classList.remove('hidden');
        }
    });

    quizForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const score = calculateScore();
        displayResults(score);
        quizContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
    });

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
            if (customInstructionsInput) customInstructionsInput.value = '';
            quizData = [];
        });
    }

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

