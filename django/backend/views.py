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
from .exceptions import Notification
import os
import requests
import transcendence.settings as settings

def notifier(view):
	def decorated_view(*args, **kwargs):
		try:
			return view(*args, **kwargs)
		except Notification as e:
			return HttpResponse(str(e), status=299)
	return decorated_view

def login_401(view):
	@require_http_methods(["POST"])
	def decorated_view(request, *args, **kwargs):
		if not request.user.is_authenticated:
			return HttpResponse("Login required.", status=401)
		return view(request, *args, **kwargs)
	return decorated_view

@login_required(login_url=reverse_lazy("backend:login_options"))
def index_view(request):
	return redirect(reverse("backend:user",
		kwargs={'username':request.user.username}) + "?SPA=True")

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
		"games": Match.objects.competitive().played_by(user),
		"is_blocked": user in request.user.blocked_users.all(),
		"online_status": user.see_online_status_as(request.user),
		"can_invite": user in CustomUser.objects.uninvited_users(request.user, user.username),
		"sent_invitation": user in request.user.invited_by.all(),
		"received_invitation": user in request.user.invited_users.all(),
		"stats": {
			"pirates": {
				"losses": Match.objects.losses_of(request.user, "pr"),
				"wins": Match.objects.wins_of(request.user, "pr")
			},
			"pong": {
				"losses": Match.objects.losses_of(request.user, "po"),
				"wins": Match.objects.wins_of(request.user, "po")
			},
		},
		"form": EditProfileForm(request.POST, instance=request.user),
	}
	return render(request, "backend/index.html", data)

@require_http_methods(["POST"])
@login_401
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

@require_http_methods(["POST"])
@login_401
def user_view_games(request, username):
	user = get_object_or_404(CustomUser, username=username)
	data = {
		"user": user,
		"games": Match.objects.competitive().played_by(user),
	}
	#user_id = int(request.POST.get("user_id"))
	return render(request, "backend/components/last_games.html", data)

@require_http_methods(["POST"])
@login_401
def user_view_info(request, username):
	user = get_object_or_404(CustomUser, username=username)
	data = {
		"user": user,
		"is_blocked": user in request.user.blocked_users.all(),
		"online_status": user.see_online_status_as(request.user),
		"can_invite": user in CustomUser.objects.uninvited_users(request.user, user.username),
		"sent_invitation": user in request.user.invited_by.all(),
		"received_invitation": user in request.user.invited_users.all(),
		"stats": {
			"pirates": {
				"losses": Match.objects.losses_of(user, "pi"),
				"wins": Match.objects.wins_of(user, "pi")
			},
			"pong": {
				"losses": Match.objects.losses_of(user, "po"),
				"wins": Match.objects.wins_of(user, "po")
			},
		},
	}
	return render(request, "backend/components/user_info.html", data)

@require_http_methods(["POST"])
@login_401
@notifier
def create_invitation(request):
	invited_username = request.POST.get("username", "")
	next = request.POST.get("next", "/")
	request.user.create_invitation(invited_username)
	return redirect(next)

@require_http_methods(["POST"])
@login_401
@notifier
def block_user(request):
	blocked_user = CustomUser.objects.get(
		username = request.POST.get("username", ""))
	request.user.block(blocked_user)

@require_http_methods(["POST"])
@login_401
@notifier
def dismiss_invitation(request):
	invited_username = request.POST.get("username", "")
	next = request.POST.get("next", "/")
	request.user.dismiss_invitation(invited_username)
	return redirect(next)

@require_http_methods(["POST"])
@login_401
@notifier
def accept_invitation(request):
	invited_username = request.POST.get("username", "")
	next = request.POST.get("next", "/")
	request.user.accept_invitation(invited_username)
	return redirect(next)

@require_http_methods(["POST"])
@login_401
@notifier
def cancel_invitation(request):
	invited_username = request.POST.get("username", "")
	next = request.POST.get("next", "/")
	request.user.cancel_invitation(invited_username)
	return redirect(next)

@require_http_methods(["POST"])
@login_401
def uninvited_users(request):
	username = request.POST.get('username', '')
	users = CustomUser.objects.uninvited_users(request.user, username)
	data = {'users': users}
	return render(request, "backend/components/friends/invite_list.html", data)

@require_http_methods(["POST"])
@login_401
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
@login_401
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
@login_401
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
		return redirect(reverse("backend:tournament_list", kwargs={}) + "?SPA=True")
	return render(request, "backend/tournament.html", {
		"tournament": tournament,
		"rounds": reversed(range(1, tournament.round+1)),
		"competitor": Competitor.objects.of_tournament(
			tournament).of_user(request.user).first()
		})

@require_http_methods(["POST"])
@login_401
def tournament_competitors(request, tournament_id):
	tournament = get_object_or_404(Tournament, id = tournament_id)
	return render(request, "backend/components/tournament/competitor_list.html",{
		"tournament": tournament,
	})

@require_http_methods(["POST"])
@login_401
@notifier
def tournament_remove_competitor(request, tournament_id):
	Competitor.objects.remove_competitor(request.POST.get("competitor", ""))
	return redirect(reverse("backend:tournament",
		kwargs={'tournament_id':tournament_id}) + "?SPA=True")

@require_http_methods(["POST"])
@login_401
@notifier
def tournament_disqualify_competitor(request, tournament_id):
	comp = Competitor.objects.get(id = request.POST.get("competitor", ""))
	comp.disqualify()
	return redirect(reverse("backend:tournament",
		kwargs={'tournament_id':tournament_id}) + "?SPA=True")

@require_http_methods(["POST"])
@login_401
@notifier
def tournament_register_competitor(request, tournament_id):
	tournament = get_object_or_404(Tournament, id = tournament_id)
	Competitor.objects.register_competitor(
		tournament, request.user, request.POST.get("alias", ""))
	return redirect(reverse("backend:tournament",
		kwargs={'tournament_id':tournament_id}) + "?SPA=True")

@require_http_methods(["POST"])
@login_401
@notifier
def tournament_start(request, tournament_id):
	Tournament.objects.start_tournament(tournament_id, request.user)
	return redirect(reverse("backend:tournament",
		kwargs={'tournament_id':tournament_id}) + "?SPA=True")

@require_http_methods(["POST"])
@login_401
@notifier
def tournament_remove(request, tournament_id):
	tournament = Tournament.objects.get(id = tournament_id)
	if not request.user == tournament.owner:
		raise Notification ("Only the owner can remove tournaments.")
	tournament.delete()
	LiveUpdateConsumer.update_forms("tournament_list", "#tournament_list_update")
	LiveUpdateConsumer.reload_page(f"tournament_{tournament_id}")
	return redirect(reverse("backend:tournament",
		kwargs={'tournament_id':tournament_id}) + "?SPA=True")

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

@require_http_methods(["POST"])
@login_401
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
							kwargs = {"tournament_id": tournament.id}) + "?SPA=True")

@require_http_methods(["POST"])
@login_401
def tournament_list_update(request):
	data = {
		"tournaments": Tournament.objects.visible_to(request.user).filtered(**request.POST),
	}
	return render(request, "backend/components/tournament/tournament_list.html", data)

@login_required(login_url=reverse_lazy("backend:login_options"))
def logout(request):
	auth.logout(request)
	return redirect(reverse("backend:login_options") + "?SPA=True")

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
			return redirect(translate_url(reverse("backend:user", kwargs={"username": user.username}), language) + "?SPA=True")
		else:
			return render(request, "backend/login.html", {
				"error": _("Authentication failed"),
			})
	if request.method == "GET":
		return render(request, "backend/login.html", {})

@require_http_methods(["GET"])
def login_options(request):
	return render(request, "backend/login_options.html", {"auth_link":settings.AUTH_LINK})

@require_http_methods(["POST", "GET"])
def register_view(request):
	form = RegistrationForm()
	if request.method == 'POST':
		form = RegistrationForm(request.POST)
		if form.is_valid():
			form.save()
			return redirect(reverse('backend:login_options') + "?SPA=True")
	return render(request, 'backend/signup.html', {"form": form})

def three_demo(request):
	return render(request, 'backend/three.html', {})

@require_http_methods(["POST"])
@login_401
@notifier
def edit_profile(request):
	next = request.POST.get("next", "/")
	form = EditProfileForm(request.POST, request.FILES)
	if form.is_valid():
		request.user.bio = form.cleaned_data["bio"]
		if form.cleaned_data["preferred_language"] != None:
			request.user.preferred_language = form.cleaned_data["preferred_language"]
		if form.cleaned_data["picture"] != None:
			request.user.picture = form.cleaned_data["picture"]
		request.user.save()
		language = request.POST.get("preferred_language", "es")
		return redirect(translate_url(reverse('backend:user', kwargs={"username":request.user.username}), language) + "?SPA=True")
	raise Notification(_("Bad form"))


@login_required(login_url=reverse_lazy("backend:login_options"))
def game_view(request, game_id):
	game = Match.objects.get(id = int(game_id))
	reason = game.reason_user_cannot_join(request.user)
	if (reason):
		return render(request, 'backend/error.html', {"reason": reason})
	return render(request, 'backend/game.html', {
		"match": game,
		"mode": game.mode_as(request.user)
		})

@require_http_methods(["POST"])
@login_401
@notifier
def create_match(request):
	user_id = int(request.POST.get("user_id"))
	user = CustomUser.objects.get(id=user_id)
	game = request.POST.get("game")
	if not user in request.user.blocked_users.all() \
		and not request.user in user.blocked_users.all():
		if Match.objects.already_invited(request.user, user, game).count() == 0:
			home_competitor = Competitor.objects.create(user=request.user)
			guest_competitor = Competitor.objects.create(user=user)
			match = Match.objects.create(mode="re",
				game=game, home=home_competitor, guest=guest_competitor)
			ChatMessage.objects.send_message(
				sender=request.user, recipient=user, match=match, message="new match")
		else:
			raise Notification(_("You already sent an invitation"))
	data = {
		'messages': ChatMessage.objects.between(user, request.user).ordered(),
		'user': user,
		"online_status": user.see_online_status_as(request.user),
		}
	return render(request, "backend/components/chat/chat_messages.html", data)

@require_http_methods(["POST"])
@login_401
def remove_match(request):
	user_id = int(request.POST.get("user_id"))
	user = CustomUser.objects.get(id=user_id)
	match_id = request.POST.get("match_id")
	try:
		match = Match.objects.get(id=match_id)
		home = match.home.user
		guest = match.guest.user
		match.delete()
		LiveUpdateConsumer.update_forms(
			[f"user_{user_id}"],
			["#chat-refresh"]
		)
		LiveUpdateConsumer.update_forms(
			[f"user_{home.id}", f"user_{guest.id}"],
			["#user-games-refresh"]
		)
	except:
		pass
	data = {
		'messages': ChatMessage.objects.between(user, request.user).ordered(),
		'user': user,
		"online_status": user.see_online_status_as(request.user),
		}
	return render(request, "backend/components/chat/chat_messages.html", data)

@require_http_methods(["GET"])
def login_42(request):   
	
	try:
		code = request.GET.get("code")

		data = {
			"grant_type": "authorization_code",
			"client_id": settings.CLIENT_UID,
			"client_secret": settings.CLIENT_SECRET,
			"code": code,
			"redirect_uri": settings.REDIRECT_URI
		}

		
		auth_response = requests.post(
			"https://api.intra.42.fr/oauth/token", data=data)
		access_token = auth_response.json()["access_token"]
		
		user_response = requests.get(
			"https://api.intra.42.fr/v2/me",
			headers={"Authorization": f"Bearer {access_token}"})
		user_response_json = user_response.json()
		username = user_response_json["login"] + settings.LOGIN_42_SUFFIX
		image = user_response_json['image']['link']


		user = CustomUser.objects.filter(username=username)
		if not user:    
			user = CustomUser.objects.create_user(
				username=username,
				password=CustomUser.objects.make_random_password(),
				image_42=image,
			)
			user.picture = None
			user.save()
		else:
			user = user.first()
		auth.login(request, user)
		return redirect(reverse("backend:index") + "?SPA=True")
	except Exception as e:
		return render(request, "backend/error.html", {
			"reason": _(str(e))
		})

@require_http_methods(["POST"])
@login_401
def modal_play(request):
	game = request.POST.get("game")
	alias_home = request.POST.get("alias_home")
	alias_guest = request.POST.get("alias_guest")
	mode = request.POST.get("mode", "lo")
	if mode == "matchmaking":
		return redirect(reverse("backend:matchmaking_start", kwargs={"game": game}) + "?SPA=True")
	alias_home = _("home") if alias_home == "" else alias_home
	home_competitor = Competitor.objects.create(
		user=request.user,
		alias=alias_home
		)
	alias_guest = _("guest") if alias_guest == "" else alias_guest
	guest_competitor = Competitor.objects.create(
		user=request.user,
		alias=alias_guest
		)
	match = Match.objects.create(
		mode=mode,
		game=game,
		home=home_competitor,
		guest=guest_competitor
	)
	return redirect(reverse("backend:game", kwargs={"game_id": match.id}) + "?SPA=True")

@require_http_methods(["GET"])
@login_required(login_url=reverse_lazy("backend:login_options"))
def matchmaking_start(request, game):
	init = request.GET.get("init", "true")
	if init == "true":
		request.user.matchmaking_type = game
		request.user.matchmaking_range = 0
		request.user.matchmaking_match = None
		request.user.save()
	return render(request, "backend/matchmaking.html", {
		"online": CustomUser.objects.looking_for_partner(game).count(),
		"game": game
		})

@require_http_methods(["POST"])
@login_401
def matchmaking_poll(request, game):
	if request.user.matchmaking_match:
		return redirect(reverse("backend:game", kwargs={
			"game_id": request.user.matchmaking_match.id
			}) + "?SPA=True")
	range = int(request.POST.get("range", "0"))
	can_match = CustomUser.objects.can_match(game, request.user, range)
	if can_match:
		home_competitor = Competitor.objects.create(
			user=request.user
			)
		guest_competitor = Competitor.objects.create(
			user=can_match[0]
			)
		match = Match.objects.create(
			mode="re",
			game=game,
			home=home_competitor,
			guest=guest_competitor
		)
		request.user.matchmaking_match = match
		request.user.save()
		can_match[0].matchmaking_match = match
		can_match[0].save()
		return redirect(reverse("backend:game", kwargs={"game_id": match.id}) + "?SPA=True")
	return redirect(reverse("backend:matchmaking_start", kwargs={"game": game}) + "?SPA=True&init=false")