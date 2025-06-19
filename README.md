# 🧾 SOW Wizard Interface

A React + Next.js interface for automatically generating SOW (Statement of Work) documents.

---

## 📦 Requirements

- Node.js (v18+ recommended)
- Python 3.8+
- pip
- npm o yarn

---

## 🚀 Frontend: Next.js

### Install

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

You can also optionally set up a mocked endpoint to test integration.

Install dependencies:

\`\`\`bash
pip install -r requirements.txt
\`\`\`

Activate endpoint:

\`\`\`bash
python test_endpoint.py
\`\`\`

## Execution

In another terminal, run:

\`\`\`bash
npm run dev
\`\`\`

Open browser in:

http://localhost:3000


## Example payload

Request:

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
"sow_file": "generated_sow.docx"
}

\`\`\`
