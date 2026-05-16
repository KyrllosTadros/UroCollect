"""
Configuratie module voor applicatie-instellingen.
Deze module laadt omgevingsvariabelen vanuit een .env-bestand en definieert
de Config klasse die alle belangrijke configuratiewaarden centraliseert.
Dit omvat onder andere credentials en URLs voor externe diensten zoals Supabase.
Het doel van deze module is om gevoelige gegevens gescheiden te houden van
de broncode en centraal beheerd beschikbaar te maken binnen de applicatie.
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:

    """
    Centrale configuratieklasse voor applicatie-instellingen.
    Deze klasse bevat statische configuratievariabelen die worden geladen
    uit omgevingsvariabelen. Ze worden gebruikt door andere modules om
    verbinding te maken met externe services zoals Supabase.

    Attributes:
        SUPABASE_URL (str): URL van de Supabase project database.
        SUPABASE_KEY (str): API sleutel voor toegang tot Supabase.
    """

    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
