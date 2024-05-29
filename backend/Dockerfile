FROM python:3.9-slim

WORKDIR /usr/src/app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

#Crea el proyecto Django si no existe
RUN if [ ! -f manage.py ]; then django-admin startproject myproject .; fi

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
