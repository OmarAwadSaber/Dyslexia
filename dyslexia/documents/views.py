import json
import logging
from urllib.error import HTTPError, URLError
from urllib.request import ProxyHandler, Request, build_opener

from django.conf import settings
from django.db import transaction
from rest_framework import generics
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Document, ProcessedText
from .serializers import (
    DocumentCreateSerializer,
    DocumentSerializer,
    DocumentSimplifiedTextSerializer,
)


logger = logging.getLogger(__name__)


class NLPServiceError(APIException):
    status_code = 502
    default_detail = 'Unable to process text with the NLP service.'
    default_code = 'nlp_service_error'


class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        input_serializer = DocumentCreateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        nlp_result = self._predict_simplified_text(input_serializer.validated_data['raw_text'])
        simplified_text = nlp_result['simplified_text']
        difficult_words = nlp_result['difficult_words']
        explanation_text = nlp_result['explanation_text']

        with transaction.atomic():
            document = Document.objects.create(
                user=request.user,
                **input_serializer.validated_data,
            )
            ProcessedText.objects.create(
                document=document,
                simplified_text=simplified_text,
                difficulty_map=difficult_words,
                explanation_text=explanation_text,
            )

        output_serializer = DocumentSimplifiedTextSerializer(
            {'simplified_text': simplified_text, 'difficult_words': difficult_words}
        )

        return Response(output_serializer.data, status=201)

    def _predict_simplified_text(self, raw_text):
        if not settings.NLP_URL:
            logger.error('NLP prediction skipped because NLP_URL is not configured.')
            raise NLPServiceError('NLP_URL is not configured.')

        endpoint = f"{settings.NLP_URL.rstrip('/')}/predict"
        payload = json.dumps({'text': raw_text}).encode('utf-8')
        request = Request(
            endpoint,
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='POST',
        )
        opener = build_opener(ProxyHandler({}))

        try:
            with opener.open(request, timeout=30) as response:
                response_body = response.read().decode('utf-8')
        except (HTTPError, URLError, TimeoutError, ValueError) as exc:
            logger.exception('NLP request failed for endpoint %s', endpoint)
            raise NLPServiceError() from exc

        try:
            response_data = json.loads(response_body)
        except json.JSONDecodeError as exc:
            logger.exception('NLP service returned invalid JSON from endpoint %s', endpoint)
            raise NLPServiceError('NLP service returned invalid JSON.') from exc

        if not isinstance(response_data, dict):
            logger.error('NLP service response from %s was not a JSON object: %r', endpoint, response_data)
            raise NLPServiceError('NLP service response did not include simplified text.')

        simplified_text = response_data.get('simplified_text')
        if not simplified_text:
            logger.error('NLP service response from %s did not include simplified_text: %r', endpoint, response_data)
            raise NLPServiceError('NLP service response did not include simplified text.')

        difficult_words = response_data.get('words') or response_data.get('difficulty_map') or []
        explanation_text = response_data.get('explanation_text') or ''

        return {
            'simplified_text': simplified_text,
            'difficult_words': difficult_words,
            'explanation_text': explanation_text,
        }

class DocumentDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)