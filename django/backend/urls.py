from django.urls import path
from . import views

urlpatterns = [
    path('user/<username>/', views.user_view, name="user"),
    path('', views.index_view, name="index"),
    path('invitation/create/', views.create_invitation, name="invitation_create"),
    path('invitation/dismiss/', views.dismiss_invitation, name="invitation_dismiss"),
    path('invitation/accept/', views.accept_invitation, name="invitation_accept"),
    path('invitation/cancel/', views.cancel_invitation, name="invitation_cancel"),
    path('invitation/uninvited/', views.uninvited_users, name="uninvited_users"),
    path('messages/', views.chat_messages_form, name="chat_messages"),
    path('messages/send/', views.send_message, name="send_message"),
    path('messages/list/', views.list_messages, name="list_messages"),
    path('tournament/<int:tournament_id>/', views.tournament_view, name="tournament"),
    path('tournament/<int:tournament_id>/remove_competitor/', views.tournament_remove_competitor, name="tournament_remove_competitor"),
    path('tournament/<int:tournament_id>/add_competitor/', views.tournament_register_competitor, name="tournament_add_competitor"),
    path('tournament/<int:tournament_id>/start/', views.tournament_start, name="tournament_start"),
    path('tournament/list/', views.tournament_list, name="tournament_list"),
    path('match/mock/', views.mock_match, name="match_mock"),
]
