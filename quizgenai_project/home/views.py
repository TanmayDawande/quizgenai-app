from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from . import services
from .models import Quiz
import json

def index(request):
    return render(request, 'index.html')

def description(request):
    try:
        return render(request, 'description.html')
    except Exception as e:
        print(f"Could not find description.html: {e}")
        return render(request, 'index.html')

def history_view(request):
    quizzes = Quiz.objects.all().order_by('-created_at')
    return render(request, 'history.html', {'quizzes': quizzes})

def quiz_detail_view(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    return render(request, 'quiz_detail.html', {'quiz': quiz})

def quiz_retake_view(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id)
    return render(request, 'quiz_retake.html', {'quiz': quiz})

def generate_quiz_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    pdf_file = request.FILES.get('pdf')
    num_questions = request.POST.get('num_questions', 5)
    custom_instructions = request.POST.get('custom_instructions', '')

    if not pdf_file:
        return JsonResponse({'error': 'No PDF file provided'}, status=400)

    try:
        quiz_data = services.generate_quiz_from_pdf(pdf_file, num_questions, custom_instructions)

        quiz_title = pdf_file.name if pdf_file.name else "Untitled Quiz"
        print(f"Saving quiz with title: {quiz_title}")
        
        Quiz.objects.create(
            title=quiz_title,
            quiz_data=quiz_data
        )

        return JsonResponse(quiz_data, safe=False)

    except Exception as e:
        print(f"Error in generate_quiz_view: {e}")
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

def update_quiz_title_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        quiz_id = data.get('quiz_id')
        new_title = data.get('new_title', '').strip()

        if not quiz_id or not new_title:
            return JsonResponse({'error': 'Missing quiz_id or new_title'}, status=400)

        quiz = get_object_or_404(Quiz, id=quiz_id)
        quiz.title = new_title
        quiz.save()

        return JsonResponse({'success': True, 'message': 'Quiz title updated successfully'})

    except Exception as e:
        print(f"Error in update_quiz_title_view: {e}")
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

