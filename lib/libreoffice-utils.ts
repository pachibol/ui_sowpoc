import { exec } from "child_process"
import { promisify } from "util"
import { existsSync } from "fs"
import path from "path"
import os from "os"

const execAsync = promisify(exec)

interface LibreOfficeInfo {
  path: string
  version?: string
  available: boolean
}

/**
 * Detecta la instalación de LibreOffice en diferentes sistemas operativos
 */
export async function detectLibreOffice(): Promise<LibreOfficeInfo> {
  const platform = os.platform()
  const possiblePaths: string[] = []

  // Definir rutas posibles según el sistema operativo
  switch (platform) {
    case "darwin": // macOS
      possiblePaths.push(
        "/Applications/LibreOffice.app/Contents/MacOS/soffice",
        "/usr/local/bin/libreoffice",
        "/opt/homebrew/bin/libreoffice",
        "/usr/bin/libreoffice",
      )
      break

    case "linux":
      possiblePaths.push(
        "/usr/bin/libreoffice",
        "/usr/local/bin/libreoffice",
        "/opt/libreoffice/program/soffice",
        "/snap/bin/libreoffice",
      )
      break

    case "win32": // Windows
      possiblePaths.push(
        "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
        "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
        path.join(os.homedir(), "AppData\\Local\\Programs\\LibreOffice\\program\\soffice.exe"),
      )
      break

    default:
      console.warn(`Unsupported platform: ${platform}`)
  }

  // Primero intentar con el comando en PATH
  try {
    const { stdout } = await execAsync("libreoffice --version")
    if (stdout.includes("LibreOffice")) {
      return {
        path: "libreoffice",
        version: stdout.trim(),
        available: true,
      }
    }
  } catch (error) {
    console.log("LibreOffice not found in PATH, checking specific locations...")
  }

  // Si no está en PATH, buscar en ubicaciones específicas
  for (const possiblePath of possiblePaths) {
    if (existsSync(possiblePath)) {
      try {
        // En macOS y Linux, usar el ejecutable directamente
        // En Windows, usar soffice.exe
        const versionCommand = platform === "win32" ? `"${possiblePath}" --version` : `"${possiblePath}" --version`

        const { stdout } = await execAsync(versionCommand)
        if (stdout.includes("LibreOffice")) {
          return {
            path: possiblePath,
            version: stdout.trim(),
            available: true,
          }
        }
      } catch (error) {
        console.log(`Failed to execute LibreOffice at ${possiblePath}:`, error)
        continue
      }
    }
  }

  return {
    path: "",
    version: undefined,
    available: false,
  }
}

/**
 * Ejecuta LibreOffice con los argumentos especificados
 */
export async function executeLibreOffice(
  libreOfficePath: string,
  args: string[],
  options: { timeout?: number } = {},
): Promise<{ stdout: string; stderr: string }> {
  const platform = os.platform()
  const timeout = options.timeout || 30000

  // Construir el comando
  let command: string
  if (platform === "win32") {
    // En Windows, usar comillas para manejar espacios en la ruta
    command = `"${libreOfficePath}" ${args.join(" ")}`
  } else {
    // En macOS y Linux
    command = `"${libreOfficePath}" ${args.join(" ")}`
  }

  console.log(`Executing LibreOffice command: ${command}`)

  try {
    const result = await execAsync(command, { timeout })
    return result
  } catch (error) {
    console.error("LibreOffice execution failed:", error)
    throw error
  }
}

/**
 * Convierte un archivo DOCX a PDF usando LibreOffice
 */
export async function convertDocxToPdf(libreOfficePath: string, inputPath: string, outputDir: string): Promise<void> {
  const args = ["--headless", "--convert-to", "pdf", "--outdir", `"${outputDir}"`, `"${inputPath}"`]

  await executeLibreOffice(libreOfficePath, args, { timeout: 30000 })
}
