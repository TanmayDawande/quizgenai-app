from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("signup/", views.signup_view, name="signup"),
    path("logout/", views.logout_view, name="logout"),
    path("settings/", views.settings_view, name="settings"),
    path("", views.index, name="home"),
    path("api/generate-quiz/", views.generate_quiz_view, name="generate-quiz"),
    path("api/save-attempt/", views.save_quiz_attempt, name="save-attempt"),
    path("api/update-quiz-title/", views.update_quiz_title_view, name="update-quiz-title"),
    path("api/delete-quiz/", views.delete_quiz_view, name="delete-quiz"),
    path("history/", views.history_view, name="history"),
    path("quiz/<uuid:quiz_id>/", views.quiz_detail_view, name="quiz_detail"),
    path("quiz/<uuid:quiz_id>/retake/", views.quiz_retake_view, name="quiz_retake"),
    path("quiz/<uuid:quiz_id>/download/", views.download_quiz_pdf, name="download_quiz_pdf"),
    path("quiz/<uuid:quiz_id>/flashcards/", views.flashcards_view, name="flashcards"),
    path("progress/", views.progress_view, name="progress")
]