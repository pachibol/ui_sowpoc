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
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Simulate reading files from docs directory on component mount and refresh
  useEffect(() => {
    loadFilesFromDocs()
  }, [])

  // Reset upload success message after 3 seconds
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [uploadSuccess])

  const loadFilesFromDocs = () => {
    setIsLoading(true)

    // Simulate API call to read files from docs directory
    setTimeout(() => {
      // Remove duplicates by using a Map with path as key
      const uniqueFiles = new Map()
      wizardData.uploadedFiles.forEach((file) => {
        uniqueFiles.set(file.path, file)
      })
      setAvailableFiles(Array.from(uniqueFiles.values()))
      setIsLoading(false)
    }, 800)
  }

  const handleFileSelect = (file: FileData, checked: boolean) => {
    setWizardData((prev) => {
      if (checked) {
        // Check if file is already selected to avoid duplicates
        const isAlreadySelected = prev.selectedFiles.some((f) => f.path === file.path)
        if (isAlreadySelected) {
          return prev // Don't add if already selected
        }
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
      alert("Only PPTX files are allowed")
      // Reset the file input
      e.target.value = ""
      return
    }

    setIsUploading(true)
    setUploadSuccess(false)

    // Generate unique filename if duplicate exists
    const generateUniqueFilename = (originalName: string) => {
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf("."))
      const extension = originalName.substring(originalName.lastIndexOf("."))

      let counter = 0
      let newName = originalName

      // Check against both availableFiles and uploadedFiles to avoid duplicates
      const allFiles = [...availableFiles, ...wizardData.uploadedFiles]
      while (allFiles.some((f) => f.name === newName)) {
        counter++
        newName = `${nameWithoutExt}_${counter}${extension}`
      }

      return newName
    }

    // Simulate file upload delay
    setTimeout(() => {
      const uniqueFileName = generateUniqueFilename(file.name)

      const newFile: FileData = {
        name: uniqueFileName,
        path: `/docs/${uniqueFileName}`,
        size: `${Math.round(file.size / 1024)} KB`,
        lastModified: new Date().toISOString().split("T")[0],
        type: "presentation",
      }

      // Add to availableFiles only if not already present
      setAvailableFiles((prev) => {
        const exists = prev.some((f) => f.path === newFile.path)
        return exists ? prev : [...prev, newFile]
      })

      // Add to uploadedFiles only if not already present
      setWizardData((prev) => {
        const exists = prev.uploadedFiles.some((f) => f.path === newFile.path)
        return exists
          ? prev
          : {
              ...prev,
              uploadedFiles: [...prev.uploadedFiles, newFile],
            }
      })

      setIsUploading(false)
      setUploadSuccess(true)

      // Reset the file input
      e.target.value = ""
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
    setElapsedTime(0)

    // Start the timer that counts up every second
    const timerInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    // Simulate the 5-second generation process
    setTimeout(() => {
      clearInterval(timerInterval)
      setIsGenerating(false)
      onNext()
    }, 5000)
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
              <p className="text-sm text-muted-foreground">
                Use the Upload Document button below to add PPTX files to the docs folder
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {availableFiles.map((file) => (
                <Card
                  key={file.path}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleFileSelect(file, !wizardData.selectedFiles.some((f) => f.path === file.path))}
                >
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
                          <Label htmlFor={file.path} className="font-medium">
                            {file.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {file.size} • {file.lastModified}
                          </p>
                        </div>
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
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          )}
          {uploadSuccess && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-green-600">Document Uploaded</p>
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
              Generating... {elapsedTime}s
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
