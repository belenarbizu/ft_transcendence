from django.db import models

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

      
class ChatMessageQuerySet(models.QuerySet):

    def to_user(self, user):
        return self.filter(recipient = user.id)
    
    def from_user(self, user):
        return self.filter(sender = user.id)
    
    def between(self, user_a, user_b):
        return self.to_user(user_a).from_user(user_b) \
            | self.to_user(user_b).from_user(user_a)
    
    def ordered(self):
        return self.order_by('date')


class MatchQuerySet(models.QuerySet):
    
    def as_home(self, user):
        return self.filter(home = user)
    
    def as_guest(self, user):
        return self.filter(guest = user)
    
    def played_by(self, user):
        return self.as_home(user) | self.as_guest(user)
    
    def order_by_state(self):
        return self.order_by('-state')
    
    def not_finished(self):
        return self.exclude(state = "fi")


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
