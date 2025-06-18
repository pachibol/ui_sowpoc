import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("file")

    if (!fileName) {
      return NextResponse.json({ success: false, message: "File name is required" }, { status: 400 })
    }

    // Construir la ruta del DOCX
    const docxPath = path.join(process.cwd(), "docs", "generated_sows", fileName)

    // Verificar que el archivo existe
    if (!existsSync(docxPath)) {
      return NextResponse.json({ success: false, message: "DOCX file not found" }, { status: 404 })
    }

    // Leer el archivo DOCX
    const docxBuffer = await readFile(docxPath)

    // Devolver el DOCX con headers apropiados para descarga
    return new NextResponse(docxBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error serving DOCX:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error serving DOCX file",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
