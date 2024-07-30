from django.shortcuts import render
from .models import *
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.http import require_http_methods
from django.utils.translation import gettext_lazy as _
from django.http import HttpResponse
from django.urls import reverse, reverse_lazy
from django.db import models
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

def index_view(request):
    if request.user.is_authenticated:
        return redirect(reverse("backend:user",
            kwargs={'username':request.user.username}))
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
    return render(request, "backend/components/chat/chat_messages.html", data)

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

@login_required(login_url=reverse_lazy("backend:login_options"))
@require_http_methods(["GET"])
def tournament_view(request, tournament_id):
    tournament = get_object_or_404(Tournament, id = tournament_id)
    return render(request, "backend/tournament.html", {
        "tournament": tournament,
        "rounds": reversed(range(1, tournament.round+1)),
        "competitor": Competitor.objects.of_tournament(
            tournament).of_user(request.user).first()
        })


@login_required(login_url=reverse_lazy("backend:login_options"))
@require_http_methods(["POST"])
def tournament_competitors(request, tournament_id):
    tournament = get_object_or_404(Tournament, id = tournament_id)
    return render(request, "backend/components/tournament/competitor_list.html",{
        "tournament": tournament,
    })

@login_required(login_url=reverse_lazy("backend:login_options"))
@require_http_methods(["POST"])
def tournament_remove_competitor(request, tournament_id):
    try:
        Competitor.objects.remove_competitor(request.POST.get("competitor", ""))
    except Exception as e:
        return HttpResponse(str(e), status=409)
    return redirect(reverse("backend:tournament",
        kwargs={'tournament_id':tournament_id}))

@login_required(login_url=reverse_lazy("backend:login_options"))
@require_http_methods(["POST"])
def tournament_register_competitor(request, tournament_id):
    tournament = get_object_or_404(Tournament, id = tournament_id)
    try:
        Competitor.objects.register_competitor(
            tournament, request.user, request.POST.get("alias", ""))
    except Exception as e:
        return HttpResponse(str(e), status=409)
    return redirect(reverse("backend:tournament",
        kwargs={'tournament_id':tournament_id}))

@login_required(login_url=reverse_lazy("backend:login_options"))
@require_http_methods(["POST"])
def tournament_start(request, tournament_id):
    try:
        Tournament.objects.start_tournament(tournament_id, request.user)
    except Exception as e:
        return HttpResponse(str(e), status=409)
    return redirect(reverse("backend:tournament",
        kwargs={'tournament_id':tournament_id}))

@login_required(login_url=reverse_lazy("backend:login_options"))
@require_http_methods(["GET"])
def tournament_list(request):
    data = {
        "tournaments": Tournament.objects.visible_to(request.user).filtered(cr = 'on'),
        "game_options": Tournament._meta.get_field("game").choices,
        "mode_options": Tournament._meta.get_field("tournament_mode").choices,
    }
    if (request.method == "GET"):
        return render(request, "backend/tournament_list.html", data)

@login_required(login_url=reverse_lazy("backend:login_options"))
@require_http_methods(["POST"])
def tournament_create(request):
    tournament = Tournament.objects.create(
        owner = request.user,
        name = request.POST["name"],
        description = request.POST["description"],
        game = request.POST["game"],
        tournament_mode = request.POST["tournament_mode"],
    )
    print(tournament)
    return redirect(reverse("backend:tournament",
                            kwargs = {"tournament_id": tournament.id}))

@login_required(login_url=reverse_lazy("backend:login_options"))
@require_http_methods(["POST"])
def tournament_list_update(request):
    data = {
        "tournaments": Tournament.objects.visible_to(request.user).filtered(**request.POST),
    }
    return render(request, "backend/components/tournament/tournament_list.html", data)

# This view is for development purposes
@require_http_methods(["POST"])
def mock_match(request):
    import random
    match = get_object_or_404(Match, id = request.POST.get("match_id"))
    match.winner = random.choice([match.home, match.guest])
    match.home_score = random.randint(0, 4)
    match.guest_score = random.randint(0, 4)
    if match.winner == match.guest:
        match.guest_score = 5
        match.home.eliminated = True
        match.home.save()
    else:
        match.home_score = 5
        match.guest.eliminated = True
        match.guest.save()
    match.state = "fi"
    match.save()
    Match.objects.update_ELO(match)
    Tournament.objects.new_round(match.tournament)
    return redirect(reverse("backend:tournament",
        kwargs={'tournament_id':match.tournament.id}))

def logout(request):
    return redirect(reverse("login"))

#borrar csrf!!!
@csrf_exempt
def login_options(request):
    data = {}
    return render(request, "backend/login_options.html", data)

def signup_view(request):
    data = {}
    return render(request, "backend/signup.html", data)

@require_http_methods(["GET", "POST"])
def signup(request):

    if request.method == "GET":

        # Aqui tenemos que renderizar el formulario vacio
        pass

    elif request.method == "POST":

        # Como sabemos que el metodo es pos, entonces podemos acceder a los parametros
        # del formulario:

        print(request.POST)

        data = {
            'username': "yo",
            "password": "mi pass",
            "next": request.POST.get("next"),
            "language": "en",
            "error": "Me pareces muy feo"
        }

        return render(request, "backend/signup.html", data)

        # Aqui hay dos opciones. 
        # Validas los datos y todo ha ido bien:
        #return redirect(...) # la url del login

        # Si algo ha fallado, tienes que renderizar la plantilla, con los datos que 
        # has recibido por post, y un mensaje indicando el error.




    data = {}
    username = request.POST.get('username')
    passwd = request.POST.get('password')
    try:
        user = CustomUser.objects.register_user(username, passwd)
        user.save()
        return render(request, "backend/signup.html", data)
    except Exception as e:
        return JsonResponse({"Error": str(e)}, status=400)
