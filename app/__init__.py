import os
from flask import Flask
from dotenv import load_dotenv

load_dotenv()

def create_app():
    """
    Maakt en configureert de Flask-applicatie. Deze functie initialiseert een Flask-app,
    laadt omgevingsvariabelen uit een .env-bestand en stelt de SECRET_KEY in die nodig is voor sessiebeheer in Flask.
    Daarnaast wordt de blueprint met routes geregistreerd.
    Returns:

        Flask app: de geïnitialiseerde Flask-applicatie.
    """
    app = Flask(__name__)

    # SECRET_KEY is verplicht voor Flask sessies
    app.secret_key = os.getenv("SECRET_KEY")

    from app.routes import main
    app.register_blueprint(main)

    return app