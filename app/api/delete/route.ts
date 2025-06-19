import { type NextRequest, NextResponse } from "next/server"
import { unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { getDocumentPaths } from "@/lib/document-paths"

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (!filename) {
      return NextResponse.json({ success: false, message: "Filename is required" }, { status: 400 })
    }

    // Obtener paths configurables
    const paths = getDocumentPaths()

    // Buscar el archivo en la carpeta de input (donde se suben los archivos)
    const filePath = path.join(paths.input, filename)

    console.log("Attempting to delete file:", filePath)

    // Verificar que el archivo existe
    if (!existsSync(filePath)) {
      console.log("File not found at:", filePath)
      return NextResponse.json({ success: false, message: "File not found" }, { status: 404 })
    }

    // Verificar que el archivo está dentro del directorio input (seguridad)
    if (!filePath.startsWith(paths.input)) {
      console.log("Invalid file path - outside input directory:", filePath)
      return NextResponse.json({ success: false, message: "Invalid file path" }, { status: 400 })
    }

    // Borrar el archivo
    await unlink(filePath)
    console.log("File deleted successfully:", filePath)

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
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
