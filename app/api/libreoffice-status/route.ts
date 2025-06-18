import { NextResponse } from "next/server"
import { detectLibreOffice } from "@/lib/libreoffice-utils"

export async function GET() {
  try {
    console.log("Checking LibreOffice status...")
    const libreOfficeInfo = await detectLibreOffice()

    return NextResponse.json({
      success: true,
      libreOffice: libreOfficeInfo,
      platform: process.platform,
      message: libreOfficeInfo.available ? "LibreOffice is available and ready" : "LibreOffice is not available",
    })
  } catch (error) {
    console.error("Error checking LibreOffice status:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error checking LibreOffice status",
        error: error instanceof Error ? error.message : "Unknown error",
        platform: process.platform,
      },
      { status: 500 },
    )
  }
}
