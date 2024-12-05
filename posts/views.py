from django.http import HttpResponse, HttpRequest, JsonResponse, FileResponse
from django.views import View
from django.shortcuts import redirect
from django.core.paginator import Paginator

import time

from basic.exceptions import *
from basic.utils import *
from community.models import Community
from .models import Posts, PostsFilesStore
from users.models import Users

logger = get_logger(__name__)


def create_post_and_respond(user,
                            title=None,
                            community=None,
                            body=None,
                            is_drafted=True,
                            reply_to=None,
                            files=[]):
	"""
	Create a new post and responds with a JSON object.
	The user parameter is required, and represents the user creating the post. 

	Returns a JSON response object.
	"""

	try:
		p = Posts(title=title,
		          community=community,
		          body=body,
		          is_drafted=is_drafted,
		          created_user=user,
		          reply_to=reply_to)
		p.validate_post()
		p.save()

		for file in files:
			f_name = f"{time.time()}_{p.id}_{file.name}"
			f_store = PostsFilesStore(notes_file=file, notes_file_name=f_name)
			f_store.save()
			p.files.add(f_store)

		key = "drafted" if is_drafted else "saved"
		resp = success_resp_data(f"Post {key} successfully")
		return JsonResponse(resp)
	except ValidationException as e:
		resp = error_resp_data(e)
		return JsonResponse(resp, status=406)
	resp = error_resp_data(ServerException(), status=500)
	return JsonResponse(resp, status=500)


def recent(req: HttpRequest):
	if not req.user.is_active:
		resp = error_resp_data(
		    NotAuthorizedException("Login to see recent posts"))
		return JsonResponse(resp, status=401)

	try:

		raw_posts = Posts.objects.filter(
		    community__participants=req.user, is_drafted=False,
		    reply_to=None).order_by('created_time').reverse()

		page_no = int(req.GET.get('page', 1))
		pg = Paginator(raw_posts, 15)
		if pg.num_pages < page_no:
			resp = success_resp_data("End of page", "END_OF_PAGE", data=[])
			return JsonResponse(resp)

		posts = []

		for p in pg.get_page(page_no):
			posts.append(get_post_data(p, req.user))
		resp = success_resp_data("Posts retrieved successfully", data=posts)
		return JsonResponse(resp)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def upvote(req: HttpRequest, p_id):
	if not req.user.is_active:
		resp = error_resp_data(
		    NotAuthorizedException("Login to upvote a post"))
		return JsonResponse(resp, status=401)

	try:
		p = Posts.objects.get(id=p_id, is_drafted=False)

		if p.upvotes_users.filter(username=req.user.username).exists():
			p.upvotes_users.remove(req.user)
			resp = success_resp_data("Removed upvote successfully",
			                         data=get_post_data(p, req.user))
			return JsonResponse(resp)

		p.downvotes_users.remove(req.user)
		p.upvotes_users.add(req.user)
		resp = success_resp_data("Post upvoted successfully",
		                         data=get_post_data(p, req.user))
		return JsonResponse(resp)
	except Posts.DoesNotExist:
		resp = error_resp_data(DoesNotExistException("Post does not exist"))
		return JsonResponse(resp, status=404)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def downvote(req: HttpRequest, p_id):
	if not req.user.is_active:
		resp = error_resp_data(
		    NotAuthorizedException("Login to downvote a post"))
		return JsonResponse(resp, status=401)

	try:
		p = Posts.objects.get(id=p_id, is_drafted=False)

		if p.downvotes_users.filter(username=req.user.username).exists():
			p.downvotes_users.remove(req.user)

			resp = success_resp_data("Removed downvote successfully",
			                         data=get_post_data(p, req.user))
			return JsonResponse(resp)

		p.downvotes_users.add(req.user)
		p.upvotes_users.remove(req.user)

		resp = success_resp_data("Post upvoted successfully",
		                         data=get_post_data(p, req.user))
		return JsonResponse(resp)
	except Posts.DoesNotExist:
		resp = error_resp_data(DoesNotExistException("Post does not exist"))
		return JsonResponse(resp, status=404)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def save(req: HttpRequest):
	if not req.user.is_active or not req.user.has_perm('posts.add_posts'):
		resp = error_resp_data(
		    NotAuthorizedException("Not authorized to create a post"))
		return JsonResponse(resp, status=401)

	title = req.POST.get('title')
	body = req.POST.get('body')
	comm_name = req.POST.get('community')
	notes = req.FILES.getlist('notes', [])

	if len(notes) > 5:
		resp = error_resp_data(
		    InvalidFileException("At max only 5 notes allowed"))
		return JsonResponse(resp, status=406)

	for note in notes:
		if not is_valid_pdf(note):
			resp = error_resp_data(
			    InvalidFileException(
			        "Enter valid PDF file and size should be less than 10MB"))
			return JsonResponse(resp, status=406)

	community = None

	# Check if user is in the community
	try:
		community = Community.objects.get(name=comm_name)
		if not community.user_exists(req.user.username):
			resp = error_resp_data(
			    DoesNotExistException(
			        "You dont belong to this community, join the community to post"
			    ))
			return JsonResponse(resp, status=401)
	except Community.DoesNotExist:
		resp = error_resp_data(
		    DoesNotExistException("Community does not exist"))
		return JsonResponse(resp, status=400)

	# Create the post
	try:
		drafted = Posts.objects.get(created_user=req.user,
		                            is_drafted=True,
		                            reply_to=None)
		drafted.title = title
		drafted.body = body
		drafted.community = community
		drafted.is_drafted = False

		drafted.validate_post()
		drafted.save()

		for note in notes:
			f_name = f"{time.time()}_{drafted.id}_{note.name}"
			file_store = PostsFilesStore(notes_file=note,
			                             notes_file_name=f_name)
			file_store.save()
			drafted.files.add(file_store)

		resp = success_resp_data("Post created successfully")
		return JsonResponse(resp)
	except Posts.DoesNotExist:
		return create_post_and_respond(req.user,
		                               title=title,
		                               body=body,
		                               community=community,
		                               is_drafted=False,
		                               files=notes)
	except ValidationException as e:
		resp = error_resp_data(e)
		return JsonResponse(resp, status=406)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)

	resp = error_resp_data(ServerException())
	return JsonResponse(resp, status=500)


def delete(req: HttpRequest, p_id: int):
	if not req.user.is_active:
		resp = error_resp_data(
		    NotAuthorizedException("Not authorized to delete a post"))
		return JsonResponse(resp, status=401)

	try:
		p = Posts.objects.get(id=p_id, is_drafted=False)
		if req.user.username == p.created_user.username or p.community.moderator.username == req.user.username:
			p.delete()
			resp = success_resp_data("Post deleted successfully")
			return JsonResponse(resp)
		resp = error_resp_data(
		    NotAuthorizedException(
		        "Only the post creator or moderator can delete the post"))
		return JsonResponse(resp, status=401)
	except Posts.DoesNotExist:
		resp = error_resp_data(DoesNotExistException("Post does not exist"))
		return JsonResponse(resp, status=404)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def save_post(req: HttpRequest, p_id: int):
	if not req.user.is_active:
		resp = error_resp_data(NotAuthorizedException("Login to save posts"))
		return JsonResponse(resp, status=401)

	try:
		p = Posts.objects.get(id=p_id, is_drafted=False)
		p.saved_by.add(req.user)
		resp = success_resp_data("Post saved successfully",
		                         data=get_post_data(p, req.user))
		return JsonResponse(resp)
	except Posts.DoesNotExist:
		resp = error_resp_data(DoesNotExistException("Post does not exist"))
		return JsonResponse(resp, status=404)
	except Exception as e:
		logger.debug(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def saved_posts(req: HttpRequest):
	if not req.user.is_active:
		resp = error_resp_data(NotAuthorizedException("Login to save posts"))
		return JsonResponse(resp, status=401)

	try:
		posts = req.user.posts_saved.all().order_by('created_time').reverse()

		page_no = int(req.GET.get('page', 1))
		pg = Paginator(posts, 15)
		if pg.num_pages < page_no:
			resp = success_resp_data("End of page", "END_OF_PAGE", data=[])
			return JsonResponse(resp)

		pages = pg.page(page_no)
		res_posts = []

		for post in pages:
			res_posts.append(get_post_data(post, req.user))
		resp = success_resp_data("Retrieved saved posts successfully.",
		                         data=res_posts)
		return JsonResponse(resp)
	except Exception as e:
		logger.debug(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def remove_saved(req: HttpRequest, p_id: int):
	if not req.user.is_active:
		resp = error_resp_data(
		    NotAuthorizedException("Login to save or remove posts"))
		return JsonResponse(resp, status=401)

	try:
		post = Posts.objects.get(id=p_id)
		post.saved_by.remove(req.user)
		resp = success_resp_data("Post removed from saved successfully")
		return JsonResponse(resp)
	except Posts.DoesNotExist:
		resp = error_resp_data(DoesNotExistException("Post does not exists!"))
		return JsonResponse(resp, status=404)
	except Exception as e:
		logger.debug(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def notes_view(req: HttpRequest, p_id: int, f_id: int):
	if not req.user.is_active:
		resp = error_resp_data(
		    NotAuthorizedException("Not authorized to view files"))
		return JsonResponse(resp, status=401)

	try:
		p = Posts.objects.get(id=p_id)
		f = p.files.filter(id=f_id)
		if f.exists():
			f_resp_name = f[0].notes_file.name.replace(
			    "userassets/posts_files/", "")
			resp = FileResponse(f[0].notes_file)
			resp['Content-Type'] = 'application/pdf'
			resp['Content-Disposition'] = 'attachment; filename=' + f_resp_name
			return resp

		resp = error_resp_data(DoesNotExistException("File does not exist"))
		return JsonResponse(resp, status=404)
	except Posts.DoesNotExist:
		resp = error_resp_data(DoesNotExistException("Post does not exist"))
		return JsonResponse(resp, status=404)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


class Reply(View):

	def get(self, req: HttpRequest, p_id: int):
		if not req.user.is_active:
			resp = error_resp_data(NotAuthorizedException("Login to reply"))
			return JsonResponse(resp, status=401)

		try:
			replies = []
			raw_replies = Posts.objects.filter(
			    reply_to=p_id,
			    is_drafted=False).order_by('created_time').reverse()

			page_no = int(req.GET.get('page', 1))
			pg = Paginator(raw_replies, 15)
			if pg.num_pages < page_no:
				resp = success_resp_data("End of page", "END_OF_PAGE", data=[])
				return JsonResponse(resp)

			pages = pg.page(page_no)

			for r in pages:
				replies.append(get_post_data(r, req.user))
			resp = success_resp_data("Retrieved post successfully",
			                         data=replies)
			return JsonResponse(resp)
		except Posts.DoesNotExist:
			resp = error_resp_data(
			    DoesNotExistException("Post does not exist"))
			return JsonResponse(resp, status=404)
		except Exception as e:
			logger.debug(e)
			resp = error_resp_data(ServerException())
			return JsonResponse(resp, status=500)

	def post(self, req: HttpRequest, p_id: int):
		if not req.user.is_active:
			resp = error_resp_data(NotAuthorizedException("Login to reply"))
			return JsonResponse(resp, status=401)

		body = req.POST.get('body')
		notes = req.FILES.getlist('notes', [])

		if not is_valid_post_body(body):
			resp = error_resp_data(ValidationException("Invalid post body"))
			return JsonResponse(resp, status=406)

		for note in notes:
			if not is_valid_pdf(note):
				resp = error_resp_data(
				    InvalidFileException(
				        "Enter valid PDF file and size should be less than 10MB"
				    ))
				return JsonResponse(resp, status=406)

		replying_post = None

		try:
			replying_post = Posts.objects.get(id=p_id, reply_to=None)
		except Posts.DoesNotExist:
			resp = error_resp_data(
			    DoesNotExistException("Post does not exist"))
			return JsonResponse(resp, status=404)

		try:
			r = Posts.objects.get(created_user=req.user,
			                      reply_to=replying_post,
			                      is_drafted=True)
			r.is_drafted = False
			r.body = body
			r.save()

			for file in notes:
				f_name = f"{time.time()}_{r.id}_{file.name}"
				f_store = PostsFilesStore(notes_file=file,
				                          notes_file_name=f_name)
				f_store.save()
				r.files.add(f_store)
			resp = success_resp_data("Post replied successfully")
			return JsonResponse(resp)
		except Posts.DoesNotExist:
			resp = error_resp_data(
			    DoesNotExistException(
			        "Please wait till the reply get's drafted"))
			return JsonResponse(resp, status=404)
		except Exception as e:
			logger.debug(e)
			resp = error_resp_data(ServerException())
			return JsonResponse(resp, status=500)


class Draft(View):

	def get(self, req: HttpRequest, p_id=None):
		if not req.user.is_active:
			return JsonResponse(
			    error_resp_data(NotAuthorizedException("Not authorized")))

		try:
			posts = None
			if p_id:
				posts = Posts.objects.get(created_user=req.user,
				                          is_drafted=True,
				                          reply_to=p_id)
			else:
				posts = Posts.objects.get(created_user=req.user,
				                          is_drafted=True)

			posts_info = {
			    'id': posts.id,
			    'title': posts.title,
			    'body': posts.body,
			    'createdDate': format_date(posts.created_time),
			    'createdTime': format_time(posts.created_time),
			    'communityName':
			    posts.community.name if posts.community else None
			}
			resp = success_resp_data("Successfully retrieved", data=posts_info)
			return JsonResponse(resp)
		except Posts.DoesNotExist as e:
			resp = error_resp_data(
			    DoesNotExistException("No drafted post, create new post",
			                          "NO_DRAFTED_POST"))
			return JsonResponse(resp, status=200)
		except Exception as e:
			logger.error(e)
			resp = error_resp_data(ServerException())
			return JsonResponse(resp, status=500)

	def post(self, req: HttpRequest):
		if not req.user.is_active or not req.user.has_perm('posts.add_posts'):
			resp = error_resp_data(
			    NotAuthorizedException("Not authorized to create a post"))
			return JsonResponse(resp, status=401)

		title = req.POST.get('title')
		comm_name = req.POST.get('community')
		body = req.POST.get('body')
		reply_to = int(
		    req.POST.get('replyTo')) if req.POST.get('replyTo') else None

		if reply_to:
			try:
				reply_to = Posts.objects.get(id=reply_to, reply_to=None)
				comm_name = reply_to.community.name
			except Posts.DoesNotExist:
				resp = error_resp_data(
				    DoesNotExistException(
				        "Replying to post that does not exist"))
				return JsonResponse(resp, status=404)

		community = None

		if comm_name:
			try:
				community = Community.objects.get(name=comm_name)
				if not community.user_exists(req.user.username):
					resp = error_resp_data(
					    DoesNotExistException(
					        "You dont belong to this community, join the community to post"
					    ))
					return JsonResponse(resp, status=401)
			except Community.DoesNotExist:
				resp = error_resp_data(
				    DoesNotExistException("Community does not exist"))
				return JsonResponse(resp, status=404)

		try:
			dp = Posts.objects.get(created_user=req.user,
			                       is_drafted=True,
			                       reply_to=reply_to)

			if title is not None and reply_to is None:
				dp.title = title
			if community is not None:
				dp.community = community
			if body is not None:
				dp.body = body
			dp.validate_post()
			dp.save()
			resp = success_resp_data("Post drafted successfully")
			return JsonResponse(resp, status=200)
		except Posts.DoesNotExist:
			return create_post_and_respond(user=req.user,
			                               title=title,
			                               community=community,
			                               body=body,
			                               is_drafted=True,
			                               reply_to=reply_to)
		except ValidationException as e:
			resp = error_resp_data(e)
			return JsonResponse(resp, status=406)
		except Exception as e:
			logger.error(e)
			resp = error_resp_data(ServerException())
			return JsonResponse(resp, status=500)

		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


class ImageView(View):

	def get(self, req: HttpRequest, img_name: str):
		if not req.user.is_active:
			resp = error_resp_data(NotAuthorizedException("Not authorized"))
			return JsonResponse(resp, status=401)

		try:
			img = PostsFilesStore.objects.get(image_name=img_name)
			resp = HttpResponse(img.image, content_type="image/png")
			return resp
		except PostsFilesStore.DoesNotExist as e:
			resp = redirect('/static/image_error.svg', status=404)
			return resp
		except Exception as e:
			logger.error(e)
			resp = error_resp_data(ServerException())
			return JsonResponse(resp, status=500)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)

	def post(self, req: HttpRequest):
		if not req.user.is_active:
			resp = error_resp_data(NotAuthorizedException("Not authorized"))
			return JsonResponse(resp, status=401)

		img = req.FILES.get('image')
		reply_to = int(
		    req.POST.get('replyTo')) if req.POST.get('replyTo') else None

		if not is_valid_image(img, no_size=True, gif=True):
			resp = error_resp_data(
			    ValidationException(
			        "Invalid image, only JPG, PNG, webp, GIF formats are allowed",
			        "INVALID_IMAGE"))
			return JsonResponse(resp, status=406)

		if reply_to:
			try:
				reply_to = Posts.objects.get(id=reply_to, reply_to=None)
				comm_name = reply_to.community.name
			except Posts.DoesNotExist:
				resp = error_resp_data(
				    DoesNotExistException(
				        "Replying to post that does not exist"))
				return JsonResponse(resp, status=404)

		try:
			drafted_post = Posts.objects.get(created_user=req.user,
			                                 is_drafted=True,
			                                 reply_to=reply_to)
			img_name = img.name.replace(" ", "")
			img_name = f"{time.time()}_{drafted_post.id}_{img_name}"

			img_db = PostsFilesStore(image=img, image_name=img_name)
			img_db.save()

			drafted_post.files.add(img_db)
			drafted_post.save()
			resp = success_resp_data("Image added successfully",
			                         data=format_post_imgs(img_db.image_name))
			return JsonResponse(resp)
		except Posts.DoesNotExist:
			resp = error_resp_data(
			    DoesNotExistException(
			        "Post does not exist, wait till it is drafted"))
			return JsonResponse(resp, status=400)
		except Exception as e:
			logger.error(e)
			resp = error_resp_data(ServerException())
			return JsonResponse(resp, status=500)
