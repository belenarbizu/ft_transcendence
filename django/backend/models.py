from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext as _


class CustomUser(AbstractUser):

    LANGUAGE_CHOICES = (
        ('es', 'Spanish'),
        ('en', 'English'),
    )

    bio = models.CharField(
        max_length = 500,
        verbose_name = "Bio",
        )
    
    picture = models.ImageField(
        null = True,
        blank = True,
        upload_to = "profile_pictures",
        verbose_name = "Profile picture",
    )

    preferred_language = models.CharField(
        max_length = 20,
        null = True,
        blank = True,
        choices = LANGUAGE_CHOICES,
        verbose_name = "Preferred language",
    )

    blocked_users = models.ManyToManyField(
        "self",
        blank = True,
        related_name = "blocked_by",
        verbose_name = "Blocked users",
        symmetrical = False,
    )

    invited_by = models.ManyToManyField(
        "self",
        blank = True,
        related_name = "invited_users",
        verbose_name = "Invitations",
        symmetrical = False,
    )

    friends = models.ManyToManyField(
        "self",
        verbose_name = "Is friend of",
        through = "Friend",
        symmetrical = True,
    )

    sent_messages = models.ManyToManyField(
        "self",
        verbose_name = "Sent messages",
        related_name = "received_messages",
        through = "ChatMessage",
        symmetrical = False,
    )

    matches = models.ManyToManyField(
        "self",
        verbose_name = "Matches at home",
        related_name = "matches_as_guest",
        through = "Match",
        symmetrical = False,
    )

    def create_invitation(self, invited):
        if self.username == invited:
            raise Exception(_("You cannot invite yourself"))
        if self.invited_by.filter(username = invited).exists():
            raise Exception(_("The user is already invited"))
        if self.invited_users.filter(username = invited).exists():
            raise Exception(_("The user already sent you an invitation"))
        invited_user = CustomUser.objects.filter(username = invited).first()
        if not invited_user:
            raise Exception(_("The user doesn't exist"))
        if self.friends.contains(invited_user):
            raise Exception(_("The user is already your friend"))
        self.invited_by.add(invited_user)
        self.save()

    def dismiss_invitation(self, invited):
        invited_user = CustomUser.objects.filter(username = invited).first()
        if not invited_user:
            raise Exception(_("The user doesn't exist"))
        self.invited_users.remove(invited_user)
        self.save()

    def accept_invitation(self, invited):
        invited_user = CustomUser.objects.filter(username = invited).first()
        if not invited_user:
            raise Exception(_("The user doesn't exist"))
        self.invited_users.remove(invited_user)
        self.friends.add(invited_user)
        self.save()

    def cancel_invitation(self, invited):
        invited_user = CustomUser.objects.filter(username = invited).first()
        if not invited_user:
            raise Exception(_("The user doesn't exist"))
        self.invited_by.remove(invited_user)
        self.save()


class ChatMessage(models.Model):

    message = models.CharField(
        max_length = 500,
        verbose_name = "Message",
    )

    date = models.DateTimeField(
        auto_now = True,
        verbose_name = "Date",
    )


class Match(models.Model):

    STATE_CHOICES = (
        ('pend', 'pending'),
        ('star', 'started'),
        ('fini', 'finished'),
    )

    game = models.TextField(
        max_length = 20,
        verbose_name = "Game name",
    )

    home_score = models.IntegerField(
        default = 0,
        verbose_name = "Score of home player",
    )

    guest_score = models.IntegerField(
        default = 0,
        verbose_name = "Score of guest player",
    )

    winner = models.ForeignKey(
        CustomUser,
        null = True,
        blank = True,
        on_delete = models.CASCADE,
        verbose_name = "Winner of the match",
        related_name = "matches_won",
    )

    state = models.TextField(
        max_length = 4,
        choices = STATE_CHOICES,
        verbose_name = "Match state",
    )


class Friend(models.Model):

    unread_messages = models.IntegerField(
        default = 0,
        verbose_name = "Unread messages",
    )

    user = models.ForeignKey(
        CustomUser,
        on_delete = models.CASCADE,
        related_name = "friend_user",
        verbose_name = "user friend of",
    )

    friend_of = models.ForeignKey(
        CustomUser,
        on_delete = models.CASCADE,
        related_name = "friend_of",
        verbose_name = "fiend of",
    )