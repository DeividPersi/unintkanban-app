#!/bin/bash
# Start Django backend
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py create_superuser
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# Start nginx
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for any process to exit
wait $BACKEND_PID $NGINX_PID
