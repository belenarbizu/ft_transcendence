import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.utils.translation import gettext as _

class LiveUpdateConsumer(WebsocketConsumer):
    
    def connect(self):
        self.group_name = self.scope['url_route']['kwargs']['group_name']
        self.accept()
        print (self.group_name, " connected ")
        self.send(text_data = self.group_name)

class UserConsumer(WebsocketConsumer):

    def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.request_user = self.scope['user']
        self.group_name = f"user_{self.user_id}"
        if self.user_id == str(self.request_user.id):
            async_to_sync(self.channel_layer.group_add)(
                self.group_name, self.channel_name
            )
            async_to_sync(self.channel_layer.group_add)(
                "updates", self.channel_name
            )
            self.accept()
        else:
            self.close()

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name
        )
        async_to_sync(self.channel_layer.group_discard)(
            "updates", self.channel_name
        )
        return super().disconnect(code)

    def chat_message(self, event):
        sender = event["sender"].username
        message = f'{sender} ' + _("sent you a message")
        self.send(text_data=json.dumps({
                "type": "chat_message",
                "message": message,
                "sender": sender
            }))

    def form_update(self, event):
        self.send(text_data=json.dumps({
                "type": "form_update",
                "target": event["target"],
            }))
