# hello/home/views.py

from django.shortcuts import render
from django.http import JsonResponse
from . import services  # Import your new services.py file

# --- Your Page-Rendering Views ---

def index(request):
    return render(request, 'index.html')

def description(request):
    return render(request, 'description.html')

def about(request):
    """Simple About page view so `home.urls` can reference `views.about`.

    Renders the `index.html` template as a placeholder (there is no
    dedicated about.html in this project). Change to a different template
    if you add one later.
    """
    return render(request, 'index.html')

# --- Your API View ---

def generate_quiz_view(request):
    """
    This view handles the API request from the frontend.
    It's a "thin" view that coordinates the request and response.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
        
    pdf_file = request.FILES.get('pdf')

    num_questions = request.POST.get('num_questions', 5)
    if not pdf_file:
        return JsonResponse({'error': 'No PDF file provided'}, status=400)

    try:
        # The view now calls the service function to do all the heavy lifting
        quiz_data = services.generate_quiz_from_pdf(pdf_file, num_questions)
        
        # The view's only remaining job is to send the result back as JSON
        return JsonResponse(quiz_data, safe=False)
        
    except Exception as e:
        # Handle any errors that might happen in the service
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)
    