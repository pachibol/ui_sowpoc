import { NextResponse } from "next/server"
import { readdir, stat } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function GET() {
  try {
    const docsPath = path.join(process.cwd(), "docs")

    // Si el directorio no existe, devolver array vacío
    if (!existsSync(docsPath)) {
      return NextResponse.json({ files: [] })
    }

    const files = await readdir(docsPath)

    // Filtrar solo archivos PPTX y obtener información de cada uno
    const fileData = await Promise.all(
      files
        .filter((file) => file.toLowerCase().endsWith(".pptx"))
        .map(async (file) => {
          const filePath = path.join(docsPath, file)
          const stats = await stat(filePath)

          return {
            name: file,
            path: `/docs/${file}`,
            size: `${Math.round(stats.size / 1024)} KB`,
            lastModified: stats.mtime.toISOString().split("T")[0],
            type: "presentation",
          }
        }),
    )

    return NextResponse.json({ files: fileData })
  } catch (error) {
    console.error("Error reading files:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error reading files",
      },
      { status: 500 },
    )
  }
}
