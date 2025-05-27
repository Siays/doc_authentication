from fastapi import File, UploadFile, FastAPI, HTTPException, Depends, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import uuid
from dotenv import load_dotenv
import os
from datetime import date
from qr_implementation.qr_processing import embed_qr_to_pdf, create_qr_url
from sqlalchemy.orm import Session
from uuid import UUID
from db.database import get_db
from db.models.models import DocumentRecord
from crypto.crypto import RSAKeyPair
from crypto.url_processing import encrypt_doc_id, decrypt_doc_id
from db.crud import create, get
from backend.api import register

app = FastAPI(title="PDF Upload & QR Embedding API")
app.mount("/static", StaticFiles(directory="uploads/with_qr"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # frontend Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(login.router)
app.include_router(register.router)

load_dotenv()  # Load .env into os.environ
LOCAL_HOST = os.getenv("LOCAL_HOST")

UPLOAD_DIR = Path("uploads/original")
QR_DIR = Path("uploads/with_qr")
UPLOAD_DIR.mkdir(exist_ok=True)
QR_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf"}  # Use set for faster lookup

KEYPAIR = RSAKeyPair.load_or_create_keys()


def save_upload_file(upload_file: UploadFile, destination: Path, ) -> Path:
    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        return destination
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")


@app.post("/upload", response_class=FileResponse)
async def upload_document(doc_owner_name:str = Form(...),
                        doc_owner_ic:str = Form(...),
                        doc_type:str = Form(...),
                        issuer_name:str = Form(...),
                        issue_date:date = Form(...),
                        file: UploadFile = File(...),
                        db: Session = Depends(get_db)):
    try:
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

        # generate the file's unique UUID and predefine the original and process file save location and file name
        unique_id = uuid.uuid4()
        unique_id_str = unique_id.hex # later in query we will need to convert the string back to UUID object

        ori_path = UPLOAD_DIR / f"{unique_id_str}.pdf"
        final_path = QR_DIR / f"{unique_id_str}_processed.pdf"

        # we still save original file (before embed QR) just in case
        save_upload_file(file, ori_path)

        # encrypt the doc id, so in the url it doesn't directly show the doc UUID
        encrypted_doc_id = encrypt_doc_id(KEYPAIR.public_key, unique_id_str)
        authentication_url = create_qr_url(LOCAL_HOST, encrypted_doc_id)

        # Embed QR into the PDF
        try:
            embed_qr_to_pdf(ori_path, final_path, authentication_url)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to embed QR: {e}")

        # get the pdf bytes
        try:
            with open(final_path, "rb") as f:
                pdf_bytes = f.read()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read signed PDF: {e}")

        hash_result = KEYPAIR.hash_bytes(pdf_bytes)
        signature = KEYPAIR.sign(hash_result)

        issuer_id = 1

        # Use generic CRUD create operation
        record_data = {
            "id": unique_id,
            "doc_owner_name": doc_owner_name,
            "doc_owner_ic": doc_owner_ic,
            "document_type": doc_type,
            "issuer_id" : issuer_id,
            "issuer_name": issuer_name,
            "issue_date": issue_date,
            "hash": hash_result,
            "signature": signature,
            "verification_url": f"/static/{unique_id_str}_processed.pdf",
        }
        create(db, DocumentRecord, record_data)

        print(f"Token: {encrypted_doc_id}")
        return FileResponse(
            path=final_path,
            media_type="application/pdf",
            filename="document_with_qr.pdf"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")
    # return FileResponse(modified_path, filename="document_with_qr.pdf", media_type="application/pdf")


@app.post("/verify")
async def verify_document(token: str,
                          file: UploadFile = File(...),
                            db: Session = Depends(get_db)):
    # decrypt the token (doc_id in url)
    decrypted_token_id = decrypt_doc_id(KEYPAIR.private_key, token)
    try:
        # the decrypted token is in str (UUID.hex), so we convert it back to UUID object
        doc_id = UUID(decrypted_token_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid token format")

    # Use generic CRUD get operation
    document = get(db, DocumentRecord, doc_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    uploaded_bytes = await file.read()

    uploaded_hash = KEYPAIR.hash_bytes(uploaded_bytes)
    is_hash_match = uploaded_hash == document.hash
    is_signature_valid = KEYPAIR.verify(document.signature, uploaded_hash)

    if is_hash_match and is_signature_valid:
        return JSONResponse({
            "status": "valid",
            "message": "The uploaded document is authentic and untampered.",
            "issuer": document.issuer_name,
            "issued_to": document.doc_owner_name,
            "issue_date": str(document.issue_date),
        })
    elif not is_hash_match and is_signature_valid:
        return JSONResponse({
            "status": "invalid",
            "message": "Hash mismatch: The uploaded document has been altered or corrupted.",
            "reason": "File hash does not match the original hash."
        })
    elif is_hash_match and not is_signature_valid:
        return JSONResponse({
            "status": "invalid",
            "message": "Invalid signature: The file content may be correct, but it was not signed by this system.",
            "reason": "The signature is not valid for this content."
        })
    else:
        return JSONResponse({
            "status": "invalid",
            "message": "The document is both altered and not signed by this system.",
            "reason": "Hash mismatch and signature verification failed."
        })


@app.get("/")
def root():
    return {"status": "OK", "message": "PDF upload and QR embedding API is ready."}


### TO DO
# Use a web form (client-side) to POST after scanning
# If you insist on full verification after QR scan, you need:
#
# A web page that the QR code links to.
#
# That page shows a form to upload the PDF.
#
# On submit, it sends a POST to /verify.
#
# But that's more complex and requires a front-end.
#
# 🔚 Summary
# Goal	Best Solution
# Show basic info when QR is scanned	✅ Add a GET /verify route
# Verify doc with file after scan	🔁 Redirect to upload form page
#
# Let me know and I'll help generate the QR or add the HTML view if needed!








## to do - test verify

# from fastapi.responses import JSONResponse
# import base64
#
#
# @app.post("/test-pdf-bytes")
# async def test_pdf_bytes():
#     final_path = Path(r"C:\Users\syshe\Downloads\document_with_qr.pdf")
#
#     if not final_path.exists():
#         raise HTTPException(status_code=404, detail=f"File not found: {final_path}")
#
#     with final_path.open("rb") as f:
#         pdf_bytes = f.read()
#
#     encoded = base64.b64encode(pdf_bytes).decode("utf-8")
#
#     return JSONResponse(content={
#         "path": str(final_path),
#         "size": len(pdf_bytes),
#         "pdf_bytes_base64": encoded
#     })



# @app.get("/test-verify")
# def test_verify():
#     message = "Hello-this is a test."
#
#     # Sign the message
#     signature = KEYPAIR.sign(message)
#
#     # Verify the signature
#     is_valid = KEYPAIR.verify(signature, message)
#
#     return {
#         "message": message.decode(),
#         "signature_hex": signature.hex(),  # show as hex for readability
#         "verified": is_valid
#     }


# @app.get("/key")
# def key():
#     keypair = RSAKeyPair.load_or_create_keys()
#     return {"public_key": keypair.get_public_key_pem()}


