import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, message: "No file received" }, { status: 400 })
    }

    // Verificar que sea un archivo PPTX
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (fileExtension !== "pptx") {
      return NextResponse.json({ success: false, message: "Only PPTX files are allowed" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Crear el directorio docs si no existe
    const docsPath = path.join(process.cwd(), "docs")
    if (!existsSync(docsPath)) {
      await mkdir(docsPath, { recursive: true })
    }

    // Generar nombre único si el archivo ya existe
    const generateUniqueFilename = (originalName: string, directory: string) => {
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf("."))
      const extension = originalName.substring(originalName.lastIndexOf("."))

      let counter = 0
      let newName = originalName
      let filePath = path.join(directory, newName)

      while (existsSync(filePath)) {
        counter++
        newName = `${nameWithoutExt}_${counter}${extension}`
        filePath = path.join(directory, newName)
      }

      return { filename: newName, fullPath: filePath }
    }

    const { filename, fullPath } = generateUniqueFilename(file.name, docsPath)

    // Escribir el archivo al sistema de archivos
    await writeFile(fullPath, buffer)

    // Obtener información del archivo
    const stats = await import("fs").then((fs) => fs.promises.stat(fullPath))

    const fileData = {
      name: filename,
      path: `/docs/${filename}`,
      size: `${Math.round(stats.size / 1024)} KB`,
      lastModified: new Date().toISOString().split("T")[0],
      type: "presentation",
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      file: fileData,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error uploading file",
      },
      { status: 500 },
    )
  }
}
