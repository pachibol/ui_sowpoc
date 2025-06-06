from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import os
import uvicorn
from urllib.parse import urlparse

# Cargar el mismo archivo que usa Next.js
load_dotenv(".env.local")

API_KEY = os.getenv("NEXT_PUBLIC_API_KEY")
FULL_ENDPOINT = os.getenv("NEXT_PUBLIC_API_ENDPOINT")

# Extraer solo el path (ej: /generate_sow) desde la URL
API_PATH = urlparse(FULL_ENDPOINT).path

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Podés restringir si querés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DocumentRequest(BaseModel):
    contract_type: str
    filenames: List[str]

class SowResponse(BaseModel):
    sow_text: str

@app.post(API_PATH, response_model=SowResponse)
async def extract_sow(
    request: DocumentRequest,
    authorization: Optional[str] = Header(None)
):
    expected_auth = f"Bearer {API_KEY}"
    if authorization != expected_auth:
        raise HTTPException(status_code=401, detail="Invalid or missing API Key")

    mock_sow = (
        "## Statement of Work (SOW)\n"
        f"**Contract Type:** {request.contract_type}\n\n"
        "Este es un contenido simulado del SOW.\n"
        "- Alcance: Desarrollo de backend.\n"
        "- Duración: 2 semanas.\n"
        "- Entregables: Código, Documentación, Soporte.\n\n"
        f"Archivos procesados: {', '.join(request.filenames)}"
    )
    return SowResponse(sow_text=mock_sow)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
