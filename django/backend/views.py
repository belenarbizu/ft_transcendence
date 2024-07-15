from django.shortcuts import render
import random

# Create your views here.

def user_view(request, username):
    users = [
        "akentgo", "aoropeza", "angalsty", "azubieta",
        "anquinte", "jose-rig", "secarras", "lromero",
        "barbizu", "fgalan", "jariza-o"
    ]
    random.shuffle(users)
    users = users[:7]
    data = {
        "username": username,
        "friends": {
            "pending": [
                {
                    "name": n,
                }
                for n in users[0:2]
            ],
            "invitations": [
                {
                    "name": n,
                }
                for n in [users[3]]
            ],
            "accepted": [
                {
                    "name": n,
                    "unread": random.choice([0, 1, 1, 2, 3, 5, 8]),
                }
                for n in users[4:]
            ]
        },
        "games": [
            {
                "opponent": n,
                "game": random.choice(["Pirates Revenge", "Hyperpong"]),
                "date": "today",
                "result": "1/1",
                "winner": random.choice([True, False]),
            }
            for n in users * 6
        ]
    }
    return render(request, "backend/index.html", data)