"""
Supabase client initialisatie module.
Deze module initialiseert een centrale Supabase client instantie met behulp
van de URL en API-key uit de Config klasse. De client fungeert als de
hoofdingang voor interactie met Supabase, waaronder database-operaties,
authenticatie en storage.
De client wordt één keer aangemaakt en kan vervolgens door de rest van de
applicatie worden geïmporteerd en hergebruikt.
Attributes:
    supabase (Client): Geconfigureerde en herbruikbare Supabase client instantie.
"""
from supabase import create_client, Client
from config import Config

"""
Supabase client initialisatie module.

Deze module maakt een Supabase client aan met behulp van de
URL en API-key uit de Config klasse. De client wordt gebruikt voor
database-interacties, authenticatie en storage binnen de applicatie.

Attributes:
    supabase (Client): Geconfigureerde Supabase client instantie.
"""

supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
