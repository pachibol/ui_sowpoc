"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Maximize2 } from "lucide-react"

interface PdfViewerProps {
  pdfPath: string
  fileName?: string
  onDownload?: () => void
}

export function PdfViewer({ pdfPath, fileName, onDownload }: PdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)

  const pdfUrl = `/api/pdf?file=${encodeURIComponent(pdfPath)}`

  useEffect(() => {
    // Reset states when pdfPath changes
    setIsLoading(true)
    setError(null)
  }, [pdfPath])

  const handleLoad = () => {
    setIsLoading(false)
    setError(null)
    console.log("PDF loaded successfully:", pdfPath)
  }

  const handleError = () => {
    setIsLoading(false)
    setError("Failed to load PDF document")
    console.error("Error loading PDF:", pdfPath)
  }

  const openInNewTab = () => {
    window.open(pdfUrl, "_blank")
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/10">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* PDF Controls */}
      <div className="mb-4 flex items-center justify-between bg-muted/30 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Generated SOW Document</h3>
          {fileName && (
            <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">{fileName}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openInNewTab}>
            <Maximize2 className="h-4 w-4 mr-1" />
            Full Screen
          </Button>
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* PDF Viewer Container */}
      <div className="relative border rounded-lg overflow-hidden bg-white shadow-lg">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading PDF document...</p>
            </div>
          </div>
        )}

        <div className="w-full h-[850px]">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH&zoom=${zoom}`}
            className="w-full h-full border-0"
            title="SOW PDF Viewer"
            onLoad={handleLoad}
            onError={handleError}
            style={{
              backgroundColor: "white",
              display: "block",
            }}
          />
        </div>
      </div>

      {/* PDF Info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Use the PDF controls to navigate, zoom, search, and interact with the document
        </p>
      </div>
    </div>
  )
}
