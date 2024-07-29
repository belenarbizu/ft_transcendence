import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from django.apps import apps

class LiveUpdateConsumer(WebsocketConsumer):
    
    def connect(self):
        self.group_name = self.scope['url_route']['kwargs']['group_name']
        async_to_sync(self.channel_layer.group_add)(
                self.group_name, self.channel_name
            )
        self.accept()
        self.send(text_data = self.group_name)

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name
        )
        return super().disconnect(code)

    def spa_update(self, event):
        self.send(text_data=json.dumps(event))

    @classmethod
    def notify(cls, group, event):
        layer = get_channel_layer()
        event["type"] = "spa_update"
        async_to_sync(layer.group_send)(
                group, event
            )


class UserConsumer(WebsocketConsumer):

    def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.request_user = self.scope['user']
        self.group_name = f"user_{self.user_id}"
        if self.user_id == str(self.request_user.id):
            async_to_sync(self.channel_layer.group_add)(
                self.group_name, self.channel_name
            )
            self.accept()
            self._set_online_status(True)
        else:
            self.close()

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name
        )
        self._set_online_status(False)
        return super().disconnect(code)

    def chat_message(self, event):
        sender = event["sender"].username
        message = f'{sender} ' + "sent you a message"
        self.send(text_data=json.dumps({
                "type": "chat_message",
                "message": message,
                "sender": sender
            }))
        
    def online_status(self, event):
        self.send(text_data = json.dumps({
            "type": "online_status",
        }))

    def _notify_online_status(self):
        layer = get_channel_layer()
        for friend in self.request_user.friends.all().iterator():
            async_to_sync(layer.group_send)(
                    f"user_{friend.id}", {"type": "online_status"}
                )

    def _set_online_status(self, status):
        CustomUser = apps.get_model("backend", "CustomUser")
        user = CustomUser.objects.get(id = self.user_id)
        user.online = status
        user.save()
        self._notify_online_status()
