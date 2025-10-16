from django.shortcuts import render, get_object_or_404 # Import get_object_or_404 here
from django.http import JsonResponse
from . import services
from .models import Quiz

# --- Page-Rendering Views ---

def index(request):
    """Renders the main quiz generator page."""
    return render(request, 'index.html')

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
    Handles the API request to generate a quiz and saves it.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
        
    pdf_file = request.FILES.get('pdf')
    num_questions = request.POST.get('num_questions', 5)

    if not pdf_file:
        return JsonResponse({'error': 'No PDF file provided'}, status=400)

    try:
        quiz_data = services.generate_quiz_from_pdf(pdf_file, num_questions)
        
        Quiz.objects.create(
            title=pdf_file.name,
            quiz_data=quiz_data
        )
        
        return JsonResponse(quiz_data, safe=False)
        
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

