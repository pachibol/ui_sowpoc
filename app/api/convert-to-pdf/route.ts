import { type NextRequest, NextResponse } from "next/server"
import { readFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { detectLibreOffice, convertDocxToPdf } from "@/lib/libreoffice-utils"

// Cache para la detección de LibreOffice (evitar detectar en cada request)
let libreOfficeCache: { path: string; version?: string; available: boolean } | null = null

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

    // Detectar LibreOffice (usar cache si está disponible)
    if (!libreOfficeCache) {
      console.log("Detecting LibreOffice installation...")
      libreOfficeCache = await detectLibreOffice()
    }

    if (!libreOfficeCache.available) {
      console.error("LibreOffice not found on system")
      return NextResponse.json(
        {
          success: false,
          message: "LibreOffice is not installed or not found",
          error: "LibreOffice not available",
          help: {
            macOS: "Install with: brew install --cask libreoffice",
            linux: "Install with: sudo apt install libreoffice",
            windows: "Download from: https://www.libreoffice.org/download/",
          },
        },
        { status: 500 },
      )
    }

    console.log(`Using LibreOffice at: ${libreOfficeCache.path}`)
    console.log(`LibreOffice version: ${libreOfficeCache.version}`)

    // Convertir DOCX a PDF usando LibreOffice
    console.log("Starting LibreOffice conversion...")

    try {
      await convertDocxToPdf(libreOfficeCache.path, docxPath, convertedDir)
      console.log("LibreOffice conversion completed")
    } catch (execError) {
      console.error("LibreOffice execution error:", execError)

      // Limpiar cache en caso de error (puede que la instalación haya cambiado)
      libreOfficeCache = null

      return NextResponse.json(
        {
          success: false,
          message: "Error executing LibreOffice conversion",
          error: execError instanceof Error ? execError.message : "Unknown execution error",
          debug: {
            libreOfficePath: libreOfficeCache?.path,
            command: "LibreOffice conversion",
          },
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
            libreOfficePath: libreOfficeCache.path,
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
        libreOfficePath: libreOfficeCache.path,
        version: libreOfficeCache.version,
      },
    })
  } catch (error) {
    console.error("Detailed error converting DOCX to PDF:", error)

    // Limpiar cache en caso de error general
    libreOfficeCache = null

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
