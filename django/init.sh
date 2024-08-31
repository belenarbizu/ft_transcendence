#!/bin/bash

python manage.py makemigrations
python manage.py makemigrations backend
python manage.py migrate
python manage.py collectstatic --noinput
daphne -b 0.0.0.0 -p 8001 transcendence.asgi:application