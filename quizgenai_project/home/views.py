from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.cache import never_cache
from . import services
from .models import Quiz
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
    else:
        quiz = get_object_or_404(Quiz, id=quiz_id, user__isnull=True)
    return render(request, 'quiz_detail.html', {'quiz': quiz})

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
        
        Quiz.objects.create(
            user=request.user if request.user.is_authenticated else None,
            title=quiz_title,
            quiz_data=quiz_data
        )

        return JsonResponse(quiz_data, safe=False)

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

