from django.test import TestCase
import unittest

from .utils import *
from .exceptions import *


# Create your tests here.
class TestValidationRules(unittest.TestCase):

	def test_valid_email(self):
		self.assertTrue(is_valid_email("test@example.com"))
		self.assertTrue(is_valid_email("test+sds@example.cd"))
		self.assertTrue(is_valid_email("test122+s12ds@ex12ample.cd"))

	def test_invalid_email(self):
		self.assertFalse(is_valid_email(None))
		self.assertFalse(is_valid_email("invalid_email"))
		self.assertFalse(is_valid_email("test@"))
		self.assertFalse(is_valid_email("test@sds"))
		self.assertFalse(is_valid_email("test@sds."))
		self.assertFalse(is_valid_email("@example.com"))
		self.assertFalse(is_valid_email("someone@exa.mple.com"))
		self.assertFalse(is_valid_email("someone@example..com"))

	def test_valid_username(self):
		self.assertTrue(is_valid_username('sssd'))
		self.assertTrue(is_valid_username('sss'))
		self.assertTrue(is_valid_username('ss2323'))
		self.assertTrue(is_valid_username('2323'))
		self.assertTrue(is_valid_username('2323sdas'))
		self.assertTrue(is_valid_username('2323sdas2323'))
		self.assertTrue(is_valid_username('_2323sdas_2323_'))

	def test_invalid_username(self):
		self.assertFalse(is_valid_username(None))
		self.assertFalse(is_valid_username('d'))
		self.assertFalse(is_valid_username('dasda+'))
		self.assertFalse(is_valid_username('dasda+23sd'))
		self.assertFalse(is_valid_username('dasda.sd'))
		self.assertFalse(is_valid_username('dadoakdopakdokapsokdskd'))
		self.assertFalse(is_valid_username('     '))

	def test_valid_password(self):
		self.assertTrue(is_valid_password('sjsusjip'))
		self.assertTrue(is_valid_password('sjsusjipas2d234'))

	def test_invalid_password(self):
		self.assertFalse(is_valid_password(None))
		self.assertFalse(is_valid_password('iwieiri'))
		self.assertFalse(is_valid_password('sds'))

	def test_valid_name(self):
		self.assertTrue(is_valid_name('sd'))
		self.assertTrue(is_valid_name('sddad233'))

	def test_invalid_name(self):
		self.assertFalse(is_valid_name(None))
		self.assertFalse(is_valid_name('s'))
