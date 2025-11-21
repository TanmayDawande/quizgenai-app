from django.contrib import admin
from .models import Quiz, QuizAttempt

# Register your models here.
@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'created_at')
    list_filter = ('created_at', 'user')
    search_fields = ('title', 'user__username')
    readonly_fields = ('id', 'created_at')

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('quiz', 'user', 'score', 'timestamp')
    list_filter = ('timestamp', 'user')
    search_fields = ('quiz__title', 'user__username')

