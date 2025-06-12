import base64
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes


def encrypt_doc_id(public_key, doc_id: str) -> str:
    encrypted = public_key.encrypt(
        doc_id.encode(),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return base64.urlsafe_b64encode(encrypted).decode()


def decrypt_doc_id(private_key, encrypted_doc_id_b64: str) -> str:
    encrypted = base64.urlsafe_b64decode(encrypted_doc_id_b64)
    decrypted = private_key.decrypt(
        encrypted,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return decrypted.decode()
