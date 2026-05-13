import os
from flask import Flask
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)

    # SECRET_KEY is verplicht voor Flask sessies
    app.secret_key = os.getenv("SECRET_KEY")

    from app.routes import main
    app.register_blueprint(main)

    return app