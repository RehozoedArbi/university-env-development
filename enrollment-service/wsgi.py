import os
import shutil

# Configuration simple du multiprocessus Prometheus
os.environ.setdefault("PROMETHEUS_MULTIPROC_DIR", "/tmp/prometheus_multiproc_dir")
multiproc_dir = os.environ["PROMETHEUS_MULTIPROC_DIR"]

if os.path.exists(multiproc_dir):
    shutil.rmtree(multiproc_dir)
os.makedirs(multiproc_dir, exist_ok=True)

# Chargement direct de l'application
from app import create_app
app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003)
