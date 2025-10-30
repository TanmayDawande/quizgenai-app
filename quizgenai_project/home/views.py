from django.shortcuts import render, get_object_or_404 # Import get_object_or_404 here
from django.http import JsonResponse
from . import services
from .models import Quiz

# --- Page-Rendering Views ---

def index(request):
    """Renders the main quiz generator page."""
    return render(request, 'index.html')

def description(request):
    """Renders the description page."""
    # Ensure you have a 'description.html' template in your templates folder
    try:
        return render(request, 'description.html')
    except Exception as e:
        # Fallback or error handling if description.html doesn't exist
        print(f"Could not find description.html: {e}")
        return render(request, 'index.html') # Redirect to index or show an error

def history_view(request):
    """Fetches all saved quizzes and renders the history page."""
    quizzes = Quiz.objects.all().order_by('-created_at')
    return render(request, 'history.html', {'quizzes': quizzes})

def quiz_detail_view(request, quiz_id):
    """Fetches a specific quiz and renders the VIEW-ONLY detail page."""
    quiz = get_object_or_404(Quiz, id=quiz_id)
    return render(request, 'quiz_detail.html', {'quiz': quiz})

def quiz_retake_view(request, quiz_id):
    """Fetches a specific quiz and renders the INTERACTIVE retake page."""
    quiz = get_object_or_404(Quiz, id=quiz_id)
    return render(request, 'quiz_retake.html', {'quiz': quiz})


# --- API View ---

def generate_quiz_view(request):
    """
    Handles the API request to generate a quiz, saves it,
    and accepts custom instructions.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    pdf_file = request.FILES.get('pdf')
    num_questions = request.POST.get('num_questions', 5) # Default to 5 questions
    # Get custom instructions from POST data (default to empty string)
    custom_instructions = request.POST.get('custom_instructions', '')

    if not pdf_file:
        return JsonResponse({'error': 'No PDF file provided'}, status=400)

    try:
        # Pass the instructions to the service function
        quiz_data = services.generate_quiz_from_pdf(pdf_file, num_questions, custom_instructions)

        # Save the quiz to the database
        Quiz.objects.create(
            title=pdf_file.name,
            quiz_data=quiz_data
        )

        # Send the generated quiz back to the frontend
        return JsonResponse(quiz_data, safe=False)

    except Exception as e:
        # Log the error for debugging on the server
        print(f"Error in generate_quiz_view: {e}")
        # Return a generic error message to the frontend
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

