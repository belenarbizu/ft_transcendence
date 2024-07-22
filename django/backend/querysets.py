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

class MatchQuerySet(models.QuerySet):
    
    def as_home(self, user):
        return self.filter(home = user)
    
    def as_guest(self, user):
        return self.filter(guest = user)
    
    def played_by(self, user):
        return self.as_home(user) | self.as_guest(user)
