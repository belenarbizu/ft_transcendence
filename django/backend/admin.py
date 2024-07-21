from django.contrib import admin
from .models import CustomUser, ChatMessage, Match, Friend

# Register your models here.
admin.site.register(CustomUser)
admin.site.register(ChatMessage)
admin.site.register(Match)
admin.site.register(Friend)