from django.db import models
from django.db.models import Model, ForeignKey
from basic.exceptions import ValidationException
from basic.utils import is_valid_post_title, is_valid_post_body

# Create your models here.


class PostsFilesStore(Model):
	image = models.ImageField(upload_to="userassets/posts_images/",
	                          default=None)
	image_name = models.CharField(max_length=100, default=None, null=True)
	notes_file = models.FileField(upload_to="userassets/posts_files/",
	                              default=None)
	notes_file_name = models.CharField(max_length=100, default=None, null=True)


class Posts(Model):
	title = models.CharField(max_length=100, null=True, default=None)
	created_time = models.DateTimeField(auto_now_add=True)
	body = models.TextField(max_length=12_000, null=True, default=None)
	created_user = ForeignKey("users.Users",
	                          null=True,
	                          related_name='posts_created',
	                          on_delete=models.SET_NULL)
	files = models.ManyToManyField(PostsFilesStore, related_name='post')
	upvotes_users = models.ManyToManyField("users.Users",
	                                       related_name='posts_upvoted')
	downvotes_users = models.ManyToManyField("users.Users",
	                                         related_name='posts_downvoted')

	community = ForeignKey('community.Community',
	                       on_delete=models.CASCADE,
	                       null=True,
	                       default=None)
	saved_by = models.ManyToManyField("users.Users",
	                                  related_name='posts_saved')

	is_drafted = models.BooleanField(default=False)
	reply_to = models.ForeignKey("self",
	                             on_delete=models.CASCADE,
	                             default=None,
	                             null=True)

	def validate_post(self):
		if self.created_user is None:
			raise ValidationException("You must be logged in to create a post",
			                          code="NOT_LOGGED_IN")
		if self.is_drafted:
			if (self.title is not None and
			    (len(self.title) > 100)) or (self.body is not None and
			                                 (len(self.body) > 12_000)):
				raise ValidationException(
				    "Title and body must be at least 3 characters long",
				    code="INVALID_POST")
			return True
		if not is_valid_post_title(self.title) or not is_valid_post_body(
		    self.body):
			raise ValidationException(
			    "Title and body must be at least 3 characters long",
			    code="INVALID_POST")
		return True

	def delete(self, *args, **kwargs):
		for f in self.files.all():
			f.notes_file.delete()
			f.image.delete()
			f.delete()
		super().delete(*args, **kwargs)

	def __str__(self) -> str:
		res = "__EMPTY_POST__"
		if self.body is not None and self.body.replace(" ", "") != "":
			res = self.body[:30]
		if self.title is not None and self.title.replace(" ", "") != "":
			res = self.title
		return res
