from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.cache import never_cache
from . import services
from .models import Quiz, QuizAttempt
import json
import re

def no_cache(view_func):
    """Decorator to prevent caching of authenticated pages"""
    def wrapped_view(request, *args, **kwargs):
        response = view_func(request, *args, **kwargs)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response
    return wrapped_view

def is_valid_email(email):
    """Validate email format with strict pattern"""
    pattern = r'^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def signup_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        password_confirm = request.POST.get('password_confirm', '')
        
        if not username or not email or not password:
            return render(request, 'signup.html', {'error': 'All fields are required'})
        
        if not is_valid_email(email):
            return render(request, 'signup.html', {'error': 'Please enter a valid email address'})
        
        if password != password_confirm:
            return render(request, 'signup.html', {'error': 'Passwords do not match'})
        
        if User.objects.filter(username=username).exists():
            return render(request, 'signup.html', {'error': 'Username already exists'})
        
        if User.objects.filter(email=email).exists():
            return render(request, 'signup.html', {'error': 'Email already exists'})
        
        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            login(request, user)
            return redirect('home')
        except Exception as e:
            return render(request, 'signup.html', {'error': f'Error creating account: {str(e)}'})
    
    return render(request, 'signup.html')

def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        
        if not username or not password:
            return render(request, 'login.html', {'error': 'Username and password are required'})
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            return render(request, 'login.html', {'error': 'Invalid username or password'})
    
    return render(request, 'login.html')

def logout_view(request):
    logout(request)
    response = redirect('login')
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response

@no_cache
def index(request):
    return render(request, 'index.html')

def description(request):
    try:
        return render(request, 'description.html')
    except Exception as e:
        print(f"Could not find description.html: {e}")
        return render(request, 'index.html')

@no_cache
def history_view(request):
    if request.user.is_authenticated:
        quizzes = Quiz.objects.filter(user=request.user).order_by('-created_at')
    else:
        quizzes = Quiz.objects.filter(user__isnull=True).order_by('-created_at')
    return render(request, 'history.html', {'quizzes': quizzes})

@no_cache
def quiz_detail_view(request, quiz_id):
    if request.user.is_authenticated:
        quiz = get_object_or_404(Quiz, id=quiz_id, user=request.user)
        # Get the latest attempt for this quiz by this user
        latest_attempt = QuizAttempt.objects.filter(quiz=quiz, user=request.user).order_by('-timestamp').first()
    else:
        quiz = get_object_or_404(Quiz, id=quiz_id, user__isnull=True)
        latest_attempt = None
        
    if latest_attempt:
        user_answers = latest_attempt.user_answers
    else:
        user_answers = [-1] * len(quiz.quiz_data)
        
    # Zip questions with user answers
    questions_with_answers = zip(quiz.quiz_data, user_answers)

    context = {
        'quiz': quiz,
        'questions_with_answers': questions_with_answers,
        'score': latest_attempt.score if latest_attempt else None
    }
    return render(request, 'quiz_detail.html', context)

@no_cache
def quiz_retake_view(request, quiz_id):
    if request.user.is_authenticated:
        quiz = get_object_or_404(Quiz, id=quiz_id, user=request.user)
    else:
        quiz = get_object_or_404(Quiz, id=quiz_id, user__isnull=True)
    return render(request, 'quiz_retake.html', {'quiz': quiz})

@require_http_methods(["POST"])
def generate_quiz_view(request):
    pdf_file = request.FILES.get('pdf')
    num_questions = request.POST.get('num_questions', 5)
    custom_instructions = request.POST.get('custom_instructions', '')

    if not pdf_file:
        return JsonResponse({'error': 'No PDF file provided'}, status=400)

    try:
        quiz_data = services.generate_quiz_from_pdf(pdf_file, num_questions, custom_instructions)

        quiz_title = pdf_file.name if pdf_file.name else "Untitled Quiz"
        print(f"Saving quiz with title: {quiz_title}")
        
        quiz = Quiz.objects.create(
            user=request.user if request.user.is_authenticated else None,
            title=quiz_title,
            quiz_data=quiz_data
        )

        return JsonResponse({'quiz_id': str(quiz.id), 'questions': quiz_data})

    except Exception as e:
        print(f"Error in generate_quiz_view: {e}")
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

@require_http_methods(["POST"])
def update_quiz_title_view(request):
    try:
        data = json.loads(request.body)
        quiz_id = data.get('quiz_id')
        new_title = data.get('new_title', '').strip()

        if not quiz_id or not new_title:
            return JsonResponse({'error': 'Missing quiz_id or new_title'}, status=400)

        if request.user.is_authenticated:
            quiz = get_object_or_404(Quiz, id=quiz_id, user=request.user)
        else:
            quiz = get_object_or_404(Quiz, id=quiz_id, user__isnull=True)
        
        quiz.title = new_title
        quiz.save()

        return JsonResponse({'success': True, 'message': 'Quiz title updated successfully'})

    except Exception as e:
        print(f"Error in update_quiz_title_view: {e}")
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

@require_http_methods(["POST"])
def save_quiz_attempt(request):
    try:
        data = json.loads(request.body)
        quiz_id = data.get('quiz_id')
        score = data.get('score')
        user_answers = data.get('user_answers')

        if not quiz_id or score is None or user_answers is None:
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        if request.user.is_authenticated:
            quiz = get_object_or_404(Quiz, id=quiz_id, user=request.user)
            user = request.user
        else:
            # For anonymous users, we might still want to save it if we have the quiz ID
            # But typically we only save history for logged-in users or if the quiz exists
            quiz = get_object_or_404(Quiz, id=quiz_id)
            user = None

        QuizAttempt.objects.create(
            quiz=quiz,
            user=user,
            score=score,
            user_answers=user_answers
        )

        return JsonResponse({'success': True})

    except Exception as e:
        print(f"Error saving quiz attempt: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@login_required(login_url='login')
@no_cache
def settings_view(request):
    """Handle user settings - change username and password"""
    context = {}
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'change_username':
            new_username = request.POST.get('new_username', '').strip()
            
            if not new_username:
                context['error_message'] = 'Username cannot be empty'
            elif len(new_username) < 3:
                context['error_message'] = 'Username must be at least 3 characters long'
            elif User.objects.filter(username=new_username).exclude(pk=request.user.pk).exists():
                context['error_message'] = 'Username already taken'
            else:
                try:
                    request.user.username = new_username
                    request.user.save()
                    context['success_message'] = 'Username updated successfully!'
                except Exception as e:
                    context['error_message'] = f'Error updating username: {str(e)}'
        
        elif action == 'change_password':
            current_password = request.POST.get('current_password', '')
            new_password = request.POST.get('new_password', '')
            confirm_password = request.POST.get('confirm_password', '')
            
            if not current_password or not new_password or not confirm_password:
                context['error_message'] = 'All fields are required'
            elif new_password != confirm_password:
                context['error_message'] = 'New passwords do not match'
            elif len(new_password) < 8:
                context['error_message'] = 'Password must be at least 8 characters long'
            elif not authenticate(username=request.user.username, password=current_password):
                context['error_message'] = 'Current password is incorrect'
            else:
                try:
                    request.user.set_password(new_password)
                    request.user.save()
                    update_session_auth_hash(request, request.user)
                    context['success_message'] = 'Password updated successfully!'
                except Exception as e:
                    context['error_message'] = f'Error updating password: {str(e)}'
    
    return render(request, 'settings.html', context)

@login_required(login_url='login')
@no_cache
def progress_view(request):
    attempts = QuizAttempt.objects.filter(user=request.user).select_related('quiz').order_by('timestamp')
    
    total_attempts = attempts.count()
    
    if total_attempts == 0:
        context = {
            'total_attempts': 0,
            'average_score': 0,
            'chart_labels': json.dumps([]),
            'chart_data': json.dumps([])
        }
        return render(request, 'progress.html', context)

    total_percentage = 0
    total_correct = 0
    total_questions_all = 0
    
    correct_data = []
    incorrect_data = []
    chart_labels = []
    
    highest_score = 0
    perfect_quizzes = 0

    for attempt in attempts:
        # Calculate percentage for this attempt
        # We need to know the total number of questions in the quiz
        # quiz_data is a list of questions
        try:
            total_questions = len(attempt.quiz.quiz_data)
            if total_questions > 0:
                percentage = (attempt.score / total_questions) * 100
            else:
                percentage = 0
            
            total_correct += attempt.score
            total_questions_all += total_questions
            
            if percentage > highest_score:
                highest_score = percentage
            
            if percentage == 100 and total_questions > 0:
                perfect_quizzes += 1
            
            # Prepare data for stacked bar chart
            correct_data.append(attempt.score)
            incorrect_count = total_questions - attempt.score
            incorrect_data.append(max(0, incorrect_count))
            
        except Exception:
            percentage = 0
            correct_data.append(0)
            incorrect_data.append(0)
        
        total_percentage += percentage
        
        # Format date for chart label (e.g., "Nov 20")
        chart_labels.append(attempt.timestamp.strftime('%b %d'))

    average_score = round(total_percentage / total_attempts, 1)
    total_incorrect = total_questions_all - total_correct

    context = {
        'total_attempts': total_attempts,
        'average_score': average_score,
        'chart_labels': json.dumps(chart_labels),
        'correct_data': json.dumps(correct_data),
        'incorrect_data': json.dumps(incorrect_data),
        'total_correct': total_correct,
        'total_incorrect': total_incorrect,
        'highest_score': round(highest_score, 1),
        'perfect_quizzes': perfect_quizzes,
        'total_questions_all': total_questions_all
    }
    return render(request, 'progress.html', context)

