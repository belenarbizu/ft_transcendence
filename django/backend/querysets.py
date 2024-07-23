from django.db import models
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

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
    
    def send_message(self, **kwargs):
        if (kwargs['message']):
            self.create(**kwargs).save()
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'user_{kwargs['recipient'].id}',
                {
                    "type": "chat_message",
                    'sender': kwargs['sender'],
                    'message': kwargs['message'],
                }
            )


class MatchQuerySet(models.QuerySet):
    
    def as_home(self, user):
        return self.filter(home = user)
    
    def as_guest(self, user):
        return self.filter(guest = user)
    
    def played_by(self, user):
        return self.as_home(user) | self.as_guest(user)

