#!/bin/sh
set -e

echo "[enrollment-service] Application des migrations Alembic..."
alembic upgrade head

echo "[enrollment-service] Démarrage de gunicorn..."
exec gunicorn --bind 0.0.0.0:5003 --workers 2 --threads 2 --timeout 30 wsgi:app
