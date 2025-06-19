import { type NextRequest, NextResponse } from "next/server"
import { writeFile, unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { getDocumentPaths, ensureDocumentDirectories } from "@/lib/document-paths"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractType, selectedDocuments } = body

    if (!contractType || !selectedDocuments || selectedDocuments.length === 0) {
      return NextResponse.json(
        { success: false, message: "Contract type and selected documents are required" },
        { status: 400 },
      )
    }

    // Obtener paths configurados
    const paths = getDocumentPaths()
    await ensureDocumentDirectories()

    // Obtener configuración de la API
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
    const apiKey = process.env.NEXT_PUBLIC_API_KEY

    if (!apiEndpoint) {
      return NextResponse.json({ success: false, message: "API endpoint not configured" }, { status: 500 })
    }

    console.log("Generating SOW with:", { contractType, selectedDocuments })

    // Preparar la solicitud para la API externa
    const apiRequest = {
      contract_type: contractType,
      documents: selectedDocuments,
    }

    // Llamar a la API externa
    console.log("Calling external API:", apiEndpoint)
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify(apiRequest),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error:", response.status, errorText)
      return NextResponse.json(
        {
          success: false,
          message: `API Error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const apiResponse = await response.json()
    console.log("API Response received:", {
      hasDocxContent: !!apiResponse.docx_content,
      filename: apiResponse.filename,
    })

    if (!apiResponse.docx_content || !apiResponse.filename) {
      return NextResponse.json(
        { success: false, message: "Invalid API response: missing docx_content or filename" },
        { status: 500 },
      )
    }

    // Generar nombre único para el archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const baseFilename = apiResponse.filename.replace(/\.docx$/i, "")
    const uniqueFilename = `${baseFilename}_${timestamp}.docx`

    // Construir ruta del archivo
    const filePath = path.join(paths.generatedSows, uniqueFilename)

    // ELIMINAR ARCHIVO EXISTENTE SI EXISTE (para regenerar siempre)
    if (existsSync(filePath)) {
      console.log("Removing existing DOCX to regenerate:", filePath)
      try {
        await unlink(filePath)
        console.log("Existing DOCX removed successfully")
      } catch (unlinkError) {
        console.warn("Could not remove existing DOCX:", unlinkError)
        // Continuar con la generación aunque no se pueda eliminar
      }
    }

    // Decodificar y guardar el archivo DOCX
    console.log("Saving DOCX file:", filePath)
    const docxBuffer = Buffer.from(apiResponse.docx_content, "base64")
    await writeFile(filePath, docxBuffer)

    console.log("SOW generated successfully:", {
      filename: uniqueFilename,
      size: docxBuffer.length,
      path: filePath,
    })

    return NextResponse.json({
      success: true,
      filename: uniqueFilename,
      message: "SOW generated successfully (regenerated)",
      debug: {
        originalFilename: apiResponse.filename,
        generatedFilename: uniqueFilename,
        fileSize: docxBuffer.length,
        contractType,
        documentsCount: selectedDocuments.length,
        regenerated: true,
      },
    })
  } catch (error) {
    console.error("Error generating SOW:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error generating SOW",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
