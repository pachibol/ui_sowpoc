import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import mammoth from "mammoth"

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json({ success: false, message: "File path is required" }, { status: 400 })
    }

    // Construir la ruta completa del archivo
    const fullPath = path.join(process.cwd(), "docs", "generated_sows", filePath)
    console.log("Processing DOCX file at path:", fullPath)

    // Verificar que el archivo existe
    if (!existsSync(fullPath)) {
      console.error("File not found at path:", fullPath)
      return NextResponse.json(
        {
          success: false,
          message: `File not found at path: ${fullPath}`,
          debug: {
            requestedPath: filePath,
            fullPath: fullPath,
            exists: false,
          },
        },
        { status: 404 },
      )
    }

    // Leer el archivo DOCX
    console.log("Reading DOCX file...")
    const buffer = await readFile(fullPath)
    console.log("File read successfully, size:", buffer.length, "bytes")

    // Convertir DOCX a HTML usando mammoth con opciones para mejor fidelidad
    console.log("Converting DOCX to HTML...")
    const result = await mammoth.convertToHtml({
      buffer,
      options: {
        // Preservar estilos tanto como sea posible
        includeDefaultStyleMap: true,
        includeEmbeddedStyleMap: true,
        // Convertir imágenes a data URLs si las hay
        convertImage: mammoth.images.imgElement((image) =>
          image.read("base64").then((imageBuffer) => ({
            src: "data:" + image.contentType + ";base64," + imageBuffer,
          })),
        ),
      },
    })

    const htmlContent = result.value
    console.log("HTML conversion successful, length:", htmlContent.length)
    console.log("Mammoth messages:", result.messages)

    return NextResponse.json({
      success: true,
      html: htmlContent,
      messages: result.messages,
      debug: {
        htmlLength: htmlContent.length,
        filePath: fullPath,
        fileSize: buffer.length,
      },
    })
  } catch (error) {
    console.error("Detailed error processing DOCX file:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error processing DOCX file",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        debug: {
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}
