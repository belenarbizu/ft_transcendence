from django.shortcuts import render
from .models import *
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.http import require_http_methods
from django.utils.translation import gettext_lazy as _
from django.http import HttpResponse
from django.urls import reverse, reverse_lazy, translate_url
from django.db import models
from django.contrib.auth.decorators import login_required
from django.contrib import auth
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .managers import CustomUserManager
from .forms import RegistrationForm, EditProfileForm
from .consumers import *

def notify_errors(view):
	def decorated_view(*args, **kwargs):
		try:
			return view(*args, **kwargs)
		except Exception as e:
			return HttpResponse(str(e), status=409)
	return decorated_view

def index_view(request):
	if request.user.is_authenticated:
		return redirect(reverse("backend:user",
			kwargs={'username':request.user.username}))
	return 0

@login_required(login_url=reverse_lazy("backend:login_options"))
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
		"is_blocked": user in request.user.blocked_users.all(),
		"online_status": user.see_online_status_as(request.user),
		"can_invite": user in CustomUser.objects.uninvited_users(request.user, user.username),
		"sent_invitation": user in request.user.invited_by.all(),
		"received_invitation": user in request.user.invited_users.all(),
		"form": EditProfileForm(request.POST, instance=request.user),
	}
	return render(request, "backend/index.html", data)

@login_required(login_url=reverse_lazy("backend:login_options"))
@require_http_methods(["POST"])
def user_view_friends(request, username):
	user = get_object_or_404(CustomUser, username=username)
	data = {
		"user": user,
		"friends": {
			"pending": user.invited_by.all(),
			"invitations": user.invited_users.all(),
			"accepted": CustomUser.objects.friend_of(user),
		},
	}
	return render(request, "backend/components/friends/friends.html", data)

@login_required(login_url=reverse_lazy("backend:login_options"))
@require_http_methods(["POST"])
def user_view_info(request, username):
	user = get_object_or_404(CustomUser, username=username)
	data = {
		"user": user,
		"is_blocked": user in request.user.blocked_users.all(),
		"online_status": user.see_online_status_as(request.user),
		"can_invite": user in CustomUser.objects.uninvited_users(request.user, user.username),
		"sent_invitation": user in request.user.invited_by.all(),
		"received_invitation": user in request.user.invited_users.all(),
	}
	return render(request, "backend/components/user_info.html", data)

@require_http_methods(["POST"])
@login_required(login_url=reverse_lazy("backend:login_options"))
def create_invitation(request):
	invited_username = request.POST.get("username", "")
	next = request.POST.get("next", "/")
	try:
		request.user.create_invitation(invited_username)
	except Exception as e:
		return HttpResponse(str(e), status=409)
	return redirect(next)

@require_http_methods(["POST"])
@login_required(login_url=reverse_lazy("backend:login_options"))
@notify_errors
def block_user(request):
	blocked_user = CustomUser.objects.get(
		username = request.POST.get("username", ""))
	request.user.block(blocked_user)

@require_http_methods(["POST"])
@login_required(login_url=reverse_lazy("backend:login_options"))
def dismiss_invitation(request):
	invited_username = request.POST.get("username", "")
	next = request.POST.get("next", "/")
	try:
		request.user.dismiss_invitation(invited_username)
	except Exception as e:
		return HttpResponse(str(e), status=409)
	return redirect(next)

@require_http_methods(["POST"])
@login_required(login_url=reverse_lazy("backend:login_options"))
def accept_invitation(request):
	invited_username = request.POST.get("username", "")
	next = request.POST.get("next", "/")
	try:
		request.user.accept_invitation(invited_username)
	except Exception as e:
		return HttpResponse(str(e), status=409)
	return redirect(next)

@require_http_methods(["POST"])
@login_required(login_url=reverse_lazy("backend:login_options"))
def cancel_invitation(request):
	invited_username = request.POST.get("username", "")
	next = request.POST.get("next", "/")
	try:
		request.user.cancel_invitation(invited_username)
	except Exception as e:
		return HttpResponse(str(e), status=409)
	return redirect(next)

@require_http_methods(["POST"])
@login_required(login_url=reverse_lazy("backend:login_options"))
def uninvited_users(request):
	username = request.POST.get('username', '')
	users = CustomUser.objects.uninvited_users(request.user, username)
	data = {'users': users}
	return render(request, "backend/components/friends/invite_list.html", data)

@require_http_methods(["POST"])
@login_required(login_url=reverse_lazy("backend:login_options"))
def chat_messages_form(request):
	username = request.POST.get('username', '')
	user = CustomUser.objects.get(username = username)
	data = {
		'messages': ChatMessage.objects.between(user, request.user).ordered(),
		'user': user,
		"online_status": user.see_online_status_as(request.user),
		}
	return render(request, "backend/components/chat/chat_form.html", data)

@require_http_methods(["POST"])
@login_required(login_url=reverse_lazy("backend:login_options"))
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
		'user': user,
		"online_status": user.see_online_status_as(request.user),
		}
	return render(request, "backend/components/chat/chat_messages.html", data)

@require_http_methods(["POST"])
@login_required(login_url=reverse_lazy("backend:login_options"))
def list_messages(request):
	user = CustomUser.objects.get(
		username = request.POST.get('username', '')
		)
	data = {
		'messages': ChatMessage.objects.between(user, request.user).ordered(),
		'user': user,
		"online_status": user.see_online_status_as(request.user),
		}
	return render(request, "backend/components/chat/chat_messages.html", data)

@login_required(login_url=reverse_lazy("backend:login_options"))
@require_http_methods(["GET"])
def tournament_view(request, tournament_id):
	try:
		tournament = Tournament.objects.get(id = tournament_id)
	except Exception as e:
		return redirect(reverse("backend:tournament_list", kwargs={}))
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
def tournament_disqualify_competitor(request, tournament_id):
	try:
		comp = Competitor.objects.get(id = request.POST.get("competitor", ""))
		comp.disqualify()
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
@require_http_methods(["POST"])
def tournament_remove(request, tournament_id):
	try:
		tournament = Tournament.objects.get(id = tournament_id)
		if not request.user == tournament.owner:
			raise Exception ("Only the owner can remove tournaments.")
		tournament.delete()
		LiveUpdateConsumer.update_forms("tournament_list", "#tournament_list_update")
		LiveUpdateConsumer.reload_page(f"tournament_{tournament_id}")
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

@login_required(login_url=reverse_lazy("backend:login_options"))
def logout(request):
	auth.logout(request)
	return redirect(reverse("backend:login_options"))

@require_http_methods(["GET", "POST"])
def login(request):
	if request.method == "POST":
		username = request.POST.get("username", "")
		password = request.POST.get("password", "")
		user = auth.authenticate(request, username=username, password=password)
		if user is not None:
			auth.login(request, user)
			language = user.preferred_language
			if not language:
				language = "es"
			return redirect(translate_url(reverse("backend:user", kwargs={"username": user.username}), language))
		else:
			return render(request, "backend/login.html", {
				"error": _("Authentication failed"),
			})
	if request.method == "GET":
		return render(request, "backend/login.html", {})

@require_http_methods(["GET"])
def login_options(request):
	return render(request, "backend/login_options.html", {})

@require_http_methods(["POST", "GET"])
def register_view(request):
	form = RegistrationForm()
	if request.method == 'POST':
		form = RegistrationForm(request.POST)
		if form.is_valid():
			form.save()
			return redirect(reverse('backend:login_options'))
	return render(request, 'backend/signup.html', {"form": form})

def three_demo(request):
	return render(request, 'backend/three.html', {})

@require_http_methods(["POST"])
@notify_errors
def edit_profile(request):
	next = request.POST.get("next", "/")
	form = EditProfileForm(request.POST, request.FILES)
	print(request.POST.get("preferred_language"))
	if form.is_valid():
		if form.cleaned_data["bio"] != None:
			request.user.bio = form.cleaned_data["bio"]
		if form.cleaned_data["preferred_language"] != None:
			request.user.preferred_language = form.cleaned_data["preferred_language"]
		if form.cleaned_data["picture"] != None:
			request.user.picture = form.cleaned_data["picture"]
		request.user.save()
		return redirect(reverse('backend:user', kwargs={"username":request.user.username}))
	raise Exception(_("Bad form"))

@login_required(login_url=reverse_lazy("backend:login_options"))
def game_view(request, game_id):
	game = Match.objects.get(id = int(game_id))
	reason = game.reason_user_cannot_join(request.user)
	if (reason):
		return render(request, 'backend/error.html', {"reason": reason})
	return render(request, 'backend/game.html', {"match": game})

@require_http_methods(["POST"])
@login_required(login_url=reverse_lazy("backend:login_options"))
def create_match(request):
	user_id = int(request.POST.get("user_id"))
	user = CustomUser.objects.get(id=user_id)
	game = request.POST.get("game")
	home_competitor = Competitor.objects.create(user=request.user)
	guest_competitor = Competitor.objects.create(user=user)
	match = Match.objects.create(mode="re",
		game=game, home=home_competitor, guest=guest_competitor)
	ChatMessage.objects.send_message(
		sender=request.user, recipient=user, match=match, message="new match")
	data = {
		'messages': ChatMessage.objects.between(user, request.user).ordered(),
		'user': user,
		"online_status": user.see_online_status_as(request.user),
		}
	return render(request, "backend/components/chat/chat_messages.html", data)

@require_http_methods(["POST"])
@login_required(login_url=reverse_lazy("backend:login_options"))
def remove_match(request):
	match_id = request.POST.get("match_id")
	Match.objects.get(id=match_id).delete()
	return HttpResponse("", status=204)
