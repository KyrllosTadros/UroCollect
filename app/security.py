"""
Beveiligingsmodule voor wachtwoord hashing en verificatie.

Deze module bevat functies voor het veilig verwerken van wachtwoorden
met behulp van bcrypt. Wachtwoorden worden gehashed met een unieke salt
en kunnen vervolgens worden gecontroleerd tegen opgeslagen hashes.

Functies:
    - hash_password: Zet een plain-text wachtwoord om naar een bcrypt-hash.
    - verify_password: Controleert of een wachtwoord overeenkomt met een hash.

Deze aanpak zorgt ervoor dat wachtwoorden nooit in plain-text worden
opgeslagen en verhoogt de beveiliging van gebruikersdata.
"""
import bcrypt

def hash_password(password: str) -> str:
    """
    Genereert een veilige bcrypt-hash van een wachtwoord.

    Het wachtwoord wordt eerst omgezet naar bytes, waarna bcrypt een
    salt toevoegt en het wachtwoord hasht. Het resultaat wordt
    teruggegeven als een UTF-8 string zodat het eenvoudig kan worden
    opgeslagen in een database.

    Args:
        password (str): Het platte tekst wachtwoord dat gehashed moet worden.

    Returns:
        str: De bcrypt-gehashte versie van het wachtwoord als string.
    """
    # password → bytes
    password_bytes = password.encode('utf-8')

    # salt + hash
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())

    # opslaan als string
    return hashed.decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """
    Controleert of een plain-text wachtwoord overeenkomt met een bcrypt-hash.
    Beide waarden worden omgezet naar bytes en vervolgens veilig vergeleken
    met bcrypt om te bepalen of het wachtwoord klopt.

    Args:

        password (str): Het ingevoerde plain-text wachtwoord.

        password_hash (str): De opgeslagen bcrypt-hash.

    Returns:

        bool: True als het wachtwoord klopt, anders False.
    """
    password_bytes = password.encode('utf-8')
    hash_bytes = password_hash.encode('utf-8')

    return bcrypt.checkpw(password_bytes, hash_bytes)
