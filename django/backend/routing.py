# chat/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/user/(?P<user_id>\w+)/$", consumers.UserConsumer.as_asgi()),
    re_path(r"ws/game/(?P<game_id>\w+)/$", consumers.GameConsumer.as_asgi()),
    re_path(r"ws/matchmaking/$", consumers.MatchmakingConsumer.as_asgi()),
    re_path(r"ws/live/(?P<group_name>[\w\-]+)/$", consumers.LiveUpdateConsumer.as_asgi()),
]