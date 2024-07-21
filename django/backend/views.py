from django.shortcuts import render
from .models import CustomUser
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse
from django.urls import reverse
from django.db import models

def index_view(request):
    if request.user.is_authenticated:
        return redirect(reverse("backend:user", kwargs={'username':request.user.username}))
    return 0

def user_view(request, username):
    user = get_object_or_404(CustomUser, username=username)
    data = {
        "user": user,
        "friends": {
            "pending": user.invited_by.all(),
            "invitations": user.invited_users.all(),
            "accepted": user.friend_user.all(),
        },
        "games": []
    }
    return render(request, "backend/index.html", data)

@require_http_methods(["POST"])
def create_invitation(request):
    invited_username = request.POST.get("username", "")
    next = request.POST.get("next", "/")
    print(next)
    try:
        request.user.create_invitation(invited_username)
    except Exception as e:
        return HttpResponse(str(e), status=409)
    return redirect(next)

@require_http_methods(["POST"])
def dismiss_invitation(request):
    invited_username = request.POST.get("username", "")
    next = request.POST.get("next", "/")
    try:
        request.user.dismiss_invitation(invited_username)
    except Exception as e:
        return HttpResponse(str(e), status=409)
    return redirect(next)

@require_http_methods(["POST"])
def accept_invitation(request):
    invited_username = request.POST.get("username", "")
    next = request.POST.get("next", "/")
    try:
        request.user.accept_invitation(invited_username)
    except Exception as e:
        return HttpResponse(str(e), status=409)
    return redirect(next)

@require_http_methods(["POST"])
def cancel_invitation(request):
    invited_username = request.POST.get("username", "")
    next = request.POST.get("next", "/")
    try:
        request.user.cancel_invitation(invited_username)
    except Exception as e:
        return HttpResponse(str(e), status=409)
    return redirect(next)

@require_http_methods(["POST"])
def uninvited_users(request):
    username = request.POST.get('username', '')
    users = CustomUser.objects.filter(username__startswith=username)
    data = {'users': users}
    return render(request, "backend/components/friends/invite_list.html", data)