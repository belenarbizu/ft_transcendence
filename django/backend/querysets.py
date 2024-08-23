from django.db import models
from django.db.models import F

class CustomUserQuerySet(models.QuerySet):

    def uninvited_users(self, user, hint):
        if (hint == ''):
            return self.none()
        else:
            return self.not_me(user) \
                .not_friend_of(user) \
                .not_invitation_from(user) \
                .not_invitation_to(user) \
                .filter(username__startswith = hint)
        
    def not_friend_of(self, user):
        return self.exclude(
            id__in = user.friends.all()
        )
    
    def friend_of(self, user):
        return self.filter(
            id__in = user.friends.all()
        )
    
    def not_invitation_to(self, user):
        return self.exclude(
            id__in = user.invited_users.all()
        )
    
    def not_invitation_from(self, user):
        return self.exclude(
            id__in = user.invited_by.all()
        )

    def not_me(self, user):
        return self.exclude(
            id = user.id
        )
    
    def find_name(self, username):
        return self.filter(username=username)
    
    def looking_for_partner(self, game):
        return self.filter(matchmaking_type = game).without_match()
    
    def in_range(self, game, user, range):
        if (game == "po"):
            elo = user.pong_elo
            return (self.filter(pong_elo__lt = elo + range ) \
                & self.filter(pong_elo__gt = elo - range))
        if (game == "pr"):
            elo = user.pirates_elo
            return (self.filter(pirates_elo__lt = elo + range ) \
                & self.filter(pirates_elo__gt = elo - range))
        return self
    
    def without_match(self):
        return self.filter(matchmaking_match__isnull = True)
    
    def can_match(self, game, user, range):
        return self.in_range(game, user, range).looking_for_partner(game).not_me(user).without_match()

      
class ChatMessageQuerySet(models.QuerySet):

    def to_user(self, user):
        return self.filter(recipient = user.id)
    
    def not_blocked(self):
        return self.exclude(blocked = True)

    def from_user(self, user):
        return self.filter(sender = user.id)
    
    def between(self, user_a, user_b):
        return self.to_user(user_a).from_user(user_b) \
            | self.to_user(user_b).from_user(user_a).not_blocked()
    
    def ordered(self):
        return self.order_by('date')


class MatchQuerySet(models.QuerySet):
    
    def losses_of(self, user, game):
        return self.finished().of_game(game).played_by(user).lost_by(user).count()
    
    def wins_of(self, user, game):
        return self.finished().of_game(game).played_by(user).won_by(user).count()

    def as_home(self, user):
        return self.filter(home__user = user)
    
    def as_guest(self, user):
        return self.filter(guest__user = user)
    
    def played_by(self, user):
        return self.as_home(user) | self.as_guest(user)
    
    def played_by_competitor(self, competitor):
        return self.filter(home = competitor) | self.filter(guest = competitor)

    def won_by(self, user):
        return self.filter(winner__user = user)
    
    def lost_by(self, user):
        return self.exclude(winner__user = user)
    
    def of_game(self, game):
        return self.filter(game = game)
    
    def order_by_state(self):
        return self.order_by('-state')
    
    def not_finished(self):
        return self.exclude(state = "fi")
    
    def finished(self):
        return self.filter(state = "fi")
    
    def waiting(self):
        return self.filter(state = "wa")


class CompetitorQuerySet(models.QuerySet):
    
    def of_user(self, user):
        return self.filter(user = user)
    
    def of_tournament(self, tournament):
        return self.filter(tournament = tournament)
    
    def not_eliminated(self):
        return self.exclude(eliminated = True)
    

class TournamentQuerySet(models.QuerySet):
    
    def ended(self):
        return self.filter(state = 'en')
    
    def started(self):
        return self.filter(state = 'st')
    
    def created(self):
        return self.filter(state = 'cr')
    
    def owned_by(self, user):
        return self.filter(owner = user)
    
    def local(self):
        return self.filter(tournament_mode = "lo")
    
    def remote(self):
        return self.filter(tournament_mode = "re")
    
    def visible_to(self, user):
        return (self.local() & self.owned_by(user)) | self.remote()
    
    def filtered(self, **kwargs):
        return self.filter(state__in = kwargs.keys())
