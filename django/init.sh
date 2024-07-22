#!/bin/bash

# The next command should not be executed in production:
rm -rf ./backend/migrations
python manage.py makemigrations
python manage.py makemigrations backend
python manage.py migrate
# The next command should not be executed in production:
python manage.py demodata
python manage.py collectstatic --noinput
gunicorn --bind 0.0.0.0:8000 transcendence.wsgi:application
