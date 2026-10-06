# syntax=docker/dockerfile:1

ARG PYTHON_VERSION=3.14

# ---------- Stage 1 : build des dépendances ----------
FROM python:${PYTHON_VERSION}-slim-trixie AS builder

WORKDIR /build

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---------- Stage 2 : image finale minimale ----------
FROM python:${PYTHON_VERSION}-slim-trixie

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# libpq5 : lib client runtime pour psycopg2 (pas besoin des headers de dev)
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
        libpq5 \
        curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 1000 appgroup \
    && useradd --uid 1000 --gid appgroup --shell /usr/sbin/nologin --create-home appuser

WORKDIR /app

COPY --from=builder /install /usr/local
COPY app ./app
COPY migrations ./migrations
COPY alembic.ini wsgi.py entrypoint.py ./

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5003

ENTRYPOINT ["python", "entrypoint.py"]
