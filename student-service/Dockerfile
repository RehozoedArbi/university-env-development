# syntax=docker/dockerfile:1

ARG PYTHON_VERSION=3.14

# ---------- Stage 1 : build des dépendances ----------
FROM python:${PYTHON_VERSION}-alpine AS builder

WORKDIR /build

RUN apk upgrade --no-cache \
    && apk add --no-cache \
        gcc \
        musl-dev \
        postgresql-dev

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---------- Stage 2 : image finale minimale ----------
FROM python:${PYTHON_VERSION}-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# libpq : lib client runtime pour psycopg2 (pas besoin des headers de dev)
RUN apk upgrade --no-cache \
    && apk add --no-cache libpq \
    && pip uninstall -y pip setuptools 2>/dev/null || true \
    && addgroup -g 1000 appgroup \
    && adduser -D -u 1000 -G appgroup -s /sbin/nologin appuser

WORKDIR /app

COPY --from=builder /install /usr/local
COPY app ./app
COPY migrations ./migrations
COPY alembic.ini wsgi.py entrypoint.py ./

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5001

ENTRYPOINT ["python", "entrypoint.py"]
