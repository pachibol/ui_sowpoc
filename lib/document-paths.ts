import path from "path"
import { existsSync } from "fs"
import { mkdir } from "fs/promises"

// Configuración de paths desde variables de entorno
const DOCUMENTS_PATH = process.env.DOCUMENTS_PATH || "./docs"
const INPUT_FOLDER = process.env.INPUT_FOLDER || "input"
const GENERATED_SOWS_FOLDER = process.env.GENERATED_SOWS_FOLDER || "generated_sows"
const CONVERTED_PDF_FOLDER = process.env.CONVERTED_PDF_FOLDER || "converted_to_pdf"
const CONVERTED_DOCX_FOLDER = process.env.CONVERTED_DOCX_FOLDER || "converted_to_docx"
const TEMP_FOLDER = process.env.TEMP_FOLDER || "temp"

export interface DocumentPaths {
  base: string
  input: string
  generatedSows: string
  convertedPdf: string
  convertedDocx: string
  temp: string
}

/**
 * Resuelve un path relativo que puede incluir .. para subir niveles
 */
function resolvePath(relativePath: string): string {
  // Si empieza con ./ o ../ es relativo al directorio del proyecto
  if (relativePath.startsWith("./") || relativePath.startsWith("../")) {
    return path.resolve(process.cwd(), relativePath)
  }

  // Si no empieza con / es relativo al directorio del proyecto
  if (!relativePath.startsWith("/")) {
    return path.resolve(process.cwd(), relativePath)
  }

  // Si empieza con / es absoluto
  return relativePath
}

/**
 * Obtiene todos los paths de documentos configurados
 */
export function getDocumentPaths(): DocumentPaths {
  const basePath = resolvePath(DOCUMENTS_PATH)

  return {
    base: basePath,
    input: path.join(basePath, INPUT_FOLDER),
    generatedSows: path.join(basePath, GENERATED_SOWS_FOLDER),
    convertedPdf: path.join(basePath, CONVERTED_PDF_FOLDER),
    convertedDocx: path.join(basePath, CONVERTED_DOCX_FOLDER),
    temp: path.join(basePath, TEMP_FOLDER),
  }
}

/**
 * Crea todas las carpetas necesarias si no existen
 */
export async function ensureDocumentDirectories(): Promise<void> {
  const paths = getDocumentPaths()

  const directories = [
    paths.base,
    paths.input,
    paths.generatedSows,
    paths.convertedPdf,
    paths.convertedDocx,
    paths.temp,
  ]

  for (const dir of directories) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
      console.log(`Created directory: ${dir}`)
    }
  }
}

/**
 * Obtiene el path relativo para mostrar en la UI
 */
export function getRelativePath(fullPath: string): string {
  const basePath = getDocumentPaths().base
  return path.relative(basePath, fullPath)
}
