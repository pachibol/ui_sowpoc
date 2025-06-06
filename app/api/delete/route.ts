import { type NextRequest, NextResponse } from "next/server"
import { unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (!filename) {
      return NextResponse.json({ success: false, message: "Filename is required" }, { status: 400 })
    }

    // Construir la ruta completa del archivo
    const docsPath = path.join(process.cwd(), "docs")
    const filePath = path.join(docsPath, filename)

    // Verificar que el archivo existe
    if (!existsSync(filePath)) {
      return NextResponse.json({ success: false, message: "File not found" }, { status: 404 })
    }

    // Verificar que el archivo está dentro del directorio docs (seguridad)
    if (!filePath.startsWith(docsPath)) {
      return NextResponse.json({ success: false, message: "Invalid file path" }, { status: 400 })
    }

    // Borrar el archivo
    await unlink(filePath)

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting file",
      },
      { status: 500 },
    )
  }
}
