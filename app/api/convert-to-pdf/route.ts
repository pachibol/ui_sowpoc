import { type NextRequest, NextResponse } from "next/server"
import { readFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

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

    console.log("Converting DOCX to PDF with LibreOffice:", { docxPath, pdfPath })

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

    // Verificar que LibreOffice está disponible
    try {
      await execAsync("libreoffice --version")
      console.log("LibreOffice is available")
    } catch (error) {
      console.error("LibreOffice not found:", error)
      return NextResponse.json(
        {
          success: false,
          message: "LibreOffice is not installed or not available in PATH",
          error: "LibreOffice not found",
        },
        { status: 500 },
      )
    }

    // Convertir DOCX a PDF usando LibreOffice
    console.log("Starting LibreOffice conversion...")
    const command = `libreoffice --headless --convert-to pdf --outdir "${convertedDir}" "${docxPath}"`

    console.log("Executing command:", command)

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000, // 30 segundos timeout
      })

      console.log("LibreOffice stdout:", stdout)
      if (stderr) {
        console.log("LibreOffice stderr:", stderr)
      }
    } catch (execError) {
      console.error("LibreOffice execution error:", execError)
      return NextResponse.json(
        {
          success: false,
          message: "Error executing LibreOffice conversion",
          error: execError instanceof Error ? execError.message : "Unknown execution error",
        },
        { status: 500 },
      )
    }

    // Verificar que el PDF fue creado
    if (!existsSync(pdfPath)) {
      console.error("PDF was not created at expected path:", pdfPath)
      return NextResponse.json(
        {
          success: false,
          message: "PDF conversion failed - file was not created",
          debug: {
            expectedPath: pdfPath,
            docxPath,
            convertedDir,
          },
        },
        { status: 500 },
      )
    }

    // Obtener información del archivo PDF creado
    const pdfStats = await readFile(pdfPath)
    console.log("PDF created successfully, size:", pdfStats.length, "bytes")

    return NextResponse.json({
      success: true,
      pdfPath: pdfFileName,
      message: "PDF converted successfully with LibreOffice",
      debug: {
        docxPath,
        pdfPath,
        pdfSize: pdfStats.length,
        method: "LibreOffice",
      },
    })
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
