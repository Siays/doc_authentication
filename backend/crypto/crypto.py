from pathlib import Path
from dataclasses import dataclass

from cryptography.hazmat.primitives.asymmetric.rsa import (
    RSAPrivateKey, RSAPublicKey, generate_private_key
)
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from hashlib import sha256

KEY_DIR = Path("./keys")
PRIVATE_KEY_FILE = KEY_DIR / "private_key.pem"
PUBLIC_KEY_FILE = KEY_DIR / "public_key.pem"


@dataclass(frozen=True)
class RSAKeyPair:
    private_key: RSAPrivateKey
    public_key: RSAPublicKey

    @classmethod
    def load_or_create_keys(cls, passphrase: bytes | None = None) -> "RSAKeyPair":
        """
            Loads existing RSA key pair from disk or generates a new one if not found.

            Args:
                passphrase (bytes | None): Optional passphrase for private key encryption.

            Returns:
                  RSAKeyPair: An object containing both private and public keys.
        """
        # Ensure the key directory exists
        KEY_DIR.mkdir(parents=True, exist_ok=True)

        # the case which keys already exists, retrieve it directly
        if PRIVATE_KEY_FILE.exists() and PUBLIC_KEY_FILE.exists():
            with PRIVATE_KEY_FILE.open("rb") as f:
                private_key = serialization.load_pem_private_key(
                    f.read(), password=passphrase
                )
            with PUBLIC_KEY_FILE.open("rb") as f:
                public_key = serialization.load_pem_public_key(f.read())

            return cls(private_key, public_key)

        private_key = generate_private_key(public_exponent=65537, key_size=2048)
        public_key = private_key.public_key()

        enc_algo = (
            serialization.BestAvailableEncryption(passphrase)
            if passphrase
            else serialization.NoEncryption()
        )

        with PRIVATE_KEY_FILE.open("wb") as f:
            f.write(
                private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=enc_algo
                )
            )

        with PUBLIC_KEY_FILE.open("wb") as f:
            f.write(
                public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo,
                )
            )

        return cls(private_key, public_key)

    def get_public_key_pem(self) -> str:
        return self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode("utf-8")

    @staticmethod
    def hash_bytes(data:bytes) -> bytes:
        return sha256(data).digest()

    def sign(self, message: bytes) -> bytes:
        return self.private_key.sign(
            message,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH, # ensure a same message signed will not produce the same signature
            ),
            hashes.SHA256()
        )

    def verify(self, signature: bytes, data: bytes) -> bool:
        try:
            self.public_key.verify(
                signature,
                data,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH,
                ),
                hashes.SHA256()
            )
            return True

        except Exception as e:
            print(f"Verification failed: {e}")
            return False
