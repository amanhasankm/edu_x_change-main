from django.shortcuts import render, redirect
from django.http import HttpRequest, HttpResponse
from django.middleware.csrf import get_token
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.conf import settings
import json

from posts.models import Posts

from .utils import get_user_data, get_post_data, get_logger

logger = get_logger(__name__)

@login_required
def home(req: HttpRequest):
	u_data = json.dumps(get_user_data(req.user))
	get_token(req)
	return render(req, "home/index.html", {'user_data': u_data})


def login(req: HttpRequest):
	get_token(req)
	# if req.user.is_active:
	# 	return redirect("/")
	return render(req, "login/index.html")


def logout_user(req: HttpRequest):
	logout(req)
	return redirect('/login/')


@login_required
def profile(req: HttpRequest):
	get_token(req)
	u_data = json.dumps(get_user_data(req.user))
	return render(req, "profile/index.html", {'user_data': u_data})


@login_required
def post(req: HttpRequest):
	u_data = json.dumps(get_user_data(req.user))
	return render(req, "post/index.html", {'user_data': u_data})


@login_required
def post_page(req: HttpRequest, p_id: int):
	try:
		p_data = get_post_data(
		    Posts.objects.get(id=p_id, is_drafted=False, reply_to=None),
		    req.user)
		u_data = json.dumps(get_user_data(req.user))
		p_data = json.dumps(p_data)
		get_token(req)
		return render(req, "p/index.html", {
		    'user_data': u_data,
		    'post_data': p_data
		})
	except Posts.DoesNotExist:
		return redirect('/404/', status=404)
	except Exception as e:
		logger.error(e)
		return HttpResponse("Internal server error!", status=500)


@login_required
def saved_posts(req: HttpRequest):
	u_data = json.dumps(get_user_data(req.user))
	return render(req, "saved/index.html", {'user_data': u_data})


@login_required
def not_found(req: HttpRequest):
	u_data = json.dumps(get_user_data(req.user))
	return render(req, "404.html", {'user_data': u_data})


def favicon(req: HttpRequest):
	with open(f'{settings.STATIC_ROOT}/EXC.svg') as f:
		return HttpResponse(f.read(),
		                    content_type="image/svg+xml; charset=utf-8")
	return HttpResponse("")
