from rest_framework import serializers
from .models import UserSettings

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['font_type', 'font_size', 'letter_spacing', 'voice_speed', 'voice_pitch', 'theme']