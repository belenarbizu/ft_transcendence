from django.shortcuts import render
from .models import *
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.http import require_http_methods
from django.utils.translation import gettext_lazy as _
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
            "accepted": CustomUser.objects.friend_of(user),
        },
        "games": [],
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
    users = CustomUser.objects.uninvited_users(request.user, username)
    data = {'users': users}
    return render(request, "backend/components/friends/invite_list.html", data)

@require_http_methods(["POST"])
def chat_messages_form(request):
    username = request.POST.get('username', '')
    user = CustomUser.objects.get(username = username)
    data = {
        'messages': ChatMessage.objects.between(user, request.user).ordered(),
        'user': user
        }
    return render(request, "backend/components/chat/chat_form.html", data)

@require_http_methods(["POST"])
def send_message(request):
    user = CustomUser.objects.get(
        username = request.POST.get('username', '')
        )
    ChatMessage.objects.send_message(
        sender = request.user,
        recipient = user,
        message = request.POST.get('message', '')
        )
    data = {
        'messages': ChatMessage.objects.between(user, request.user).ordered(),
        'user': user
        }
    return render(request, "backend/components/chat/chat_form.html", data)

@require_http_methods(["POST"])
def list_messages(request):
    user = CustomUser.objects.get(
        username = request.POST.get('username', '')
        )
    data = {
        'messages': ChatMessage.objects.between(user, request.user).ordered(),
        'user': user
        }
    return render(request, "backend/components/chat/chat_messages.html", data)

@require_http_methods(["GET"])
def tournament_view(request, tournament_id):
    tournament = get_object_or_404(Tournament, id = tournament_id)
    return render(request, "backend/tournament.html", {
        "tournament": tournament
        })

@require_http_methods(["POST"])
def tournament_remove_competitor(request, tournament_id):
    tournament = get_object_or_404(Tournament, id = tournament_id)
    competitor_id = request.POST.get("competitor", "")
    competitor = get_object_or_404(Competitor, id = competitor_id)
    if not tournament.is_created:
        return HttpResponse(_("Competitors can't be removed once the tournament is started"), status=409)
    competitor.delete()
    print ("Removed from tournament ", competitor)
    return render(request, "backend/tournament.html", {
        "tournament": tournament
        })

@require_http_methods(["POST"])
def tournament_register_competitor(request, tournament_id):
    tournament = get_object_or_404(Tournament, id = tournament_id)
    if not tournament.is_created:
        return HttpResponse(_("Competitors can't be added once the tournament is started"), status=409)
    competitor_alias = request.POST.get("alias", "")
    user_id = request.POST.get("user_id", "")
    user = None
    if user_id:
        user = CustomUser.objects.get(id = user_id)
    if tournament.is_practice:
        if competitor_alias == "":
            return HttpResponse(_("You must choose an alias for this tournament"), status=409)
        if competitor_alias in tournament.competitors.values_list('alias', flat = True):
            return HttpResponse(_("The alias is already in use"), status=409)
        competitor = Competitor.objects.create(
            alias = competitor_alias,
            user = request.user,
            tournament = tournament)
        competitor.save()
    return render(request, "backend/tournament.html", {
        "tournament": tournament
    })
