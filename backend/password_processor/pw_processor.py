from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

argon2_hasher = PasswordHasher(
    time_cost=2,        # iterations
    memory_cost=19 * 1024,  # 19 MiB memory cost (in KiB)
    parallelism=1,
    hash_len=32,
    salt_len=16,
)

def hash_password(password: str) -> dict:
    hash_str = argon2_hasher.hash(password)
    # salt is embedded in the hash, so no separate salt output
    return {
        "hash": hash_str,
    }

def verify_password(password: str, stored_hash: str) -> bool:
    try:
        return argon2_hasher.verify(stored_hash, password)
    except VerifyMismatchError:
        return False
