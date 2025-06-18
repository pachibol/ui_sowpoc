import { type NextRequest, NextResponse } from "next/server"
import { readFile, writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import mammoth from "mammoth"
import puppeteer from "puppeteer"

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json({ success: false, message: "File path is required" }, { status: 400 })
    }

    // Construir rutas
    const docxPath = path.join(process.cwd(), "docs", "generated_sows", filePath)
    const convertedDir = path.join(process.cwd(), "docs", "converted_to_pdf")
    const pdfFileName = filePath.replace(/\.docx$/i, ".pdf")
    const pdfPath = path.join(convertedDir, pdfFileName)

    console.log("Converting DOCX to PDF:", { docxPath, pdfPath })

    // Verificar que el archivo DOCX existe
    if (!existsSync(docxPath)) {
      console.error("DOCX file not found at path:", docxPath)
      return NextResponse.json(
        {
          success: false,
          message: `DOCX file not found at path: ${docxPath}`,
        },
        { status: 404 },
      )
    }

    // Crear directorio de PDFs convertidos si no existe
    if (!existsSync(convertedDir)) {
      await mkdir(convertedDir, { recursive: true })
      console.log("Created converted_to_pdf directory")
    }

    // Verificar si el PDF ya existe
    if (existsSync(pdfPath)) {
      console.log("PDF already exists, returning existing file")
      return NextResponse.json({
        success: true,
        pdfPath: pdfFileName,
        message: "PDF already exists",
      })
    }

    // Leer y convertir DOCX a HTML
    console.log("Reading DOCX file...")
    const buffer = await readFile(docxPath)

    console.log("Converting DOCX to HTML...")
    const result = await mammoth.convertToHtml({
      buffer,
      options: {
        includeDefaultStyleMap: true,
        includeEmbeddedStyleMap: true,
        convertImage: mammoth.images.imgElement((image) =>
          image.read("base64").then((imageBuffer) => ({
            src: "data:" + image.contentType + ";base64," + imageBuffer,
          })),
        ),
      },
    })

    const htmlContent = result.value
    console.log("HTML conversion successful, length:", htmlContent.length)

    // Crear HTML completo con estilos para PDF
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            margin: 1in;
            color: #000;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #000;
            margin-top: 1em;
            margin-bottom: 0.5em;
        }
        h1 { font-size: 18pt; font-weight: bold; }
        h2 { font-size: 16pt; font-weight: bold; }
        h3 { font-size: 14pt; font-weight: bold; }
        p { margin-bottom: 1em; }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }
        th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        ul, ol {
            margin: 1em 0;
            padding-left: 2em;
        }
        li {
            margin-bottom: 0.5em;
        }
        strong, b {
            font-weight: bold;
        }
        em, i {
            font-style: italic;
        }
        @page {
            margin: 1in;
            size: letter;
        }
        @media print {
            body { margin: 0; }
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`

    // Convertir HTML a PDF usando Puppeteer
    console.log("Launching Puppeteer...")
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    try {
      const page = await browser.newPage()
      await page.setContent(fullHtml, { waitUntil: "networkidle0" })

      console.log("Generating PDF...")
      const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
          top: "1in",
          right: "1in",
          bottom: "1in",
          left: "1in",
        },
        printBackground: true,
      })

      // Guardar PDF
      await writeFile(pdfPath, pdfBuffer)
      console.log("PDF saved successfully:", pdfPath)

      return NextResponse.json({
        success: true,
        pdfPath: pdfFileName,
        message: "PDF converted successfully",
        debug: {
          docxPath,
          pdfPath,
          htmlLength: htmlContent.length,
          pdfSize: pdfBuffer.length,
        },
      })
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error("Detailed error converting DOCX to PDF:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error converting DOCX to PDF",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
