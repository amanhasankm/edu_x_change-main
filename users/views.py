from django.http import HttpRequest, HttpResponse, JsonResponse
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login
from django.shortcuts import redirect

from .models import Users
from basic.exceptions import *
from basic.utils import *

logger = get_logger(__name__)


# Create your views here.
def signup_user(req: HttpRequest):
	if req.method != "POST":
		resp = error_resp_data(WrongMethodException())
		return JsonResponse(resp, status=400)

	name = req.POST.get("fullName")
	email = req.POST.get("email")
	username = req.POST.get("userName")
	password = req.POST.get("password")

	print(name, email, username, password)

	try:
		u = Users.objects.create_user(username=username,
		                              password=password,
		                              name=name,
		                              email=email)

		au = authenticate(username=username, password=password)
		print(au)
		if au is not None:
			resp = success_resp_data("User created, login to continue")
			return JsonResponse(resp)
		resp = success_resp_data("Authentication error!")
		return JsonResponse(resp)
	except ValidationException as e:
		resp = error_resp_data(e)
		return JsonResponse(resp, status=406)
	except AlreadyExistException as e:
		resp = error_resp_data(e)
		return JsonResponse(resp, status=409)
	except Exception as e:
		resp = error_resp_data(ServerException())
		print(e)
		return JsonResponse(resp, status=500)


def login_user(req: HttpRequest):
	print(req.user)
	if req.method != "POST":
		resp = error_resp_data(WrongMethodException())
		return JsonResponse(resp, status=400)

	username = req.POST.get("userName", None)
	password = req.POST.get("password", None)

	try:
		u = Users.objects.get(username=username)

		print(u)

		au = authenticate(username=username, password=password)

		if au is not None:
			login(req, au)
			# return redirect("/")
			resp = success_resp_data("User logged in successfully")
			return JsonResponse(resp)

		resp = error_resp_data(
		    NotAuthorizedException(
		        "Wrong credentials. Check your username or password and try again."
		    ))
		return JsonResponse(resp, status=401)
	except Users.DoesNotExist:
		resp = error_resp_data(
		    NotAuthorizedException(
		        f"User with username '{username}' does not exist"))
		return JsonResponse(resp, status=401)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(
		    ServerException("Something went wrong. Please try again later."))
		return JsonResponse(resp, status=500)


def update(req: HttpRequest):
	if req.method != "POST":
		resp = error_resp_data(WrongMethodException())
		return JsonResponse(resp, status=400)

	if not req.user.is_active:
		resp = error_resp_data(
		    NotAuthorizedException("Log in to update information"))
		return JsonResponse(resp, status=401)

	name = req.POST.get("fullName")
	email = req.POST.get("email")
	username = req.POST.get("username")
	old_password = req.POST.get("oldPassword")
	new_password = req.POST.get("newPassword")
	avatarId = req.POST.get('avatar')

	try:
		u = Users.objects.get(username=req.user.username)
		u.name = name if name else u.name
		u.email = email if email else u.email
		u.avatar = avatarId if avatarId else u.avatar

		if username and username != req.user.username and u.user_exists(
		    username):
			raise AlreadyExistException(
			    f"User with username '{username}' already exists")
		u.username = username if username else u.username

		if new_password:
			if not is_valid_password(new_password):
				raise ValidationException("Invalid password")

			au = authenticate(username=req.user.username,
			                  password=old_password)
			if not au:
				raise NotAuthorizedException("Wrong password")
			u.password = make_password(new_password, salt=u.username)
		u.save()
		resp = success_resp_data("Information updated successfully",
		                         data=get_user_data(u))
		return JsonResponse(resp)
	except Users.DoesNotExist:
		resp = error_resp_data(NotAuthorizedException("User does not exist"))
		return JsonResponse(resp, status=401)
	except ValidationException as e:
		resp = error_resp_data(e)
		return JsonResponse(resp, status=406)
	except AlreadyExistException as e:
		resp = error_resp_data(e)
		return JsonResponse(resp, status=409)
	except NotAuthorizedException as e:
		resp = error_resp_data(e)
		return JsonResponse(resp, status=401)
	except Exception as e:
		logger.error(e)
		resp = error_resp_data(
		    ServerException("Something went wrong. Please try again later."))
		return JsonResponse(resp, status=500)


def get_user_info(req: HttpRequest):
	if not req.user.is_active:
		return JsonResponse(error_resp_data(
		    NotAuthorizedException("Login to get info")),
		                    status=401)

	u_data = get_user_data(req.user)
	resp = success_resp_data("User data retrieved successfully", data=u_data)
	return JsonResponse(resp)
