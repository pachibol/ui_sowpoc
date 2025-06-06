from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = "9nRSXJ6Orw0r5vjeV5HXsgOwBjjMd2rGkeBoznDIVpcg2KX4rdbKdOBHqxiHWU9OMa1NSzXihT7gQ56BIkP18XCaV3lA6EcwSvIzblAAk93MdihRtvCClcsES63ZnOox"

class DocumentRequest(BaseModel):
    contract_type: str
    filenames: List[str]

# Response schema
class SowResponse(BaseModel):
    sow_text: str

@app.post("/extract_sow", response_model=SowResponse)
async def extract_sow(
    request: DocumentRequest,
    authorization: Optional[str] = Header(None)
):
    # Verificación de API key
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