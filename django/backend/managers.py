from django.db import models
from . import querysets
from django.contrib.auth.models import UserManager
from django.utils.translation import gettext_lazy as _
from .consumers import LiveUpdateConsumer
from django.apps import apps
import random
from .exceptions import Notification

def get_default_picture():
        pictures = [
            'profile_defaults/cat.jpg',
            'profile_defaults/lion.jpg',
            'profile_defaults/panda.jpg',
            'profile_defaults/rabbit.jpg',
            'profile_defaults/rat.jpg',
            'profile_defaults/dog.jpg',
            'profile_defaults/otter.jpg',
            'profile_defaults/fox.jpg',
            'profile_defaults/koala.jpg',
            'profile_defaults/white_tiger.jpg',
        ]
        return random.choice(pictures)

class CustomUserManager(UserManager.from_queryset(querysets.CustomUserQuerySet)):

    def create_user(self, *args, **kwargs):
        user = super().create_user(*args, **kwargs)
        user.set_default_picture()
        user.save()
        return user

    def create(self, *args, **kwargs):
        user = super().create(*args, **kwargs)
        user.set_default_picture()
        user.save()
        return user

    def register_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("Please enter a username")
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def find_name(self, username):
        return self.get_queryset().find_name(username)
    

class ChatMessageManager(
	models.Manager.from_queryset(querysets.ChatMessageQuerySet)):
	
	def send_message(self, **kwargs):
		if kwargs['message']:
			kwargs['blocked'] = False
			if kwargs['sender'] in kwargs['recipient'].blocked_users.all() \
				or kwargs['recipient'] in kwargs['sender'].blocked_users.all():
				kwargs['blocked'] = True
			self.create(**kwargs).save()
			if not kwargs['blocked']:
				LiveUpdateConsumer.update_forms(
					[f"user_{kwargs['recipient'].id}"],
					["#chat-refresh"]
				)
				LiveUpdateConsumer.send_notification(
					[f"user_{kwargs['recipient'].id}"],
					[kwargs['sender'].username + " " + _("sent you a message")]
				)


class MatchManager(
    models.Manager.from_queryset(querysets.MatchQuerySet)):
	
	def create(self, *args, **kwargs):
		result = super().create(*args, **kwargs)
		LiveUpdateConsumer.update_forms(
			[f"user_{result.home.user.id}", f"user_{result.guest.user.id}"],
			["#user-games-refresh"]
		)
		return result
        

class TournamentManager(
	models.Manager.from_queryset(querysets.TournamentQuerySet)):
	
	def create(self, *args, **kwargs):
		LiveUpdateConsumer.update_forms(
			"tournament_list",
			"#tournament_list_update"
		)
		return super().create(*args, **kwargs)
		
	def start_tournament(self, tournament_id, user):
		tournament = self.get(id = tournament_id)
		if user != tournament.owner:
			raise Notification(_("You can't start the tournament"))
		if tournament.is_created:
			if len(tournament.competitors.all()) < 3:
				raise Notification(_("You can't start the tournament with less than 3 competitors"))
			tournament.state = 'st'
			LiveUpdateConsumer.reload_page(f"tournament_{tournament.id}")
			LiveUpdateConsumer.update_forms(
				"tournament_list",
				"#tournament_list_update"
			)
			self.new_round(tournament)
			tournament.save()
	
	def generate_tournament_matches(self, tournament):
		Match = apps.get_model("backend", "Match")
		tournament_competitors = list(tournament.competitors.not_eliminated())
		random.shuffle(tournament_competitors)
		match_count = len(tournament_competitors) // 2
		if (match_count > 0):
			tournament.round += 1
			tournament.save()
		for i in range(match_count):
			home = tournament_competitors[i * 2]
			guest = tournament_competitors[i * 2 + 1]
			match = Match.objects.create(
				home = home,
				guest = guest,
				game = tournament.game,
				mode = tournament.tournament_mode,
				tournament = tournament,
				tournament_round = tournament.round,
			)
	
	def new_round(self, tournament):
		competitors = tournament.competitors.not_eliminated()
		if len(competitors) == 1:
			tournament.state = "fi"
			tournament.winner = competitors.first()
			tournament.save()
		if len(tournament.matches.not_finished()) == 0:
			self.generate_tournament_matches(tournament)
		LiveUpdateConsumer.update_forms(
			"tournament_list",
			"#tournament_list_update"
		)
		LiveUpdateConsumer.reload_page(f"tournament_{tournament.id}")


class CompetitorManager(
	models.Manager.from_queryset(querysets.CompetitorQuerySet)):

	def create(self, *args, **kwargs):
		competitor = super().create(*args, **kwargs)
		competitor.picture = get_default_picture()
		competitor.save()
		return competitor
	
	def register_competitor(self, tournament, user, alias):
		tournament_aliases = tournament.competitors.values_list('alias', flat = True)
		tournament_users = tournament.competitors.values_list('user', flat = True)
		if not tournament.is_created:
			raise Notification(_("Competitors can't be added once the tournament is started"))
		if tournament.is_practice:
			if alias == "":
				raise Notification(_("You must choose an alias for this tournament"))
			if alias in tournament_aliases:
				raise Notification(_("The alias is already in use"))
			competitor = self.create(
				alias = alias,
				user = user,
				tournament = tournament)
			competitor.save()
		if not tournament.is_practice:
			if user.id in tournament_users:
				raise Notification(_("You already joined the tournament"))
			if alias in tournament_aliases or alias == "":
				alias = user.username
			id = 1
			if alias in tournament_aliases:
				while alias in tournament_aliases:
					alias = f"{user.username}_{id}"
					id += 1
			competitor = self.create(
				alias = alias,
				user = user,
				tournament = tournament)
			competitor.save()
		LiveUpdateConsumer.update_forms(
			f"tournament_{tournament.id}",
			"#tournament-competitor-list-update"
		)
		
	def remove_competitor(self, competitor_id):
		try:
			competitor = self.get(id = competitor_id)
		except:
			raise Notification(_("Competitor not found"))
		if not competitor.tournament.is_created:
			raise Notification(_("Competitors can't be removed once the tournament is started"))
		tournament = competitor.tournament
		competitor.delete()
		if tournament:
			LiveUpdateConsumer.update_forms(
				f"tournament_{tournament.id}",
				"#tournament-competitor-list-update"
			)
