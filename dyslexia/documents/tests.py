import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Document, ProcessedText


class _MockNLPResponse:
    def __init__(self, payload):
        self.payload = payload

    def read(self):
        return json.dumps(self.payload).encode('utf-8')

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class DocumentPostTests(TestCase):
	def setUp(self):
		self.user = get_user_model().objects.create_user(
			username='testuser',
			email='test@example.com',
			password='password123',
		)
		self.client = APIClient()
		self.client.force_authenticate(user=self.user)

	@patch('documents.views.urlopen')
	def test_post_returns_simplified_text_from_nlp_service(self, mock_urlopen):
		mock_urlopen.return_value = _MockNLPResponse(
			{
				'simplified_text': 'easy text',
				'words': ['hard', 'text'],
				'explanation_text': 'Explanation',
			}
		)

		response = self.client.post(
			'/documents/',
			{'source': 'browser', 'raw_text': 'hard text'},
			format='json',
		)

		self.assertEqual(response.status_code, 201)
		self.assertEqual(
			response.data,
			{'simplified_text': 'easy text', 'difficult_words': ['hard', 'text']},
		)
		self.assertEqual(Document.objects.count(), 1)
		self.assertEqual(ProcessedText.objects.count(), 1)
		self.assertEqual(Document.objects.first().raw_text, 'hard text')
		processed = ProcessedText.objects.first()
		self.assertEqual(processed.simplified_text, 'easy text')
		self.assertEqual(processed.difficulty_map, ['hard', 'text'])
		self.assertEqual(processed.explanation_text, 'Explanation')
