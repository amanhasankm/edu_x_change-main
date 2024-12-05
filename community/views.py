from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.contrib.auth.decorators import permission_required
from django.contrib.auth.models import Permission
from django.core.paginator import Paginator

import json

from basic.utils import *
from basic.exceptions import *
from .models import Community
from posts.models import Posts

logger = get_logger(__name__)


def get_comm_data(com: Community, user):
	data = {
	    'id': com.id,
	    'name': com.name,
	    'topic': com.topic,
	    'description': com.description,
	    'moderator': com.moderator.username,
	    'createdDate': format_date(com.created_time),
	    'iconPath': format_com_icon_url(com.name),
	    'participantsCount': com.participants.count(),
	    'userJoined': com.user_exists(user.username)
	}

	return data


# Create your views here.
def comm_page(req: HttpRequest, c_name: str):
	if not req.user.is_active:
		return redirect('/login/')

	logger.debug(c_name)

	try:
		com = Community.objects.get(name=c_name)
		comm_data = get_comm_data(com, req.user)

		return render(
		    req, "x/index.html", {
		        "comm_data": json.dumps(comm_data),
		        "user_data": json.dumps(get_user_data(req.user))
		    })
	except Community.DoesNotExist:
		return redirect('/404/', status=404)
	except Exception as e:
		logger.error(e)
		return HttpResponse("Internal server error!", status=500)


def create_community(req: HttpRequest):
	if req.method != 'POST':
		resp = error_resp_data(WrongMethodException())
		return JsonResponse(resp, status=400)

	if not req.user.is_active:
		err = error_resp_data(
		    NotAuthorizedException("Log in to create community"))
		return JsonResponse(err, status=403)

	commName = req.POST.get('communityName')
	topic = req.POST.get('topic')
	desc = req.POST.get('description')
	icon_img = req.FILES.get('communityIcon')
	print(commName, topic, desc, icon_img)

	try:
		if not req.user.has_perm('community.add_community'):
			resp = error_resp_data(
			    NotAuthorizedException(
			        "You don't have permission to create community",
			        "NO_PERMISSION"))
			return JsonResponse(resp, status=403)

		if commName is None:
			raise ValidationException("Community name is required")

		commName = commName.lower()

		com = Community(name=commName,
		                topic=topic,
		                description=desc,
		                icon_path=icon_img,
		                moderator=req.user)
		com.validate_community()
		com.save()
		com.participants.add(req.user)
		resp = success_resp_data("Community successfully created")
		return JsonResponse(resp)
	except ValidationException as e:
		resp = error_resp_data(e)
		return JsonResponse(resp, status=406)
	except AlreadyExistException as e:
		resp = error_resp_data(e)
		return JsonResponse(resp, status=409)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def join_community(req: HttpRequest, c_name: str):
	if not req.user.is_active:
		err = error_resp_data(
		    NotAuthorizedException("Log in to get icon", "NO_PERMISSION"))
		return JsonResponse(err, status=403)

	try:
		com = Community.objects.get(name=c_name)
		if com.user_exists(req.user.username):
			resp = error_resp_data(
			    AlreadyExistException("User has already joined"))
			return JsonResponse(resp, status=409)
		com.participants.add(req.user)
		resp = success_resp_data("Community joined successfully")
		return JsonResponse(resp)
	except Community.DoesNotExist:
		resp = error_resp_data(
		    DoesNotExistException(
		        f"Community with name '{c_name}' does not exists.",
		        "COMMUNITY_DOES_NOT_EXIST"))
		return JsonResponse(resp, status=404)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def search(req: HttpRequest, query: str):
	if not req.user.is_active:
		err = error_resp_data(
		    NotAuthorizedException("Log in to get icon", "NO_PERMISSION"))
		return JsonResponse(err, status=403)

	final_comm = []

	try:
		comm_res = Community.objects.filter(name__iexact=query)
		final_comm.extend(comm_res)
		com_res = Community.objects.filter(name__istartswith=query).exclude(
		    name__iexact=query)[:20]
		final_comm.extend(com_res)
		if len(final_comm) <= 20:
			com_res = Community.objects.filter(name__icontains=query).exclude(
			    name__istartswith=query)[:10]
			final_comm.extend(com_res)
		if len(final_comm) <= 20:
			com_res = Community.objects.filter(
			    topic__istartswith=query).exclude(
			        name__istartswith=query).exclude(
			            name__icontains=query)[:10]
			final_comm.extend(com_res)
		resp = success_resp_data(
		    "Communities found",
		    data=[get_comm_data(c, req.user) for c in final_comm])
		return JsonResponse(resp)
	except Community.DoesNotExist:
		resp = success_resp_data("No such community", data=[])
		return JsonResponse(resp, status=404)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def leave_community(req: HttpRequest, c_name: str):
	if not req.user.is_active:
		err = error_resp_data(
		    NotAuthorizedException("Log in to get icon", "NO_PERMISSION"))
		return JsonResponse(err, status=403)

	try:
		com = Community.objects.get(name=c_name)
		if com.moderator.username == req.user.username:
			resp = error_resp_data(
			    NotAuthorizedException("You can't leave your own community"))
			return JsonResponse(resp, status=403)
		com.participants.remove(req.user)
		resp = success_resp_data("Community left successfully")
		return JsonResponse(resp)
	except Community.DoesNotExist:
		resp = error_resp_data(
		    DoesNotExistException(
		        f"Community with name '{c_name}' does not exists.",
		        "COMMUNITY_DOES_NOT_EXIST"))
		return JsonResponse(resp, status=404)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def community_icon(req: HttpRequest, c_name: str):
	logger.debug(c_name)
	if not req.user.is_active:
		err = error_resp_data(
		    NotAuthorizedException("Log in to get icon", "NO_PERMISSION"))
		return JsonResponse(err, status=403)

	try:
		c = Community.objects.get(name=c_name)
		resp = HttpResponse(c.icon_path, content_type='image/png')
		resp['image-found'] = "true"
		return resp
	except Community.DoesNotExist as e:
		resp = error_resp_data(
		    DoesNotExistException(
		        f"Community with name '{c_name}' does not exists.",
		        "COMMUNITY_DOES_NOT_EXIST"))
		return HttpResponse(resp, status=404)
	except ValueError as e:
		resp = redirect("/static/community_icon.svg")
		return resp
	except Exception as e:
		logger.error(e)
		resp = redirect("/static/community_icon.svg")
		return resp


def my_communities(req: HttpRequest):
	if not req.user.is_active:
		err = error_resp_data(
		    NotAuthorizedException("Log in to get my communities",
		                           "NO_PERMISSION"))
		return JsonResponse(err, status=403)

	try:
		comm_raw = Community.objects.filter(participants=req.user)

		communities = []
		for com in comm_raw:
			communities.append(get_comm_data(com, req.user))

		logger.debug(communities)
		resp = success_resp_data("Communities retrieved successfully",
		                         data=communities)
		return JsonResponse(resp)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def participants(req: HttpRequest, c_name: str):
	if not req.user.is_active:
		err = error_resp_data(
		    NotAuthorizedException("Log in to get my communities",
		                           "NO_PERMISSION"))
		return JsonResponse(err, status=403)

	try:
		p_users = Community.objects.get(name=c_name).participants.all()

		resp = success_resp_data("Communities retrieved successfully",
		                         data=[get_user_data(u) for u in p_users])
		return JsonResponse(resp)
	except Community.DoesNotExist:
		resp = error_resp_data(
		    DoesNotExistException("Community does not exists"))
		return JsonResponse(resp, status=404)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def remove_participant(req: HttpRequest, c_name: str):
	if not req.user.is_active:
		err = error_resp_data(
		    NotAuthorizedException("Log in to get my communities",
		                           "NO_PERMISSION"))
		return JsonResponse(err, status=403)

	remove_user = req.GET.get('user')

	if not remove_user:
		resp = error_resp_data(WrongMethodException())
		return JsonResponse(resp, status=400)

	try:
		com = Community.objects.get(name=c_name)
		if com.moderator.id != req.user.id:
			resp = error_resp_data(
			    NotAuthorizedException(
			        "You don't have permission to remove participant",
			        "NO_PERMISSION"))
			return JsonResponse(resp, status=403)
		user_res = com.participants.filter(username=remove_user)
		if not user_res.exists():
			resp = error_resp_data(
			    DoesNotExistException("User does not exists"))
			return JsonResponse(resp, status=404)
		remove_user = user_res[0]
		com.participants.remove(remove_user)
		page = com.participants.all()
		resp = success_resp_data("Participant removed successfully",
		                         data=[get_user_data(p) for p in page])
		return JsonResponse(resp)
	except Community.DoesNotExist:
		resp = error_resp_data(
		    DoesNotExistException("Community does not exists"))
		return JsonResponse(resp, status=404)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)


def comm_posts(req: HttpRequest, c_name: str):
	if not req.user.is_active:
		err = error_resp_data(
		    NotAuthorizedException("Log in to get my communities",
		                           "NO_PERMISSION"))
		return JsonResponse(err, status=403)

	try:
		raw_posts = Posts.objects.filter(
		    community__name=c_name, is_drafted=False,
		    reply_to=None).order_by('created_time').reverse()

		page_no = int(req.GET.get('page', 1))
		pg = Paginator(raw_posts, 15)
		if pg.num_pages < page_no:
			resp = success_resp_data("End of page", "END_OF_PAGE", data=[])
			return JsonResponse(resp)

		pages = pg.page(page_no)
		posts = []

		for p in pages:
			posts.append(get_post_data(p, req.user))

		resp = success_resp_data("Posts retrieved successfully", data=posts)
		return JsonResponse(resp)
	except Community.DoesNotExist:
		resp = error_resp_data(
		    DoesNotExistException("Community does not exists",
		                          "COMMUNITY_DOES_NOT_EXISTS"))
		return resp
	except Exception as e:
		logger.error(e)
		return HttpResponse("Internal server error!", status=500)


def update(req: HttpRequest, c_name: str):
	if not req.user.is_active:
		err = error_resp_data(
		    NotAuthorizedException("Log in to update communities",
		                           "NO_PERMISSION"))
		return JsonResponse(err, status=403)

	new_name = req.POST.get('communityName')

	try:
		com = Community.objects.get(name=c_name)
		if com.moderator.id != req.user.id:
			resp = error_resp_data(
			    NotAuthorizedException(
			        "You don't have permission to update community",
			        "NO_PERMISSION"))
			return JsonResponse(resp, status=403)

		ignore_unique = True		
		if com.name != new_name:
			com.name = new_name
			ignore_unique = False
		com.description = req.POST.get('description')
		com.topic = req.POST.get('topic')
		
		icon = req.FILES.get('communityIcon')

		if icon:
			com.icon_path.delete()
			com.icon_path = icon

		com.validate_community(ignore_unique=ignore_unique)
		com.save()
		resp = success_resp_data("Community updated successfully", data=get_comm_data(com, req.user))
		return JsonResponse(resp)
	except Community.DoesNotExist:
		resp = error_resp_data(
		    DoesNotExistException("Community does not exists"))
		return JsonResponse(resp, status=404)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(ServerException())
		return JsonResponse(resp, status=500)
