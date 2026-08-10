from rest_framework import serializers

from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'source', 'raw_text', 'extracted_at']


class DocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['source', 'raw_text']


class DocumentSimplifiedTextSerializer(serializers.Serializer):
    simplified_text = serializers.CharField()
    difficult_words = serializers.ListField(
        child=serializers.JSONField(), allow_empty=True, required=False
    )