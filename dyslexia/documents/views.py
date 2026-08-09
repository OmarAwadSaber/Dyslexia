from django.shortcuts import render
from rest_framework import generics
from .models import Document
from rest_framework.permissions import IsAuthenticated
from .serializers import DocumentSerializer
from django.shortcuts import get_object_or_404


class DocumentListView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return get_object_or_404(Document, user=self.request.user).all()
    
class DocumentDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_object_or_404(Document, user=self.request.user).all()