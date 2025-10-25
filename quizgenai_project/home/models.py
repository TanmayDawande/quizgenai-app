from django.db import models
import uuid

class Quiz(models.Model):
    """
    Represents a quiz generated from a PDF.
    """
    # A unique ID for each quiz, useful for URLs.
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # The title of the quiz, which can be the PDF filename.
    title = models.CharField(max_length=255)
    
    # The actual quiz questions and answers, stored in a flexible JSON format.
    quiz_data = models.JSONField()
    
    # Automatically records the date and time when the quiz was created.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """A human-readable representation of the model."""
        return self.title