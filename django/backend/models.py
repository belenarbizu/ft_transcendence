from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.templatetags.static import static
from . import managers
from .consumers import *
import random

GAME_MODE_CHOICES = (
    ("lo", _("Practice (private)")),
    ("re", _("Competition (public)"))
)

GAME_STATE_CHOICES = (
    ('wa', _('Waiting')),
    ('st', _('Started')),
    ('fi', _('Finished')),
)

TOURNAMENT_STATE_CHOICES = (
    ("cr", _("Open to new competitors")),
    ("st", _("The tournament is being played")),
    ("fi", _("The tournamen ended"))
)

GAME_CHOICES = (
    ("po", _("Pong")),
    ("pr", _("Pirates Revenge"))
)

LANGUAGE_CHOICES = (
    ('es', _('Spanish')),
    ('en', _('English')),
)

class CustomUser(AbstractUser):

    objects = managers.CustomUserManager()

    online = models.IntegerField(
        default = 0,
        verbose_name = _("Online status")
    )

    bio = models.CharField(
        max_length = 500,
        verbose_name = "Bio",
        null = True,
        blank = True,
        )

    picture = models.ImageField(
        null = True,
        blank = True,
        upload_to = "profile_pictures",
        verbose_name = _("Profile picture"),
    )

    preferred_language = models.CharField(
        max_length = 20,
        null = True,
        blank = True,
        choices = LANGUAGE_CHOICES,
        verbose_name = _("Preferred language"),
    )

    blocked_users = models.ManyToManyField(
        "self",
        blank = True,
        related_name = "blocked_by",
        verbose_name = _("Blocked users"),
        symmetrical = False,
    )

    invited_by = models.ManyToManyField(
        "self",
        blank = True,
        related_name = "invited_users",
        verbose_name = _("Invitations"),
        symmetrical = False,
    )

    friends = models.ManyToManyField(
        "self",
        verbose_name = _("Is friend of"),
        through = "Friend",
        symmetrical = True,
    )

    sent_messages = models.ManyToManyField(
        "self",
        verbose_name = _("Sent messages"),
        related_name = "received_messages",
        through = "ChatMessage",
        symmetrical = False,
    )

    pong_elo = models.IntegerField(
        default = 0,
        verbose_name = _("Pong ELO"),
    )

    pirates_elo = models.IntegerField(
        default = 0,
        verbose_name = _("Pirates Revenge ELO"),
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
        LiveUpdateConsumer.update_forms(
            f"user_{invited_user.id}",
            ["#user-friends-refresh", "#user-info-refresh"]
        )
        LiveUpdateConsumer.send_notification(
            f"user_{invited_user.id}",
            self.username + " " + _("sent you a friend request")
        )

    def dismiss_invitation(self, invited):
        invited_user = CustomUser.objects.filter(username = invited).first()
        if not invited_user:
            raise Exception(_("The user doesn't exist"))
        self.invited_users.remove(invited_user)
        self.save()
        LiveUpdateConsumer.update_forms(
            f"user_{invited_user.id}",
            ["#user-friends-refresh", "#user-info-refresh"]
        )

    def accept_invitation(self, invited):
        invited_user = CustomUser.objects.filter(username = invited).first()
        if not invited_user:
            raise Exception(_("The user doesn't exist"))
        self.invited_users.remove(invited_user)
        self.friends.add(invited_user)
        self.save()
        LiveUpdateConsumer.update_forms(
            f"user_{invited_user.id}",
            ["#user-friends-refresh", "#user-info-refresh"]
        )
        LiveUpdateConsumer.send_notification(
            f"user_{invited_user.id}",
            self.username + " " + _("accepted your friend request")
        )

    def cancel_invitation(self, invited):
        invited_user = CustomUser.objects.filter(username = invited).first()
        if not invited_user:
            raise Exception(_("The user doesn't exist"))
        self.invited_by.remove(invited_user)
        self.save()
        LiveUpdateConsumer.update_forms(
            f"user_{invited_user.id}",
            ["#user-friends-refresh", "#user-info-refresh"]
        )

    def see_online_status_as(self, user):
        return self.online and not user in self.blocked_users.all()

    def block(self, user):
        if user in self.blocked_users.all():
            self.blocked_users.remove(user)
            blocked = False
        else:
            self.blocked_users.add(user)
            blocked = True
        LiveUpdateConsumer.update_forms(
            [f"user_{self.id}", f"user_{user.id}"],
            [f"#chat-refresh", "#user-friends-refresh", "#user-info-refresh"]
                )
        if blocked:
            raise Exception(_("You blocked ") + user.username)
        raise Exception(_("You unblocked ") + user.username)

    @property
    def get_profile_picture(self):
        if self.user.picture:
            return self.user.picture.url
        return static('backend/images/profile.png')


class ChatMessage(models.Model):

    objects = managers.ChatMessageManager()

    sender = models.ForeignKey(
        CustomUser,
        on_delete = models.CASCADE,
        related_name = "messages_sent",
        verbose_name = _("Sender"),
    )

    recipient = models.ForeignKey(
        CustomUser,
        on_delete = models.CASCADE,
        related_name = "messages_received",
        verbose_name = _("Recipient"),
    )

    message = models.CharField(
        max_length = 500,
        verbose_name = _("Message"),
    )

    match = models.ForeignKey(
        'Match',
        null = True,
        blank = True,
        on_delete = models.CASCADE,
        verbose_name = _("Game notification"),
        related_name = "notified_in_messages",
    )

    date = models.DateTimeField(
        auto_now = True,
        verbose_name = _("Date"),
    )

    blocked = models.BooleanField(
        default = False,
        verbose_name = _("Blocked message")
    )


class Match(models.Model):

    objects = managers.MatchManager()

    mode = models.CharField(
        max_length = 2,
        choices = GAME_MODE_CHOICES,
        verbose_name = _("Game mode"),
    )

    home = models.ForeignKey(
        "Competitor",
        on_delete = models.CASCADE,
        related_name = "home_matches",
        verbose_name = _("Home player"),
    )

    guest = models.ForeignKey(
        "Competitor",
        on_delete = models.CASCADE,
        related_name = "guest_matches",
        verbose_name = _("Guest player"),
    )

    game = models.TextField(
        max_length = 2,
        verbose_name = _("Game type"),
        choices = GAME_CHOICES,
    )

    home_score = models.IntegerField(
        default = 0,
        verbose_name = _("Score of home player"),
    )

    guest_score = models.IntegerField(
        default = 0,
        verbose_name = _("Score of guest player"),
    )

    elo = models.IntegerField(
        default = 0,
        verbose_name = "ELO",
    )

    winner = models.ForeignKey(
        "Competitor",
        null = True,
        blank = True,
        on_delete = models.CASCADE,
        verbose_name = _("Winner of the match"),
        related_name = "matches_won",
    )

    state = models.TextField(
        max_length = 2,
        choices = GAME_STATE_CHOICES,
        default = "wa",
        verbose_name = _("Match state"),
    )

    tournament = models.ForeignKey(
        "Tournament",
        null = True,
        blank = True,
        verbose_name = _("Tournament"),
        related_name = "matches",
        on_delete = models.CASCADE,
    )

    tournament_round = models.IntegerField(
        default = 0,
        verbose_name = _("Tournament round"),
    )

    home_ready = models.BooleanField(
        default = False,
        verbose_name=_("Home player joined the match")
    )

    guest_ready = models.BooleanField(
        default = False,
        verbose_name=_("Guest player joined the match")
    )

    @property
    def is_practice(self):
        return self.mode == "pr"
    
    @property
    def is_single_game(self):
        return self.tournament == None
    
    @property
    def is_waiting(self):
        return self.state == "wa"
    
    @property
    def is_started(self):
        return self.state == "st"
    
    @property
    def is_finished(self):
        return self.state == "fi"
    
    def win(self, competitor):
        if self.is_finished:
            return
        self.winner = competitor
        self.state = "fi"
        self.save()
        layer = get_channel_layer()
        if competitor == self.home:
            self.guest.eliminated = True
            self.guest.save()
            async_to_sync(layer.group_send)(
                f"game_{self.id}", {
                    "type": "forward",
                    "data":json.dumps({"type": "end", "winner": "home"})
                    })
        else:
            self.home.eliminated = True
            self.home.save()
            async_to_sync(layer.group_send)(
                f"game_{self.id}", {
                    "type": "forward",
                    "data":json.dumps({"type": "end", "winner": "guest"})
                    })
        if self.tournament:
            Tournament.objects.new_round(self.tournament)

    def lose(self, competitor):
        if self.home == competitor:
            self.win(self.guest)
        else:
            self.win(self.home)

    def end(self, player):
        if player == "home":
            self.win(self.home)
        else:
            self.win(self.guest)

    def reason_user_cannot_join(self, user):
        if not user == self.home.user and not user == self.guest.user:
            return _("Only players can join this match")
        if not self.is_waiting:
            return _("You can't join a match that already started")
        if user == self.home.user and self.home_ready:
            return _("You already joined this match")
        if user == self.guest.user and self.guest_ready:
            return _("You already joined this match")
        return False
    
    def try_start(self):
        if (not self.is_practice and self.home_ready and self.guest_ready) \
            or (self.is_practice and (self.home_ready or self.guest_ready)):
            self.state = "st"
            layer = get_channel_layer()
            async_to_sync(layer.group_send)(
                f"game_{self.id}", {"type": "ready"})
        self.save()

    def join(self, user):
        if self.home.user == user:
            self.home_ready = True
        if self.guest.user == user:
            self.guest_ready = True
        self.try_start()
        self.save()

    def leave(self, user):
        if self.is_started:
            if self.home.user == user:
                self.lose(self.home)
            if self.guest.user == user:
                self.lose(self.guest)
        if self.is_waiting:
            if self.home.user == user:
                self.home_ready = False
            if self.guest.user == user:
                self.guest_ready = False
        self.save()


class Friend(models.Model):

    unread_messages = models.IntegerField(
        default = 0,
        verbose_name = _("Unread messages"),
    )

    user = models.ForeignKey(
        CustomUser,
        on_delete = models.CASCADE,
        related_name = "friend_user",
        verbose_name = _("user friend of"),
    )

    friend_of = models.ForeignKey(
        CustomUser,
        on_delete = models.CASCADE,
        related_name = "friend_of",
        verbose_name = _("fiend of"),
    )


class Competitor(models.Model):

    objects = managers.CompetitorManager()

    user = models.ForeignKey(
        "CustomUser",
        on_delete = models.CASCADE,
        null = True,
        blank = True,
        related_name = "competes_in",
        verbose_name = _("Competitor"),
    )

    alias = models.CharField(
        max_length = 50,
        null = True,
        blank = True,
        verbose_name = _("Alias"),
    )

    picture = models.ImageField(
        null = True,
        blank = True,
        upload_to = "profile_pictures",
        verbose_name = _("Profile picture"),
    )

    eliminated = models.BooleanField(
        default = False,
        verbose_name = _("The competitor was eliminated"),
    )

    tournament = models.ForeignKey(
        "Tournament",
        on_delete = models.CASCADE,
        null = True,
        blank = True,
        related_name = "competitors",
        verbose_name = _("Tournament"),
    )

    @property
    def is_single_game(self):
        return self.tournament == None
    
    @property
    def is_practice(self):
        return self.tournament and self.tournament.is_practice
    
    @property
    def get_display_name(self):
        if self.alias:
            return self.alias
        if self.user:
            return self.user.username
        return "Unnamed user"
    
    @property
    def get_profile_picture(self):
        if self.is_practice:
            return self.picture.url
        elif self.user and self.user.picture:
            return self.user.picture.url
        
    def disqualify(self):
        for match in Match.objects.played_by(self).not_finished():
            match.lose(self)
        self.eliminated = True


class Tournament(models.Model):

    objects = managers.TournamentManager()

    name = models.CharField(
        max_length=120,
        verbose_name = _("Name of the tournament"),
    )

    description = models.CharField(
        max_length = 500,
        verbose_name = _("Description of the tournament"),
    )

    owner = models.ForeignKey(
        "CustomUser",
        on_delete = models.CASCADE,
        related_name = "tournaments",
        verbose_name = _("Owner of the tournament"),
    )

    tournament_mode = models.CharField(
        max_length = 2,
        verbose_name = _("Mode of the tournament"),
        choices = GAME_MODE_CHOICES,
        default = "pr",
    )

    state = models.CharField(
        max_length = 2,
        verbose_name = _("State of the tournament"),
        choices = TOURNAMENT_STATE_CHOICES,
        default = "cr",
    )

    round = models.IntegerField(
        default = 0,
        verbose_name = _("Round"),
    )

    game = models.CharField(
        max_length = 2,
        verbose_name = _("Game"),
        choices = GAME_CHOICES,
        default = "po",
    )

    winner = models.ForeignKey(
        "Competitor",
        on_delete = models.CASCADE,
        related_name = "tournaments_won",
        verbose_name = _("Competitors"),
        null = True,
        blank = True,
    )

    @property
    def is_practice(self):
        return self.tournament_mode == "lo"

    @property
    def is_created(self):
        return self.state == "cr"

    @property
    def is_started(self):
        return self.state == "st"
    
    @property
    def is_finished(self):
        return self.state == "fi"
