import { NextResponse } from "next/server"
import { readdir, stat } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { getDocumentPaths, ensureDocumentDirectories } from "@/lib/document-paths"

export async function GET() {
  try {
    // Asegurar que los directorios existen
    await ensureDocumentDirectories()

    const paths = getDocumentPaths()
    const inputPath = paths.input

    // Verificar si el directorio input existe
    if (!existsSync(inputPath)) {
      return NextResponse.json({ files: [] })
    }

    // Obtener extensiones permitidas desde la configuración
    const allowedExtensions = process.env.NEXT_PUBLIC_ALLOWED_FILE_EXTENSIONS?.split(",").map((ext) =>
      ext.trim().toLowerCase(),
    ) || ["pptx"]

    const files = await readdir(inputPath)

    // Filtrar archivos por extensiones permitidas y obtener información
    const fileData = await Promise.all(
      files
        .filter((file) => {
          const extension = file.split(".").pop()?.toLowerCase()
          return extension && allowedExtensions.includes(extension)
        })
        .map(async (file) => {
          const filePath = path.join(inputPath, file)
          const stats = await stat(filePath)
          const extension = file.split(".").pop()?.toLowerCase() || ""

          // Determinar el tipo de archivo basado en la extensión
          const getFileType = (ext: string) => {
            switch (ext.toLowerCase()) {
              case "pptx":
              case "ppt":
                return "presentation"
              case "pdf":
                return "pdf"
              case "docx":
              case "doc":
                return "document"
              case "xlsx":
              case "xls":
                return "spreadsheet"
              default:
                return "file"
            }
          }

          return {
            name: file,
            path: `/input/${file}`,
            size: `${Math.round(stats.size / 1024)} KB`,
            lastModified: stats.mtime.toISOString().split("T")[0],
            type: getFileType(extension),
          }
        }),
    )

    return NextResponse.json({ files: fileData })
  } catch (error) {
    console.error("Error reading files:", error)
    return NextResponse.json({ success: false, message: "Error reading files from input directory" }, { status: 500 })
  }
}
