from django.contrib import admin
from .models import Posts, PostsFilesStore

# Register your models here.
admin.site.register(Posts)
admin.site.register(PostsFilesStore)