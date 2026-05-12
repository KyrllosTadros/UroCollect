import bcrypt

# -------------------------
# HASH PASSWORD
# -------------------------
def hash_password(password: str) -> str:
    # password → bytes
    password_bytes = password.encode('utf-8')

    # salt + hash
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())

    # opslaan als string
    return hashed.decode('utf-8')


# -------------------------
# VERIFY PASSWORD
# -------------------------
def verify_password(password: str, password_hash: str) -> bool:
    password_bytes = password.encode('utf-8')
    hash_bytes = password_hash.encode('utf-8')

    return bcrypt.checkpw(password_bytes, hash_bytes)