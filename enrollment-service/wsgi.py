import os
import shutil
from prometheus_client import CollectorRegistry, multiprocess

# 1. Configuration du multiprocessus Prometheus
os.environ.setdefault("PROMETHEUS_MULTIPROC_DIR", "/tmp/prometheus_multiproc_dir")
multiproc_dir = os.environ["PROMETHEUS_MULTIPROC_DIR"]

if os.path.exists(multiproc_dir):
    shutil.rmtree(multiproc_dir)
os.makedirs(multiproc_dir, exist_ok=True)

registry = CollectorRegistry()
multiprocess.MultiProcessCollector(registry)

# 2. Chargement de l'application Flask
from app import create_app
app = create_app()

# 3. Instrumentation OpenTelemetry explicite pour Flask
try:
    from opentelemetry.instrumentation.flask import FlaskInstrumentor
    FlaskInstrumentor().instrument_app(app)
except Exception as e:
    print(f"Erreur d'initialisation OpenTelemetry : {e}")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003)
