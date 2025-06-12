from typing import Optional, List

from fastapi import Request, File, UploadFile, FastAPI, HTTPException, Depends, Form, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import uuid
from dotenv import load_dotenv
import os
from datetime import date, datetime
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Field

from db.case_specified_crud import get_full_name_by_account_id
from db.models.model_deleted_document import DeletedDocument
from notification.notification_service import notify_superusers
from qr_implementation.qr_processing import embed_qr_to_pdf, create_qr_url
from sqlalchemy.orm import Session
from uuid import UUID
from db.database import get_db
from db.models.models_document_record import DocumentRecord
from crypto.crypto import RSAKeyPair
from crypto.url_processing import encrypt_doc_id, decrypt_doc_id
from db.crud import create, get
from api import auth_management, user_management, notification_management
from notification.websocket_routes import router as websocket_router

UPLOAD_DIR = Path("uploads/original")
QR_DIR = Path("uploads/with_qr")
UPLOAD_DIR.mkdir(parents= True, exist_ok=True)
QR_DIR.mkdir(parents= True, exist_ok=True)

app = FastAPI(title="PDF Upload & QR Embedding API")
app.mount("/static", StaticFiles(directory="uploads/with_qr"), name="static")
app.mount("/profile-pics", StaticFiles(directory="uploads/user_profile_pic"), name="profile_pics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # frontend Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_management.router)
app.include_router(user_management.router)
app.include_router(websocket_router)
app.include_router(notification_management.router)

load_dotenv()  # Load .env into os.environ
LOCAL_HOST = os.getenv("LOCAL_HOST")

ALLOWED_EXTENSIONS = {".pdf"}  # Use set for faster lookup

KEYPAIR = RSAKeyPair.load_or_create_keys()


def save_upload_file(upload_file: UploadFile, destination: Path, ) -> Path:
    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        return destination
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")


@app.post("/upload")
async def upload_document(
                        doc_owner_name: str = Form(...),
                        doc_owner_ic: str = Form(...),
                        doc_type: str = Form(...),
                        issuer_name: str = Form(...),
                        issue_date: date = Form(...),
                        file: UploadFile = File(...),
                        issuer_id: int = Form(...),
                        db: Session = Depends(get_db)):
    try:
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

        exists = db.query(DocumentRecord).filter(
            DocumentRecord.doc_owner_ic == doc_owner_ic,
            DocumentRecord.document_type == doc_type
        ).first()

        if exists:
            raise HTTPException(status_code=400, detail="This document type already exists for the owner or is in soft "
                                                        "deleted state. Go to edit page if you are intended to edit"
                                                        "or recover page if you are authorized personnel.")

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

        # Use generic CRUD create operation
        record_data = {
            "doc_record_id": unique_id,
            "doc_owner_name": doc_owner_name,
            "doc_owner_ic": doc_owner_ic,
            "document_type": doc_type,
            "issuer_id" : issuer_id,
            "issuer_name": issuer_name,
            "issue_date": issue_date,
            "hash": hash_result,
            "signature": signature,
            "verification_url": f"/static/{unique_id_str}_processed.pdf", # for direct view the file
            "updated_at": datetime.now(ZoneInfo("Asia/Kuala_Lumpur")),
        }
        create(db, DocumentRecord, record_data)

        # print(unique_id_str)
        # print(encrypted_doc_id)
        return {
            "message": "Upload successful",
            "download_url": f"/download/{encrypted_doc_id}",
        }


    except HTTPException:
        # if HTTPException occur, it won't run into the following line
        # which cause error code together in the toast
        raise

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Backend Error")


@app.get("/download/{encrypted_doc_id}")
def download_file(encrypted_doc_id: str):
    print("Encrypted_doc_id: ", encrypted_doc_id)
    decrypted_doc_id = decrypt_doc_id(KEYPAIR.private_key, encrypted_doc_id)
    print("Decrypted_doc_id: ", decrypted_doc_id)
    # we dont convert the decrypted doc id to uuid like in the verify since our file is saved in uuid.hex() format
    file_path = QR_DIR / f"{decrypted_doc_id}_processed.pdf"

    print(f"Trying to download: {file_path}")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"document.pdf",
        headers={"Content-Disposition": f"attachment; filename=processed_document.pdf"}
    )


@app.get("/view/{encrypted_doc_id}")
def view_file(encrypted_doc_id: str):
    decrypted_doc_id = decrypt_doc_id(KEYPAIR.private_key, encrypted_doc_id)
    # we dont convert the decrypted doc id to uuid like in the verify since our file is saved in uuid.hex() format
    file_path = QR_DIR / f"{decrypted_doc_id}_processed.pdf"

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"document.pdf",
        headers={"Content-Disposition": "inline; filename=document.pdf"},
    )


@app.get("/get-document")
def get_document_records(
    owner_ic: str,
    doc_type: Optional[str] = None,
    page: int = Query(0, ge=0),
    limit: int = Query(10, gt=0),
    db: Session = Depends(get_db)
):
    query = db.query(DocumentRecord).filter(
        DocumentRecord.doc_owner_ic == owner_ic,
        DocumentRecord.is_deleted.is_(False)
    )

    # Check if any document exists for the IC
    if not query.first():
        raise HTTPException(status_code=404, detail="IC not found")

    # Apply filtering by doc_type if given
    if doc_type:
        query = query.filter(DocumentRecord.document_type == doc_type)
        if not query.first():
            raise HTTPException(status_code=404, detail="The document not available for the owner yet")

    total = query.count()

    documents = query.order_by(DocumentRecord.created_at.desc()) \
                     .offset(page * limit) \
                     .limit(limit) \
                     .all()

    target_data = [
        {
            "doc_record_id": doc.doc_record_id,
            "doc_encrypted_id": encrypt_doc_id(KEYPAIR.public_key, doc.doc_record_id.hex),
            "doc_owner_name": doc.doc_owner_name,
            "doc_owner_ic": doc.doc_owner_ic,
            "document_type": doc.document_type,
            "issuer_id": doc.issuer_id,
            "issuer_name": doc.issuer_name,
            "issue_date": doc.issue_date,
            "verification_url": doc.verification_url,
            "created_at": doc.created_at,
            "updated_at": doc.updated_at,
        }
        for doc in documents
    ]

    return JSONResponse(content=jsonable_encoder({
        "total": total,
        "documents": target_data
    }))


@app.get("/get-soft-deleted-document")
def get_soft_deleted_document_records(
    owner_ic: Optional[str] = None,
    doc_type: Optional[str] = None,
    page: int = Query(0, ge=0),
    limit: int = Query(10, gt=0),
    db: Session = Depends(get_db)
):
    query = db.query(DocumentRecord).filter(DocumentRecord.is_deleted.is_(True))

    if owner_ic:
        query = query.filter(DocumentRecord.doc_owner_ic == owner_ic)
        # if not query.first():
        #     raise HTTPException(status_code=404, detail="IC not found")

    if doc_type:
        query = query.filter(DocumentRecord.document_type == doc_type)
        # if not query.first():
        #     if owner_ic:
        #         raise HTTPException(status_code=404, detail="The document not found in soft deleted state for the owner")
        #     else:
        #         raise HTTPException(status_code=404, detail="No relevant document record found in soft deleted state")
    total = query.order_by(None).count()

    if total == 0:
        if owner_ic and doc_type:
            raise HTTPException(status_code=404,
                                detail="No soft-deleted documents found for the given IC and document type")
        elif owner_ic:
            raise HTTPException(status_code=404, detail="IC not found or no soft-deleted documents")
        else:
            raise HTTPException(status_code=404, detail="No soft-deleted documents found")

    documents = query.order_by(DocumentRecord.deleted_at.desc()) \
                     .offset(page * limit) \
                     .limit(limit) \
                     .all()

    target_data = [
        {
            "doc_record_id": doc.doc_record_id,
            "doc_encrypted_id": encrypt_doc_id(KEYPAIR.public_key, doc.doc_record_id.hex),
            "doc_owner_name": doc.doc_owner_name,
            "doc_owner_ic": doc.doc_owner_ic,
            "document_type": doc.document_type,
            "issuer_id": doc.issuer_id,
            "issuer_name": doc.issuer_name,
            "issue_date": doc.issue_date,
            "verification_url": doc.verification_url,
            "deleted_by": doc.deleted_by,
            "deleted_by_name": get_full_name_by_account_id(db, doc.deleted_by),
            "deleted_at": doc.deleted_at,
        }
        for doc in documents
    ]

    return JSONResponse(content=jsonable_encoder({
        "total": total,
        "documents": target_data
    }))


@app.get("/get-processed-docs")
def get_processed_docs(issuer_id: str,
                      limit: int = 10,
                      doc_type: Optional[str] = None,
                      db: Session = Depends(get_db)):
    has_any_documents = db.query(DocumentRecord).filter(
        DocumentRecord.issuer_id == issuer_id
    ).first()

    # what if new logged in user hasn't has a record yet?
    if not has_any_documents:
        raise HTTPException(status_code=404, detail="User account has not process any document yet")

    query = db.query(DocumentRecord).filter(DocumentRecord.issuer_id == issuer_id)

    if doc_type:
        query = query.filter(DocumentRecord.document_type == doc_type)

    documents = query.order_by(DocumentRecord.created_at.desc()).limit(limit).all()
    # what if the user hasn't process the relevant document yet?
    if not documents:
        raise HTTPException(status_code=404, detail="No relevant document found")

    target_data = [
        {
            "doc_record_id": doc.doc_record_id,
            "doc_encrypted_id": encrypt_doc_id(KEYPAIR.public_key, doc.doc_record_id.hex),
            "doc_owner_name": doc.doc_owner_name,
            "doc_owner_ic": doc.doc_owner_ic,
            "document_type": doc.document_type,
            "issuer_id": doc.issuer_id,
            "issuer_name": doc.issuer_name,
            "issue_date": doc.issue_date,
            "verification_url": doc.verification_url,
            "created_at": doc.created_at,
            "updated_at": doc.updated_at,
        }
        for doc in documents
    ]

    return JSONResponse(content=jsonable_encoder(target_data))


@app.post("/verify")
async def verify_document(encrypted_doc_id: str = Form(...),
                          file: UploadFile = File(...),
                          db: Session = Depends(get_db)):
    # decrypt the token (doc_id in url)
    decrypted_doc_id = decrypt_doc_id(KEYPAIR.private_key, encrypted_doc_id)
    try:
        # the decrypted token is in str (UUID.hex), so we convert it back to UUID object
        # this is to get the doc_id column, while other fields we remain using uuid.hex
        doc_id = UUID(decrypted_doc_id)
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
    else:
        return JSONResponse({
            "status": "invalid",
            "message": "The document is altered or not signed by this system.",
            "reason": "Hash mismatch or signature verification failed."
        })


@app.delete("/delete/{encrypted_doc_id}")
async def delete_document(encrypted_doc_id: str,
                          account_id: str,
                          db: Session = Depends(get_db)):
    # decrypt the token (doc_id in url)
    decrypted_doc_id = decrypt_doc_id(KEYPAIR.private_key, encrypted_doc_id)
    try:
        # the decrypted token is in str (UUID.hex), so we convert it back to UUID object
        # this is to get the doc_id column, while other fields we remain using uuid.hex
        doc_id = UUID(decrypted_doc_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid token format")

    document = get(db, DocumentRecord, doc_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Create record in notification table via notify_superusers function
    acc_name = get_full_name_by_account_id(db, account_id)
    message = (f"{acc_name}(ID: {account_id}) has deleted {document.document_type}(owner: {document.doc_owner_ic}). "
               f"Recover it if it is a mistake.")
    notify_superusers(message, db)

    # update DocumentRecord db (soft delete)
    document.is_deleted = True
    document.deleted_by = account_id
    document.deleted_at = datetime.now(ZoneInfo("Asia/Kuala_Lumpur"))
    db.commit()

    return JSONResponse({
        "status": "Deleted",
        "delete doc": encrypted_doc_id,
        "deleted by": account_id,
    })


class RecoverRequest(BaseModel):
    encrypted_doc_ids: List[str] = Field(..., min_items=1)
    account_id: str = Field(..., min_length=1)


@app.post("/recover-documents")
async def recover_documents(payload: RecoverRequest, db: Session = Depends(get_db)):
    recover_list = []
    encrypted_doc_ids = payload.encrypted_doc_ids
    for encrypted_id in encrypted_doc_ids:
        decrypted_doc_id = decrypt_doc_id(KEYPAIR.private_key, encrypted_id)
        try:
            doc_id = UUID(decrypted_doc_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid token format")

        doc = db.query(DocumentRecord).filter_by(doc_record_id=doc_id).first()
        if doc:
            doc.is_deleted = False
            doc.deleted_at = None
            doc.deleted_by = None
            recover_list.append({"document_type": doc.document_type,
                                "doc_owner_ic": doc.doc_owner_ic})

    db.commit()
    account_id = payload.account_id
    acc_name = get_full_name_by_account_id(db, account_id)
    if len(recover_list) < 4:
        recovered_info = "\n".join(
            f"{i+1}. {item['document_type']} for ({item['doc_owner_ic']})"
            for i,item in enumerate(recover_list)
        )
        message = (
            f"{acc_name} (ID: {account_id}) has recovered the following document(s):\n{recovered_info}\n"
            f"from soft deleted state."
        )

    else:
        message = (
            f"{acc_name} (ID: {account_id}) has recovered {len(recover_list)} from soft deleted state."
        )

    notify_superusers(message, db)
    return {"status": "success", "recovered": len(encrypted_doc_ids),
            "message": f"{len(encrypted_doc_ids)} has been successfully recovered"}


@app.post("/check-conflict/{encrypted_doc_id}")
async def check_document_conflict(encrypted_doc_id: str, request: Request, db: Session = Depends(get_db)):
    decrypted_doc_id = decrypt_doc_id(KEYPAIR.private_key, encrypted_doc_id)
    try:
        doc_id = UUID(decrypted_doc_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid token format")

    document = get(db, DocumentRecord, doc_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    request_data = await request.json()
    print("request data: ", request_data)

    # if the request_data does contain changed file (doc_owner_ic), then we use it
    # else we fall back to the original document's doc_owner_ic
    doc_owner_ic = request_data.get("doc_owner_ic", document.doc_owner_ic) # noqa
    doc_type = request_data.get("document_type", document.document_type) # noqa

    print("owner ic: ", doc_owner_ic)
    print("doc type: ", doc_type)
    print("DocumentRecord.doc_owner_ic", DocumentRecord.doc_owner_ic)
    print("DocumentRecord.document_type", DocumentRecord.document_type)

    existing_doc = db.query(DocumentRecord).filter(
        DocumentRecord.doc_owner_ic == doc_owner_ic,
        DocumentRecord.document_type == doc_type,
        DocumentRecord.doc_record_id != document.doc_record_id
    ).first()

    print("existing doc:", existing_doc)

    if existing_doc:
        if existing_doc.is_deleted:
            return JSONResponse(
                status_code=409,
                content={
                    "status": "soft_deleted_conflict",
                    "message": "A soft-deleted document of this type already exists for this owner.",
                }
            )
        else:
            return JSONResponse(
                status_code=409,
                content={
                    "status": "conflict",
                    "message": "An active document of this type already exists for this owner.",
                }
            )

    return JSONResponse({"status": "ok"})


@app.patch("/edit/{encrypted_doc_id}")
async def edit_document(encrypted_doc_id: str, request: Request,
                        account_id: str, db: Session = Depends(get_db)):
    decrypted_doc_id = decrypt_doc_id(KEYPAIR.private_key, encrypted_doc_id)
    try:
        doc_id = UUID(decrypted_doc_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid token format")

    document = get(db, DocumentRecord, doc_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # fastapi request is not a dict directly, need .json() to extract the body
    # must use await, else the return will be a coroutine, rather than JSON body
    # so function will need to change to async as well.
    request_data = await request.json()

    status = request_data.get("status", "ok") # noqa
    doc_owner_ic = request_data.get("doc_owner_ic", document.doc_owner_ic)  # noqa
    doc_type = request_data.get("document_type", document.document_type)  # noqa
    editable_fields = ["doc_owner_name", "doc_owner_ic", "document_type"]

    if status == "soft_delete_conflict":
        existing = (
            db.query(DocumentRecord)
            .filter(DocumentRecord.doc_owner_ic == doc_owner_ic,
                    DocumentRecord.document_type == doc_type,
                    DocumentRecord.is_deleted.is_(True),
                    DocumentRecord.doc_record_id != document.doc_record_id
            ).first()
        )
        if existing:
            delete_document_files(existing.doc_record_id.hex)
            deleted_document_record = {
                "doc_owner_ic": existing.doc_owner_ic,
                "issue_date": existing.issue_date,
                "document_type": existing.document_type,
                "deleted_by": int(account_id)
            }
            create(db, DeletedDocument, deleted_document_record)
            acc_name = get_full_name_by_account_id(db, account_id)
            message = (
                f"{acc_name} (ID: {account_id}) replaced a soft-deleted {existing.document_type} "
                f"for {existing.doc_owner_ic}, the new version is originally {document.document_type} for "
                f"{document.doc_owner_ic}. The old version has been permanently deleted and cannot be recovered."
            )

            notify_superusers(message, db)
            db.delete(existing)
            db.commit()

    for field in editable_fields:
        if field in request_data:
            # data[field] only accessible when it is JSON body
            setattr(document, field, request_data[field])

    if document.issuer_id != int(account_id):
        document.issuer_id = int(account_id)
        document.issuer_name = get_full_name_by_account_id(db, account_id)

    document.updated_at = datetime.now(ZoneInfo("Asia/Kuala_Lumpur"))

    # apply on document recovery
    # if document.is_deleted:
    #     document.is_deleted = False
    #     document.deleted_at = None
    #     document.deleted_by = None

    db.commit()

    return JSONResponse({
        "status": "success"
    })


def delete_document_files(decrypted_doc_id: str):
    # we use uuid.hex here as the file is stored in this format
    original_doc = UPLOAD_DIR / f"{decrypted_doc_id}.pdf"
    qr_embedded_doc = QR_DIR / f"{decrypted_doc_id}_processed.pdf"

    # Delete original document if it exists
    try:
        if original_doc.exists():
            original_doc.unlink()
    except Exception as e:
        print(f"Failed to delete original doc: {e}")

    # Delete QR-embedded document if it exists
    try:
        if qr_embedded_doc.exists():
            qr_embedded_doc.unlink()
    except Exception as e:
        print(f"Failed to delete the QR-embedded doc: {e}")


@app.get("/")
def root():
    return {"status": "OK", "message": "PDF upload and QR embedding API is ready."}



