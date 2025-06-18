import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { getDocumentPaths, ensureDocumentDirectories } from "@/lib/document-paths"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, message: "No file received" }, { status: 400 })
    }

    // Asegurar que los directorios existen
    await ensureDocumentDirectories()

    const paths = getDocumentPaths()
    const inputPath = paths.input

    // Obtener extensiones permitidas desde la configuración
    const allowedExtensions = process.env.NEXT_PUBLIC_ALLOWED_FILE_EXTENSIONS?.split(",").map((ext) =>
      ext.trim().toLowerCase(),
    ) || ["pptx"]
    const maxFileSizeMB = Number.parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "50")
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024

    // Verificar el tamaño del archivo
    if (file.size > maxFileSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          message: `File size exceeds the maximum limit of ${maxFileSizeMB}MB`,
        },
        { status: 400 },
      )
    }

    // Verificar que sea un archivo con extensión permitida
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      const allowedExtensionsText = allowedExtensions.map((ext) => ext.toUpperCase()).join(", ")
      return NextResponse.json(
        {
          success: false,
          message: `Only ${allowedExtensionsText} files are allowed`,
        },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

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

    const { filename, fullPath } = generateUniqueFilename(file.name, inputPath)

    // Escribir el archivo al sistema de archivos
    await writeFile(fullPath, buffer)

    // Obtener información del archivo
    const stats = await import("fs").then((fs) => fs.promises.stat(fullPath))

    // Determinar el tipo de archivo basado en la extensión
    const getFileType = (extension: string) => {
      switch (extension.toLowerCase()) {
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

    const fileData = {
      name: filename,
      path: `/input/${filename}`,
      size: `${Math.round(stats.size / 1024)} KB`,
      lastModified: new Date().toISOString().split("T")[0],
      type: getFileType(fileExtension),
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
