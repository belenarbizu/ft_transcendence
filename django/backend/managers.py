from django.db import models
from . import querysets
from django.contrib.auth.models import UserManager
from channels.layers import get_channel_layer
from django.utils.translation import gettext_lazy as _
from .utils import notify_update
from asgiref.sync import async_to_sync
from django.apps import apps
import random

class CustomUserManager(
    UserManager.from_queryset(querysets.CustomUserQuerySet)):
    pass


class ChatMessageManager(
    models.Manager.from_queryset(querysets.ChatMessageQuerySet)):
    
    def send_message(self, **kwargs):
        if (kwargs['message']):
            self.create(**kwargs).save()
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'user_{kwargs["recipient"].id}',
                {
                    "type": "chat_message",
                    'sender': kwargs['sender'],
                    'message': kwargs['message'],
                }
            )


class MatchManager(
    models.Manager.from_queryset(querysets.MatchQuerySet)):
    pass


class TournamentManager(
    models.Manager.from_queryset(querysets.TournamentQuerySet)):
        
    def create(self, *args, **kwargs):
        notify_update("tournament_list", "#tournament_list_update")
        return super().create(*args, **kwargs)
        
    def start_tournament(self, tournament_id, user):
        tournament = self.get(id = tournament_id)
        if user != tournament.owner:
            raise Exception(_("You can't start the tournament"))
        if tournament.is_created:
            if len(tournament.competitors.all()) < 2:
                raise Exception(_("You can't start the tournament with less than 2 competitors"))
            tournament.state = 'st'
            notify_update("tournament_list", "#tournament_list_update")
            self.new_round(tournament)
            tournament.save()
    
    def generate_tournament_matches(self, tournament):
        Match = apps.get_model("backend", "Match")
        tournament_competitors = list(tournament.competitors.not_eliminated())
        random.shuffle(tournament_competitors)
        match_count = len(tournament_competitors) // 2
        for i in range(match_count):
            home = tournament_competitors[i * 2]
            guest = tournament_competitors[i * 2 + 1]
            match = Match.objects.create(
                home = home,
                guest = guest,
                game = tournament.game,
                mode = tournament.tournament_mode,
                tournament = tournament,
            )
    
    def new_round(self, tournament):
        competitors = tournament.competitors.not_eliminated()
        if len(competitors) == 1:
            tournament.state = "fi"
            tournament.winner = competitors.first()
            tournament.save()
            notify_update("tournament_list", "#tournament_list_update")
        if len(tournament.matches.not_finished()) == 0:
            self.generate_tournament_matches(tournament)


class CompetitorManager(
    models.Manager.from_queryset(querysets.CompetitorQuerySet)):
    
    def register_competitor(self, tournament, user, alias):
        tournament_aliases = tournament.competitors.values_list('alias', flat = True)
        tournament_users = tournament.competitors.values_list('user', flat = True)
        if not tournament.is_created:
            raise Exception(_("Competitors can't be added once the tournament is started"))
        if tournament.is_practice:
            if alias == "":
                raise Exception(_("You must choose an alias for this tournament"))
            if alias in tournament_aliases:
                raise Exception(_("The alias is already in use"))
            competitor = self.create(
                alias = alias,
                user = user,
                tournament = tournament)
            competitor.save()
        if not tournament.is_practice:
            if user.id in tournament_users:
                raise Exception(_("You already joined the tournament"))
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
        notify_update(
            f"tournament_{tournament.id}",
            "#tournament-competitor-list-update")
        

    def remove_competitor(self, competitor_id):
        try:
            competitor = self.get(id = competitor_id)
        except:
            raise Exception(_("Competitor not found"))
        if not competitor.tournament.is_created:
            raise Exception(_("Competitors can't be removed once the tournament is started"))
        tournament = competitor.tournament
        competitor.delete()
        if tournament:
            notify_update(
                f"tournament_{tournament.id}",
                "#tournament-competitor-list-update")