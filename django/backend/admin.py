from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(CustomUser)
admin.site.register(ChatMessage)
admin.site.register(Match)
admin.site.register(Friend)
admin.site.register(Tournament)
admin.site.register(Competitor)
