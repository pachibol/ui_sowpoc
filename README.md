# 🧾 SOW Wizard Interface

Una interfaz en React + Next.js para generar documentos SOW (Statement of Work) automáticamente.

---

## 📦 Requisitos

- Node.js (v18+ recomendado)
- Python 3.8+
- pip
- npm o yarn

---

## 🚀 Frontend: Next.js

### Instalación

\`\`\`bash
npm install docx mammoth puppeteer --legacy-peer-deps
\`\`\`

Also run:

\`\`\`bash
npm audit fix --force
\`\`\`

## LibreOffice installation

Please read and follow steps in LIBREOFFICE_SETUP.md


## Test Backend (FastAPI)

Se puede opcionalmente levantar un endpoint para probar la integración con el frontend:

Instalar dependencias:

\`\`\`bash
pip install -r requirements.txt
\`\`\`

Levantar endpoint:

\`\`\`bash
python test_endpoint.py
\`\`\`

Este endpoint devolverá valores mockeados junto con las variables enviadas desde el request.


## Ejecución

En otra terminal, ejecutar:

\`\`\`bash
npm run dev
\`\`\`

Abrir browser en:

http://localhost:3000



### Estructura del Payload

Request de ejemplo:
\`\`\`json
{
  "contract_type": "time_and_materials",
  "filenames": ["document1.pptx", "document2.pptx"]
}
\`\`\`

Response:
\`\`\`json
{
"sow_text": "Generated SOW text.",
}

\`\`\`
