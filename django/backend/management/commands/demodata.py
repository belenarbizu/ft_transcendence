from django.core.management.base import BaseCommand, CommandError
from backend.models import *


class Command(BaseCommand):
    help = "Creates demo data for backend app"

    def clean_tables(self):
        print ("Cleaning the mess")
        CustomUser.objects.all().delete()

    def create_users(self):
        print ("Creating users")
        self.root = CustomUser.objects.create_superuser(
            username='root', password='root')
        self.root.save()
        self.pablo = CustomUser.objects.create_user(
            username='pablo', password='pablo')
        self.pablo.save()
        self.alejandro = CustomUser.objects.create_user(
            username='alejandro', password='alejandro')
        self.alejandro.save()
        self.alejandra = CustomUser.objects.create_user(
            username='alejandra', password='alejandra')
        self.alejandra.save()
        self.fermin = CustomUser.objects.create_user(
            username='fermin', password='fermin')
        self.fermin.save()
        self.belen = CustomUser.objects.create_user(
            username='belen', password='belen')
        self.belen.save()
        
    def create_friendships(self):
        print ("Creating emotional bonds")
        self.pablo.friends.add(self.belen)
        self.pablo.friends.add(self.fermin)
        self.alejandro.friends.add(self.alejandra)
        self.alejandro.friends.add(self.fermin)
        self.belen.friends.add(self.alejandra)

    def create_matchs(self):
        print ("Falsifying game results")
        Match.objects.create(
            home=self.pablo,
            guest=self.belen,
            game='Pong',
            winner=self.pablo,
            home_score=1,
            guest_score=0,
            state='fini'
        ).save()
        Match.objects.create(
            home=self.belen,
            guest=self.alejandra,
            game='Pong',
            winner=self.belen,
            home_score=3,
            guest_score=1,
            state='fini'
        ).save()
        Match.objects.create(
            home=self.alejandra,
            guest=self.alejandro,
            game='Pong',
            winner=self.alejandra,
            home_score=3,
            guest_score=1,
            state='fini'
        ).save()
        Match.objects.create(
            home=self.alejandro,
            guest=self.fermin,
            game='Pong',
            winner=self.alejandro,
            home_score=3,
            guest_score=1,
            state='fini'
        ).save()
        Match.objects.create(
            home=self.fermin,
            guest=self.pablo,
            game='Pong',
            winner=self.fermin,
            home_score=3,
            guest_score=1,
            state='fini'
        ).save()

    def handle(self, *args, **options):
        print ("Creating demo data for backend app")
        self.clean_tables()
        self.create_users()
        self.create_friendships()
        for i in range(12):
            self.create_matchs()