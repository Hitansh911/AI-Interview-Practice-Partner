import io
from pypdf import PdfReader

def extract_text_from_pdf(pdf_bytes: bytes) -> tuple[str, int]:
    """Extract raw text from PDF file bytes using pypdf."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    num_pages = len(reader.pages)
    extracted_text = []

    for page in reader.pages:
        text = page.extract_text()
        if text:
            extracted_text.append(text)

    full_text = "\n".join(extracted_text).strip()
    return full_text, num_pages