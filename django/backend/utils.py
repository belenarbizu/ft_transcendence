from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def notify_update(group, target):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
            group,
            {
                "type": "spa_update",
                "action": "form_update",
                "target": target,
            }
        )