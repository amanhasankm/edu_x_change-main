from django.test import TestCase
from unittest import TestCase

from users.models import Users
from community.models import Community
from basic.exceptions import ValidationException
from .models import Posts


# Create your tests here.
class TestValidPost(TestCase):

	def test_valid_drafted_posts(self):
		validPost = Posts(title="something",
		                  body="some content",
		                  created_user=Users.objects.get(id=2),
		                  community=Community.objects.get(id=1),
		                  is_drafted=True)
		self.assertTrue(validPost.validate_post())

		validPost = Posts(title=None,
		                  body="some content",
		                  created_user=Users.objects.get(id=2),
		                  community=Community.objects.get(id=1),
		                  is_drafted=True)
		self.assertTrue(validPost.validate_post())

		validPost = Posts(title="Something",
		                  body=None,
		                  created_user=Users.objects.get(id=2),
		                  community=Community.objects.get(id=1),
		                  is_drafted=True)
		self.assertTrue(validPost.validate_post())

		validPost = Posts(title=None,
		                  body=None,
		                  created_user=Users.objects.get(id=2),
		                  community=None,
		                  is_drafted=True)
		self.assertTrue(validPost.validate_post())

		validPost = Posts(title="Something",
		                  body="Some contents",
		                  created_user=Users.objects.get(id=2),
		                  community=None,
		                  is_drafted=True)
		self.assertTrue(validPost.validate_post())

	def test_invalid_drafted_posts(self):
		# invalidPost = Posts(title="s",
		#                     body="Some contents",
		#                     created_user=Users.objects.get(id=2),
		#                     community=Community.objects.get(id=1),
		#                     is_drafted=True)
		# self.assertRaises(ValidationException, invalidPost.validate_post)

		# invalidPost = Posts(title=None,
		#                     body="S",
		#                     created_user=Users.objects.get(id=2),
		#                     community=Community.objects.get(id=1),
		#                     is_drafted=True)
		# self.assertRaises(ValidationException, invalidPost.validate_post)

		# invalidPost = Posts(title="Something",
		#                     body="S",
		#                     created_user=Users.objects.get(id=2),
		#                     community=Community.objects.get(id=1),
		#                     is_drafted=True)
		# self.assertRaises(ValidationException, invalidPost.validate_post)

		# invalidPost = Posts(title="s",
		#                     body="Some contents",
		#                     created_user=Users.objects.get(id=2),
		#                     community=Community.objects.get(id=1),
		#                     is_drafted=True)
		# self.assertRaises(ValidationException, invalidPost.validate_post)

		invalidPost = Posts(title=None,
		                    body="S" * 12001,
		                    created_user=Users.objects.get(id=2),
		                    community=Community.objects.get(id=1),
		                    is_drafted=True)
		self.assertRaises(ValidationException, invalidPost.validate_post)

		invalidPost = Posts(title="s" * 101,
		                    body=None,
		                    created_user=Users.objects.get(id=2),
		                    community=Community.objects.get(id=1),
		                    is_drafted=True)
		self.assertRaises(ValidationException, invalidPost.validate_post)

		invalidPost = Posts(title="s" * 101,
		                    body="Some contents",
		                    created_user=Users.objects.get(id=2),
		                    community=Community.objects.get(id=1),
		                    is_drafted=True)
		self.assertRaises(ValidationException, invalidPost.validate_post)

		invalidPost = Posts(title="s" * 101,
		                    body="S" * 12001,
		                    created_user=Users.objects.get(id=2),
		                    community=Community.objects.get(id=1),
		                    is_drafted=True)
		self.assertRaises(ValidationException, invalidPost.validate_post)
