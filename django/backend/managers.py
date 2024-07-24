from django.db import models
from . import querysets
from django.contrib.auth.models import UserManager
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class CustomUserManager(
    UserManager.from_queryset(querysets.CustomUserQuerySet)):
    pass


class ChatMessageManager(
    models.Manager.from_queryset(querysets.ChatMessageQuerySet)):
    
    def send_message(self, **kwargs):
        if (kwargs['message']):
            self.create(**kwargs).save()
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'user_{kwargs["recipient"].id}',
                {
                    "type": "chat_message",
                    'sender': kwargs['sender'],
                    'message': kwargs['message'],
                }
            )


class MatchManager(
    models.Manager.from_queryset(querysets.MatchQuerySet)):
    pass


class TournamentManager(
    models.Manager.from_queryset(querysets.TournamentQuerySet)):
    pass    


class CompetitorManager(
    models.Manager.from_queryset(querysets.CompetitorQuerySet)):
    pass
