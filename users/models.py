from django.db import models
from basic.utils import *
from basic.exceptions import AlreadyExistException, ValidationException
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Permission
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User

# from posts.models import Posts
# from community.models import Community


class UsersManager(BaseUserManager):

	def create_user(self, username, password, email, name, **extra_fields):
		if not username:
			raise ValueError('Users must have a username')
		user: Users = self.model(username=username,
		                         email=email,
		                         name=name,
		                         **extra_fields)
		if user.user_exists(user.username):
			raise AlreadyExistException(
			    f'User with "{user.username}" username already exist',
			    "USERNAME_TAKEN")
		if not is_valid_password(password):
			raise ValidationException("Invalid password")
		user.password = make_password(password, salt=username)
		user.save()
		user.set_basic_perms()
		return user

	def create_superuser(self, username, password, email, name,
	                     **extra_fields):
		extra_fields.setdefault('is_staff', True)
		extra_fields.setdefault('is_superuser', True)

		if extra_fields.get('is_staff') is not True:
			raise ValueError('Superuser must have is_staff=True.')

		su_user = self.create_user(username, password, email, name,
		                           **extra_fields)

		return su_user

	def get_by_natural_key(self, username):
		return self.get(username=username)


# Create your models here.
class Users(AbstractBaseUser, PermissionsMixin):
	name = models.CharField(max_length=35)
	username = models.CharField(max_length=20, unique=True)
	password = models.CharField(max_length=100)
	email = models.EmailField(max_length=50)
	created_time = models.DateTimeField(auto_now_add=True)
	avatar = models.SmallIntegerField(default=1)

	is_staff = models.BooleanField(default=False)
	is_superuser = models.BooleanField(default=False)

	USERNAME_FIELD = 'username'
	REQUIRED_FIELDS = ['password', 'email', 'name']

	objects = UsersManager()

	def save(self, *args, **kwargs):
		self.validate_user()
		super().save(*args, **kwargs)

	def validate_user(self):
		if is_valid_name(self.name) and is_valid_email(
		    self.email) and is_valid_username(self.username):
			return True
		raise ValidationException("Some fields submitted were invalid!",
		                          "INVALID_FIELD")

	def user_exists(self, username):
		try:
			Users.objects.get(username=username)
			return True
		except Users.DoesNotExist:
			return False

	def set_basic_perms(self):
		comm_perms = ['add_community', 'change_community', 'delete_community']
		post_perms = ['add_posts', 'change_posts', 'delete_posts']

		for i in range(3):
			self.user_permissions.add(
			    Permission.objects.get(codename=comm_perms[i]))
			self.user_permissions.add(
			    Permission.objects.get(codename=post_perms[i]))

	def __str__(self) -> str:
		return str(self.name)
