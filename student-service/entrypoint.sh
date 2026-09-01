#!/bin/sh
set -e

echo "[student-service] Application des migrations Alembic..."
alembic upgrade head

echo "[student-service] Démarrage de gunicorn..."
exec gunicorn --bind 0.0.0.0:5001 --workers 2 --threads 2 --timeout 30 wsgi:app
