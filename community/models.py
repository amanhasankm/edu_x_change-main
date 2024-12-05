from django.db import models
from users.models import Users

from basic.exceptions import AlreadyExistException, ValidationException
from basic.utils import get_logger, is_valid_image, is_valid_comm_name

logger = get_logger(__name__)

# from users.models import Users
# from community.models import Community
# from posts.models import Posts


# Create your models here.
class Community(models.Model):
	name = models.CharField(max_length=25)
	created_time = models.DateTimeField(auto_now_add=True)
	participants = models.ManyToManyField(
	    Users,
	    related_name='communities_joined',
	)
	topic = models.CharField(max_length=25, default=None)
	description = models.CharField(max_length=500, default=None, null=True)
	icon_path = models.ImageField(upload_to='userassets/community_icons/',
	                              default=None,
	                              null=True)

	moderator = models.ForeignKey(Users,
	                              related_name='moderator_of',
	                              null=True,
	                              on_delete=models.SET_NULL)

	def validate_community(self, ignore_unique=False):
		if not is_valid_comm_name(
		    self.name) or self.topic is None or len(self.topic) < 3 or len(
		        self.topic) > 25 or len(self.description) > 500:
			raise ValidationException("Some field entered were invalid!",
			                          "INVALID_FIELD")

		if self.icon_path.name is not None and not is_valid_image(
		    self.icon_path):
			raise ValidationException(
			    "Image should be a valid PNG, JPG and size should be less than 1MB",
			    "INVALID_IMAGE")

		if not ignore_unique and self.community_exists(self.name):
			raise AlreadyExistException(
			    f'Community with name "{self.name}" already exists',
			    "COMMUNITY_NAME_TAKEN")
		return True

	def community_exists(self, name):
		try:
			Community.objects.get(name=name)
			return True
		except Community.DoesNotExist:
			return False

	def user_exists(self, username):
		try:
			self.participants.get(username=username)
			return True
		except Users.DoesNotExist:
			return False
		return False

	def __str__(self) -> str:
		return self.name
