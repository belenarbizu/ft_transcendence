from django.urls import path
from . import views

urlpatterns = [
    path('user/<username>/', views.index_view, name="user"),
]
