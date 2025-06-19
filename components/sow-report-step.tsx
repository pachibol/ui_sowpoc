"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { WizardData } from "@/components/wizard"
import { ArrowLeft, Download, FileText, Loader2, Brain } from "lucide-react"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface SowReportStepProps {
  wizardData: WizardData
  onBack: () => void
}

export function SowReportStep({ wizardData, onBack }: SowReportStepProps) {
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isExplanationOpen, setIsExplanationOpen] = useState(false)

  const getContractTypeLabel = (contractType: string | null) => {
    switch (contractType) {
      case "time_and_materials":
        return "Time and Materials"
      case "agile_scrum":
        return "Agile Scrum"
      case "change_requests":
        return "Change Requests to SOW"
      case "generic_sows":
        return "Generic SOWs"
      default:
        return "Not specified"
    }
  }

  const handleDownloadDocx = async () => {
    if (!wizardData.generatedSowFile) {
      alert("No DOCX file available for download")
      return
    }

    setIsDownloadingDocx(true)

    try {
      const response = await fetch(`/api/download-docx?file=${encodeURIComponent(wizardData.generatedSowFile)}`)

      if (!response.ok) {
        throw new Error("Failed to download DOCX file")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = wizardData.generatedSowFile
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading DOCX:", error)
      alert("Error downloading DOCX file. Please try again.")
    } finally {
      setIsDownloadingDocx(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!wizardData.generatedPdfPath) {
      alert("No PDF file available for download")
      return
    }

    setIsDownloadingPdf(true)

    try {
      const response = await fetch(`/api/pdf?file=${encodeURIComponent(wizardData.generatedPdfPath)}`)

      if (!response.ok) {
        throw new Error("Failed to download PDF file")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = wizardData.generatedPdfPath
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert("Error downloading PDF file. Please try again.")
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  return (
    <div className="space-y-6">
      {wizardData.generatedPdfPath ? (
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-3">Preview</h3>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Contract Type:</span>{" "}
                {getContractTypeLabel(wizardData.selectedContractType)} •
                <span className="font-medium ml-2">Selected Documents:</span>{" "}
                {wizardData.selectedFiles.map((f) => f.name).join(", ")}
              </div>
            </div>

            {/* Chain of Thought Button - Arriba a la derecha del viewer */}
            {wizardData.cotText && (
              <Dialog open={isExplanationOpen} onOpenChange={setIsExplanationOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Chain Of Thought
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Chain Of Thought - SOW Generation Process</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                    <MarkdownRenderer content={wizardData.cotText} />
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <iframe
              src={`/api/pdf?file=${encodeURIComponent(wizardData.generatedPdfPath)}#navpanes=0&toolbar=1&view=FitH`}
              className="w-full h-[900px] border-0"
              title="SOW PDF Document"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/10">
          <div className="text-center">
            <p className="text-muted-foreground">No PDF available to display</p>
          </div>
        </div>
      )}

      <div className="pt-6 border-t flex justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Proposals
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf || !wizardData.generatedPdfPath}
            className="flex items-center gap-2"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>

          <Button
            onClick={handleDownloadDocx}
            disabled={isDownloadingDocx || !wizardData.generatedSowFile}
            className="flex items-center gap-2"
          >
            {isDownloadingDocx ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download DOCX
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
