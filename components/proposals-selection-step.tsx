"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FileData, WizardData } from "@/components/wizard"
import { Upload, RefreshCw, ArrowLeft, ArrowRight, Loader2, FileIcon as FilePresentation } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

// Empty initial files array - we'll load files dynamically
const initialDocsFiles: FileData[] = []

interface ProposalsSelectionStepProps {
  wizardData: WizardData
  setWizardData: React.Dispatch<React.SetStateAction<WizardData>>
  onNext: () => void
  onBack: () => void
}

export function ProposalsSelectionStep({ wizardData, setWizardData, onNext, onBack }: ProposalsSelectionStepProps) {
  const [availableFiles, setAvailableFiles] = useState<FileData[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  // Simulate reading files from docs directory on component mount and refresh
  useEffect(() => {
    loadFilesFromDocs()
  }, [])

  const loadFilesFromDocs = () => {
    setIsLoading(true)

    // Simulate API call to read files from docs directory
    setTimeout(() => {
      // Combine any existing uploaded files with the ones from the docs directory
      setAvailableFiles([...wizardData.uploadedFiles])
      setIsLoading(false)
    }, 800)
  }

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

    // Check if file is a PPTX
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (fileExtension !== "pptx") {
      toast({
        title: "Invalid file format",
        description: "Only PPTX files are allowed",
        variant: "destructive",
      })
      // Reset the file input
      e.target.value = ""
      return
    }

    setIsUploading(true)

    // Simulate file upload delay
    setTimeout(() => {
      const newFile: FileData = {
        name: file.name,
        path: `/docs/${file.name}`,
        size: `${Math.round(file.size / 1024)} KB`,
        lastModified: new Date().toISOString().split("T")[0],
        type: "presentation",
      }

      setAvailableFiles((prev) => [...prev, newFile])
      setWizardData((prev) => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, newFile],
      }))
      setIsUploading(false)

      // Reset the file input
      e.target.value = ""

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded to the docs folder`,
      })
    }, 1500)
  }

  const refreshFileList = () => {
    // Clear the list and reload files from docs directory
    loadFilesFromDocs()
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

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Select Proposal Documents</h3>
          <Button variant="outline" size="sm" onClick={refreshFileList} className="flex items-center gap-1">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Select documents from the docs directory to include in your SOW generation
        </p>

        <ScrollArea className="h-80 border rounded-md">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading files...</span>
            </div>
          ) : availableFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <FilePresentation className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">No documents found</h4>
              <p className="text-sm text-muted-foreground mb-4">Upload a PPTX file to get started</p>
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Upload Document
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    accept=".pptx"
                  />
                </label>
              </Button>
            </div>
          ) : (
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
                        <FilePresentation className="h-5 w-5 text-muted-foreground" />
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
          )}
        </ScrollArea>

        <div className="flex items-center gap-4 mt-4">
          <Button variant="outline" className="flex items-center gap-2" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4" />
              Upload Document
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept=".pptx" />
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

      {!isLoading && availableFiles.length > 0 && wizardData.selectedFiles.length === 0 && (
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
          disabled={wizardData.selectedFiles.length === 0 || isGenerating || isLoading}
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
