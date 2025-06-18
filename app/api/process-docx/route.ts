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

    // Verificar que el archivo existe
    if (!existsSync(fullPath)) {
      return NextResponse.json({ success: false, message: "File not found" }, { status: 404 })
    }

    // Leer el archivo DOCX
    const buffer = await readFile(fullPath)

    // Convertir DOCX a HTML usando mammoth
    const result = await mammoth.convertToHtml({ buffer })
    const htmlContent = result.value

    // Convertir HTML a Markdown básico
    const markdownContent = htmlToMarkdown(htmlContent)

    return NextResponse.json({
      success: true,
      markdown: markdownContent,
      messages: result.messages, // Warnings/errors from mammoth
    })
  } catch (error) {
    console.error("Error processing DOCX file:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error processing DOCX file",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Función para convertir HTML básico a Markdown
function htmlToMarkdown(html: string): string {
  return (
    html
      // Encabezados
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n")
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1\n\n")
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1\n\n")

      // Texto en negrita y cursiva
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")

      // Párrafos
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")

      // Saltos de línea
      .replace(/<br[^>]*\/?>/gi, "\n")

      // Listas no ordenadas
      .replace(/<ul[^>]*>/gi, "")
      .replace(/<\/ul>/gi, "\n")
      .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")

      // Listas ordenadas
      .replace(/<ol[^>]*>/gi, "")
      .replace(/<\/ol>/gi, "\n")
      .replace(/<li[^>]*>(.*?)<\/li>/gi, (match, content, offset, string) => {
        // Contar elementos li anteriores para numeración
        const beforeMatch = string.substring(0, offset)
        const liCount = (beforeMatch.match(/<li[^>]*>/gi) || []).length + 1
        return `${liCount}. ${content}\n`
      })

      // Enlaces
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")

      // Tablas básicas
      .replace(/<table[^>]*>/gi, "\n")
      .replace(/<\/table>/gi, "\n")
      .replace(/<tr[^>]*>/gi, "|")
      .replace(/<\/tr>/gi, "|\n")
      .replace(/<td[^>]*>(.*?)<\/td>/gi, " $1 |")
      .replace(/<th[^>]*>(.*?)<\/th>/gi, " **$1** |")

      // Remover otras etiquetas HTML
      .replace(/<[^>]*>/g, "")

      // Decodificar entidades HTML básicas
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

      // Limpiar espacios múltiples y saltos de línea excesivos
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .replace(/^\s+|\s+$/g, "")
      .trim()
  )
}
