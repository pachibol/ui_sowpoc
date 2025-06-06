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

```bash
npm install docx --legacy-peer-deps
```

## Test Endpoint

Se puede opcionalmente levantar un endpoint para probar la integración con el frontend:

```bash
python test_endpoint.py
```

Este endpoint devolverá valores mockeados junto con las variables enviadas desde el request.

### Estructura del Payload

Request de ejemplo:
```json
{
  "contract_type": "time_and_materials",
  "filenames": ["document1.pptx", "document2.pptx"]
}
```

Response:
```json
{
"sow_text": "Generated SOW text.",
}

```

