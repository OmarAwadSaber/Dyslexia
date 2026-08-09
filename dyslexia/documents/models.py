from django.db import models
from django.contrib.auth import get_user_model

user_model = get_user_model()

class SOURCE:
    BROWSER = 'browser'
    MOBILE = 'mobile'
    
    CHOICES = [
        (BROWSER, 'Browser'),
        (MOBILE, 'Mobile'),
    ]


class Document(models.Model):
    user = models.ForeignKey(user_model, on_delete=models.CASCADE)
    source = models.CharField(max_length=20, choices=SOURCE.CHOICES)
    raw_text = models.TextField()
    extracted_at = models.DateTimeField(auto_now_add=True)
    
class  ProcessedText(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    simplified_text = models.TextField()
    difficulty_map = models.JSONField()
    explanation_text = models.TextField()
    processed_at = models.DateTimeField(auto_now_add=True)