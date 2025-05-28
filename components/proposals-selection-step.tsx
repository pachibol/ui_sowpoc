"use client"

import type React from "react"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FileData, WizardData } from "@/components/wizard"
import { Upload, RefreshCw, FileText, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"

// Only the docs directory file - propuesta_comercial.pptx
const initialDocsFiles: FileData[] = [
  {
    name: "propuesta_comercial.pptx",
    path: "/docs/propuesta_comercial.pptx",
    size: "2.4 MB",
    lastModified: "2024-01-15",
    type: "presentation",
  },
]

interface ProposalsSelectionStepProps {
  wizardData: WizardData
  setWizardData: React.Dispatch<React.SetStateAction<WizardData>>
  onNext: () => void
  onBack: () => void
}

export function ProposalsSelectionStep({ wizardData, setWizardData, onNext, onBack }: ProposalsSelectionStepProps) {
  const [availableFiles, setAvailableFiles] = useState<FileData[]>(initialDocsFiles)
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileSelect = (file: FileData, checked: boolean) => {
    setWizardData((prev) => {
      if (checked) {
        return {
          ...prev,
          selectedFiles: [...prev.selectedFiles, file],
        }
      } else {
        return {
          ...prev,
          selectedFiles: prev.selectedFiles.filter((f) => f.path !== file.path),
        }
      }
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Simulate file upload delay
    setTimeout(() => {
      const newFile: FileData = {
        name: file.name,
        path: `/docs/${file.name}`,
        size: `${Math.round(file.size / 1024)} KB`,
        lastModified: new Date().toISOString().split("T")[0],
        type: getFileType(file.name),
      }

      setAvailableFiles((prev) => [...prev, newFile])
      setWizardData((prev) => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, newFile],
      }))
      setIsUploading(false)

      // Reset the file input
      e.target.value = ""
    }, 1500)
  }

  const getFileType = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return "document"
      case "docx":
      case "doc":
        return "document"
      case "xlsx":
      case "xls":
        return "spreadsheet"
      case "pptx":
      case "ppt":
        return "presentation"
      default:
        return "file"
    }
  }

  const refreshFileList = () => {
    // Simulate refreshing the file list from docs directory
    setAvailableFiles([...initialDocsFiles, ...wizardData.uploadedFiles])
  }

  const handleGenerate = async () => {
    if (wizardData.selectedFiles.length === 0) {
      return
    }

    setIsGenerating(true)
    setProgress(0)

    // Simulate progress over 3 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          onNext()
          return 100
        }
        return prev + 2
      })
    }, 60) // Update every 60ms for smooth animation
  }

  const getFileIcon = (type: string) => {
    return <FileText className="h-5 w-5 text-muted-foreground" />
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Select Proposal Documents</h3>
          <Button variant="outline" size="sm" onClick={refreshFileList} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Select documents from the docs directory to include in your SOW generation
        </p>

        <ScrollArea className="h-80 border rounded-md">
          <div className="p-4 space-y-2">
            {availableFiles.map((file) => (
              <Card key={file.path} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={file.path}
                      checked={wizardData.selectedFiles.some((f) => f.path === file.path)}
                      onCheckedChange={(checked) => handleFileSelect(file, checked === true)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      {getFileIcon(file.type)}
                      <div className="flex-1">
                        <Label htmlFor={file.path} className="font-medium cursor-pointer">
                          {file.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {file.size} • {file.lastModified}
                        </p>
                      </div>
                      {wizardData.uploadedFiles.some((f) => f.path === file.path) && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">New</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-4 mt-4">
          <Button variant="outline" className="flex items-center gap-2" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4" />
              Upload Document
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </Button>
          {isUploading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading to docs folder...</p>
            </div>
          )}
        </div>
      </div>

      {wizardData.selectedFiles.length === 0 && (
        <Alert>
          <AlertDescription>Please select at least one document to continue</AlertDescription>
        </Alert>
      )}

      {wizardData.selectedFiles.length > 0 && (
        <div className="bg-muted/30 p-4 rounded-md">
          <h4 className="font-medium mb-2">Selected Documents ({wizardData.selectedFiles.length})</h4>
          <div className="space-y-1">
            {wizardData.selectedFiles.map((file) => (
              <p key={file.path} className="text-sm text-muted-foreground">
                • {file.name}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="pt-6 border-t flex justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleGenerate}
          disabled={wizardData.selectedFiles.length === 0 || isGenerating}
          className="flex items-center gap-2 min-w-[140px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating... {progress}%
            </>
          ) : (
            <>
              Generate SOW
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
