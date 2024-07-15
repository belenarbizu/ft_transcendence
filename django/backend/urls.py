from django.urls import path
from . import views

urlpatterns = [
    path('user/<username>/', views.user_view, name="user"),
]
