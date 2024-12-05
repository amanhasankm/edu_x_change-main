from django.urls import path

from . import views

urlpatterns = [
    path('signup/', views.signup_user),
    path('login/', views.login_user),
    path('update/', views.update),
    path('userinfo/', views.get_user_info)
]
