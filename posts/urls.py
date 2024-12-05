from django.urls import path
from . import views

urlpatterns = [
    path('recent/', views.recent, name="recent"),
    path('save/', views.save),
    path('draft/', views.Draft.as_view(), name="draft"),
    path('draft/<int:p_id>/', views.Draft.as_view(), name="draft_reply"),
    path('delete/<int:p_id>/', views.delete, name="delete"),
    path('savepost/<int:p_id>/', views.save_post),
    path('savedposts/', views.saved_posts),
    path('removesaved/<int:p_id>/', views.remove_saved),
    path('reply/<int:p_id>/', views.Reply.as_view(), name="reply"),
    path('notes/<int:p_id>/<int:f_id>/', views.notes_view),
    path('upvote/<int:p_id>/', views.upvote),
    path('downvote/<int:p_id>/', views.downvote),
    path('image/', views.ImageView.as_view(), name="image_view"),
    path('image/<str:img_name>/',
         views.ImageView.as_view(),
         name="image_get_view")
]
