from django.urls import path
from . import views

urlpatterns = [
    path('user/<username>/', views.user_view, name="user"),
    path('', views.index_view, name="index"),
    path('invitation/create', views.create_invitation, name="invitation_create"),
    path('invitation/dismiss', views.dismiss_invitation, name="invitation_dismiss"),
    path('invitation/accept', views.accept_invitation, name="invitation_accept"),
    path('invitation/cancel', views.cancel_invitation, name="invitation_cancel"),
]
