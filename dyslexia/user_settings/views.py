from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .serializers import UserSettingsSerializer
from .models import UserSettings


class UserSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSettingsSerializer

    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(UserSettings, user=self.request.user)