# syntax=docker/dockerfile:1

# ============================================================
# Stage 1 : Build des dépendances (venv)
# ============================================================
FROM python:3.14 AS builder

USER root
WORKDIR /app

# Outils de compilation (uniquement nécessaires si des wheels sont à compiler)
RUN apk add --no-cache build-base postgresql-dev

# Venv isolé, copié tel quel dans l'image finale
RUN python -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip \
    && pip install -r requirements.txt

# ============================================================
# Stage 2 : Runtime
# ============================================================
FROM python:3.14-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/venv/bin:$PATH"

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app/venv /app/venv
COPY --chown=nonroot:nonroot app ./app
COPY --chown=nonroot:nonroot migrations ./migrations
COPY --chown=nonroot:nonroot alembic.ini wsgi.py entrypoint.py ./

USER nonroot

EXPOSE 5003

ENTRYPOINT ["python", "entrypoint.py"]
