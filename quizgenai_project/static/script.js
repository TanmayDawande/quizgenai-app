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
    const urlInput = document.getElementById('url-input');
    const ytInput = document.getElementById('yt-input');
    const fileNameDisplay = document.getElementById('file-name-display');
    const generateBtn = document.getElementById('generate-btn');

    const quizForm = document.getElementById('quiz-form');
    const scoreDisplay = document.getElementById('score-display');
    const feedbackArea = document.getElementById('feedback-area');
    const resetBtn = document.getElementById('reset-btn');
    const downloadBtn = document.getElementById('download-btn');
    const flashcardsBtn = document.getElementById('flashcards-btn');

    const questionCountSlider = document.getElementById('question-count-slider');
    const sliderValueDisplay = document.getElementById('slider-value');
    const customInstructionsInput = document.getElementById('custom-instructions');

    let quizData = [];
    let currentQuizId = null;
    let countdownInterval = null;
    let activeTab = 'pdf-tab';

    // Tab Handling
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            activeTab = tabId;
            
            checkGenerateButtonState();
        });
    });

    function checkGenerateButtonState() {
        if (activeTab === 'pdf-tab') {
            generateBtn.disabled = !(pdfInput.files.length > 0);
        } else if (activeTab === 'url-tab') {
            generateBtn.disabled = !(urlInput && urlInput.value.trim().length > 0);
        } else if (activeTab === 'yt-tab') {
            generateBtn.disabled = !(ytInput && ytInput.value.trim().length > 0);
        }
    }

    if (questionCountSlider && sliderValueDisplay) {
        questionCountSlider.addEventListener('input', () => {
            sliderValueDisplay.textContent = questionCountSlider.value;
        });
    }

    pdfInput.addEventListener('change', () => {
        if (pdfInput.files.length > 0) {
            const fileName = pdfInput.files[0].name;
            fileNameDisplay.textContent = fileName;
        } else {
            fileNameDisplay.textContent = 'No file selected';
        }
        checkGenerateButtonState();
    });

    if (urlInput) {
        urlInput.addEventListener('input', checkGenerateButtonState);
    }

    if (ytInput) {
        ytInput.addEventListener('input', checkGenerateButtonState);
    }

    generateBtn.addEventListener('click', async () => {
        const numQuestions = parseInt(questionCountSlider ? questionCountSlider.value : '5');
        const formData = new FormData();
        
        let estimatedMin = 15;
        let estimatedMax = 25;

        if (activeTab === 'pdf-tab') {
            const file = pdfInput.files[0];
            if (!file) {
                alert("Please select a PDF file first.");
                return;
            }
            formData.append('pdf', file);
            
            const fileSizeMB = file.size / (1024 * 1024);
            estimatedMin += Math.ceil(fileSizeMB * 5);
            estimatedMax += Math.ceil(fileSizeMB * 8);
        } else if (activeTab === 'url-tab') {
            const url = urlInput.value.trim();
            if (!url) {
                alert("Please enter a URL first.");
                return;
            }
            formData.append('url', url);
            // Estimate for URL (assume average page size)
            estimatedMin += 5;
            estimatedMax += 10;
        } else if (activeTab === 'yt-tab') {
            const url = ytInput.value.trim();
            if (!url) {
                alert("Please enter a YouTube URL first.");
                return;
            }
            formData.append('url', url);
            // Estimate for YouTube (fetching transcript is fast, but processing might take time)
            estimatedMin += 5;
            estimatedMax += 10;
        }
        
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
        const timerCircleFg = document.querySelector('.timer-circle-fg');
        const totalCircleLength = 283; // 2 * PI * 45
        
        // Reset transition for new run
        if (timerCircleFg) {
             timerCircleFg.style.transition = 'stroke-dashoffset 1s linear';
        }
        
        const formatTime = (totalSeconds) => {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };
        
        const updateTimer = () => {
            if (countdownTimer) {
                countdownTimer.textContent = formatTime(secondsRemaining);
            }
            if (timerCircleFg) {
                const offset = totalCircleLength - (secondsRemaining / countdownSeconds) * totalCircleLength;
                timerCircleFg.style.strokeDashoffset = offset;
            }
        };

        updateTimer();
        
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        countdownInterval = setInterval(() => {
            secondsRemaining--;
            updateTimer();
            
            if (secondsRemaining <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        formData.append('num_questions', numQuestions);
        formData.append('custom_instructions', customInstructionsInput ? customInstructionsInput.value : '');

        try {
            const response = await fetch('/quizgenai/api/generate-quiz/', {
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

            const responseData = await response.json();
            
            // Handle both old format (array) and new format (object with quiz_id)
            let data;
            if (Array.isArray(responseData)) {
                data = responseData;
            } else if (responseData.questions && Array.isArray(responseData.questions)) {
                data = responseData.questions;
                currentQuizId = responseData.quiz_id;
            } else {
                throw new Error('Invalid quiz data format received from server');
            }

            quizData = data;
            displayQuiz(quizData);

            // Wait for the timer to finish if it hasn't already
            if (secondsRemaining > 0) {
                await new Promise(resolve => setTimeout(resolve, secondsRemaining * 1000));
            }

            // Finish the timer visually before showing the quiz
            clearInterval(countdownInterval);
            if (countdownTimer) countdownTimer.textContent = "00:00";
            if (timerCircleFg) {
                // Animate to full completion
                timerCircleFg.style.transition = "stroke-dashoffset 0.5s ease-out";
                timerCircleFg.style.strokeDashoffset = totalCircleLength;
            }

            // Short delay to show the "completed" state
            setTimeout(() => {
                loadingContainer.classList.add('hidden');
                quizContainer.classList.remove('hidden');
                document.body.classList.add('scrollable');
            }, 800);

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

    quizForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const score = calculateScore();
        const userAnswers = getUserAnswers();
        
        displayResults(score);
        quizContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

        if (currentQuizId) {
            try {
                await fetch('/quizgenai/api/save-attempt/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    body: JSON.stringify({
                        quiz_id: currentQuizId,
                        score: score,
                        user_answers: userAnswers
                    }),
                });
            } catch (error) {
                console.error("Error saving quiz attempt:", error);
            }
        }
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resultsContainer.classList.add('hidden');
            uploadContainer.classList.remove('hidden');
            
            // Disable page scrolling for the main page
            document.body.classList.remove('scrollable');
            
            pdfInput.value = '';
            if (urlInput) urlInput.value = '';
            if (ytInput) ytInput.value = '';
            fileNameDisplay.textContent = 'No file selected';
            generateBtn.disabled = true;
            quizForm.innerHTML = '';
            feedbackArea.innerHTML = '';
            if (questionCountSlider) questionCountSlider.value = 5;
            if (sliderValueDisplay) sliderValueDisplay.textContent = '5';
            if (customInstructionsInput) customInstructionsInput.value = '';
            quizData = [];
            if (downloadBtn) downloadBtn.style.display = 'none';
            if (flashcardsBtn) flashcardsBtn.style.display = 'none';
        });
    }

    function displayQuiz(questions) {
        if (!questions || !Array.isArray(questions)) return;

        quizForm.innerHTML = '';
        questions.forEach((q, index) => {
            const questionBlock = document.createElement('div');
            questionBlock.classList.add('question-block', 'animate-fade-in');
            questionBlock.style.animationDelay = `${index * 0.1}s`;
            questionBlock.style.opacity = '0'; // Start invisible so animation can fade it in

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
                        
                        // Visual selection state
                        const siblings = optionsList.querySelectorAll('.option');
                        siblings.forEach(sib => sib.classList.remove('selected'));
                        optionItem.classList.add('selected');
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
            feedbackBlock.classList.add('question-block', 'animate-fade-in');
            feedbackBlock.style.animationDelay = `${index * 0.1}s`;
            feedbackBlock.style.opacity = '0';

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

            // Add Explanation if available
            if (q.explanation) {
                const explanationDiv = document.createElement('div');
                explanationDiv.classList.add('explanation-text');
                
                const explanationLabel = document.createElement('span');
                explanationLabel.classList.add('explanation-label');
                explanationLabel.textContent = 'Explanation';
                
                const explanationContent = document.createTextNode(q.explanation);
                
                explanationDiv.appendChild(explanationLabel);
                explanationDiv.appendChild(explanationContent);
                feedbackBlock.appendChild(explanationDiv);
            }

            feedbackArea.appendChild(feedbackBlock);
        });

        if (currentQuizId && downloadBtn) {
            downloadBtn.href = `/quizgenai/quiz/${currentQuizId}/download/`;
            downloadBtn.style.display = 'inline-block';
        }
        
        if (currentQuizId && flashcardsBtn) {
            flashcardsBtn.href = `/quizgenai/quiz/${currentQuizId}/flashcards/`;
            flashcardsBtn.style.display = 'inline-block';
        }
    }

    function getUserAnswers() {
        const answers = [];
        quizData.forEach((q, index) => {
            const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
            answers.push(selectedOption ? parseInt(selectedOption.value) : -1);
        });
        return answers;
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

