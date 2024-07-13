from django.contrib import admin
from django.urls import path, include
from django.conf.urls.i18n import i18n_patterns

urlpatterns = i18n_patterns(
    path('i18n/', include('django.conf.urls.i18n')),
    path('admin/', admin.site.urls),
    path("", include(("backend.urls", "backend"), namespace="backend")),
)

urlpatterns += [
    path('polls/', include('polls.urls')),
]