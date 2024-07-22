from django.db import models
from . import querysets
from django.contrib.auth.models import UserManager

class CustomUserManager(
    UserManager.from_queryset(querysets.CustomUserQuerySet)):
    pass


class ChatMessageManager(
    models.Manager.from_queryset(querysets.ChatMessageQuerySet)):
    pass


class MatchManager(models.Manager.from_queryset(querysets.MatchQuerySet)):
    pass
