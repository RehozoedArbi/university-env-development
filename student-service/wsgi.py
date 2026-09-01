from app import create_app

app = create_app()

if __name__ == "__main__":
    # Uniquement pour du debug local hors conteneur ; en production
    # le conteneur utilise gunicorn (voir Dockerfile / CMD).
    app.run(host="0.0.0.0", port=5001)
