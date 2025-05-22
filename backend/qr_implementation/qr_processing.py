from pathlib import Path
import qrcode
import io
import fitz
from fastapi import HTTPException


def create_qr_url(domain: str, encrypted_token: str) -> str:
    return f"{domain}/verify?token={encrypted_token}"


def embed_qr_to_pdf(pdf_path: Path, output_path: Path, qr_data: str,
                    x_offset: int = 20, y_offset: int = 20, qr_size: int = 50):
    try:
        # Generate QR code image
        qr_img = qrcode.make(qr_data)
        img_byte_arr = io.BytesIO()
        qr_img.save(img_byte_arr, format="PNG")
        qr_bytes = img_byte_arr.getvalue()

        # Load PDF and insert QR code into first page
        doc = fitz.open(pdf_path)
        page = doc[0]

        page_width = page.rect.width
        page_height = page.rect.height

        # Place QR at (right - x_offset, y_offset)
        x1 = page_width - x_offset
        y1 = y_offset + qr_size
        x0 = x1 - qr_size
        y0 = y1 - qr_size

        rect = fitz.Rect(x0, y0, x1, y1)
        page.insert_image(rect, stream=qr_bytes)
        doc.save(output_path)
        doc.close()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"QR embedding failed: {e}")