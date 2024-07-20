from django.contrib import admin
from django.urls import path, include
from django.conf.urls.i18n import i18n_patterns
from django.conf.urls.static import static
from . import settings

urlpatterns = i18n_patterns(
    path('i18n/', include('django.conf.urls.i18n')),
    path("", include(("backend.urls", "backend"), namespace="backend")),
    path('accounts/', include('django.contrib.auth.urls')),
)

urlpatterns += [
    path('polls/', include('polls.urls')),
    path('admin/', admin.site.urls),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)