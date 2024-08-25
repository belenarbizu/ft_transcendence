import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from django.apps import apps
from django.utils import translation

class LiveUpdateConsumer(WebsocketConsumer):
    
    def connect(self):
        self.group_name = self.scope['url_route']['kwargs']['group_name']
        async_to_sync(self.channel_layer.group_add)(
                self.group_name, self.channel_name
            )
        self.accept()

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name
        )
        return super().disconnect(code)

    def spa_update(self, event):
        try:
            language = self.scope["cookies"]["django_language"]
            if event["action"] == "notification":
                message = ""
                with translation.override(language):
                    for msg in event["message"]:
                        message += " " + translation.gettext(msg)
                event["message"] = message
        except:
            pass
        self.send(text_data=json.dumps(event))
        
    @classmethod
    def update_forms(cls, groups, targets):
        if isinstance(groups, str):
            groups = [groups]
        if isinstance(targets, str):
            targets = [targets]
        layer = get_channel_layer()
        event = {
            "type": "spa_update",
            "action": "form_update",
        }
        for group in groups:
            for target in targets:
                event["target"] = target
                async_to_sync(layer.group_send)(group, event)
        
    @classmethod
    def send_notification(cls, groups, message):
        if isinstance(groups, str):
            groups = [groups]
        layer = get_channel_layer()
        event = {
            "type": "spa_update",
            "action": "notification",
        }
        for group in groups:
            event["message"] = message
            async_to_sync(layer.group_send)(group, event)

    @classmethod
    def reload_page(cls, groups):
        if isinstance(groups, str):
            groups = [groups]
        layer = get_channel_layer()
        event = {
            "type": "spa_update",
            "action": "page_reload",
        }
        for group in groups:
            async_to_sync(layer.group_send)(group, event)


class UserConsumer(LiveUpdateConsumer):

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

    def _notify_online_status(self):
        LiveUpdateConsumer.update_forms(
            [f"user_{friend.id}" 
            for friend in self.request_user.friends.all().iterator()],
            ["#chat-refresh", "#user-friends-refresh", "#user-info-refresh"]
        )

    def _set_online_status(self, status):
        CustomUser = apps.get_model("backend", "CustomUser")
        user = CustomUser.objects.get(id = self.user_id)
        if status == True:
            user.online += 1
        else:
            user.online -= 1
        if user.online < 0:
            user.online = 0
        user.save()
        self._notify_online_status()

class GameConsumer(WebsocketConsumer):

    def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.user = self.scope['user']
        Match = apps.get_model("backend", "Match")
        self.game = Match.objects.get(id = self.game_id)
        self.players = []
        if self.game.home.user == self.user:
            self.players.append("home")
        if self.game.guest.user == self.user:
            self.players.append("guest")
        self.group_name = f"game_{self.game_id}"
        async_to_sync(self.channel_layer.group_add)(
            self.group_name, self.channel_name)
        self.accept()
        reason = self.game.reason_user_cannot_join(self.user)
        if (reason != False):
            self.close()
            return
        self.game.join(self.user)
    
    def disconnect(self, code):
        self.game.refresh_from_db()
        self.game.leave(self.user)
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name)
        return super().disconnect(code)

    def receive(self, text_data):
        d = json.loads(text_data)
        if self.game.is_started:
            if d["type"] == "start":
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name, {'type':'forward', 'data': text_data})
            elif d["type"] == "end":
                self.game.refresh_from_db()
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name, {'type':'forward', 'data': text_data})
                self.game.end(d["winner"])
            elif "player" in d and d["player"] in self.players:
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name, {'type':'forward', 'data': text_data})
                if d["type"] == "goal":
                    self.game.refresh_from_db()
                    if d["player"] == "home":
                        self.game.guest_score += 1
                    if d["player"] == "guest":
                        self.game.home_score += 1
                    self.game.save()

    def forward(self, event):
        self.send(event['data'])

    def ready(self, event):
        self.game.refresh_from_db()
        self.send(json.dumps(event))


class MatchmakingConsumer(WebsocketConsumer):

    def connect(self):
        user = self.scope['user']
        CustomUser = apps.get_model("backend", "CustomUser")
        if user.is_authenticated:
            self.user = CustomUser.objects.get(id = user.id)
            self.accept()
        else:
            self.close()
    
    def disconnect(self, code):
        self.user.matchmaking_type = None
        self.user.save()
        return super().disconnect(code)
