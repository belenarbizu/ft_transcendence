#!/bin/bash

rm -rf ./backend/migrations
python manage.py makemigrations
python manage.py makemigrations backend
python manage.py migrate
python manage.py demodata
python manage.py collectstatic --noinput
python manage.py runserver --settings transcendence.dev_settings 0.0.0.0:8000
