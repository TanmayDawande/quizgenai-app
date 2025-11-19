from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="home"),
    path("api/generate-quiz/", views.generate_quiz_view, name="generate-quiz"),
    path("api/update-quiz-title/", views.update_quiz_title_view, name="update-quiz-title"),
    path("history/", views.history_view, name="history"),
    path("quiz/<uuid:quiz_id>/", views.quiz_detail_view, name="quiz_detail"),
    path("quiz/<uuid:quiz_id>/retake/", views.quiz_retake_view, name="quiz_retake")
]