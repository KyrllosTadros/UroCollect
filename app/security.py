import bcrypt

def hash_password(password: str) -> str:
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