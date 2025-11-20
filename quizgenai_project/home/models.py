from django.db import models
from django.contrib.auth.models import User
import uuid

class Quiz(models.Model):
    """
    Represents a quiz generated from a PDF.
    """
    # A unique ID for each quiz, useful for URLs.
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # The user who created the quiz
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # The title of the quiz, which can be the PDF filename.
    title = models.CharField(max_length=255)
    
    # The actual quiz questions and answers, stored in a flexible JSON format.
    quiz_data = models.JSONField()
    
    # Automatically records the date and time when the quiz was created.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """A human-readable representation of the model."""
        return self.title

class QuizAttempt(models.Model):
    """
    Represents a user's attempt at a quiz.
    """
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    score = models.IntegerField()
    # Store answers as a JSON list of indices: [0, 2, 1, -1, ...] (-1 for no answer)
    user_answers = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quiz.title} - {self.score}"