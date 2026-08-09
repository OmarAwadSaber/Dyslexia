from django.db import models
from django.contrib.auth import get_user_model

user = get_user_model()

# Create your models here.
class UserSettings(models.Model):
    user = models.OneToOneField(user, on_delete=models.CASCADE, related_name='settings')
    font_type = models.CharField(max_length=255)
    font_size = models.IntegerField()
    letter_spacing = models.FloatField()
    voice_speed = models.FloatField()
    voice_pitch = models.FloatField()
    theme = models.CharField(max_length=255)

    def __str__(self):
        return f"Settings for {self.user.username}"