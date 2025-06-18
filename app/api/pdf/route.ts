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

    // Construir la ruta del PDF
    const pdfPath = path.join(process.cwd(), "docs", "converted_to_pdf", fileName)

    // Verificar que el archivo existe
    if (!existsSync(pdfPath)) {
      return NextResponse.json({ success: false, message: "PDF file not found" }, { status: 404 })
    }

    // Leer el archivo PDF
    const pdfBuffer = await readFile(pdfPath)

    // Devolver el PDF con headers apropiados
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error serving PDF:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error serving PDF file",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
