"""
Applicatie entrypoint.

Dit script initialiseert de Flask-applicatie via de application factory
(create_app) en start vervolgens de development server wanneer het bestand
direct wordt uitgevoerd.

In productie wordt dit bestand niet gebruikt om de server te starten,
maar wordt de app geladen via een WSGI-server zoals Gunicorn.
"""

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
