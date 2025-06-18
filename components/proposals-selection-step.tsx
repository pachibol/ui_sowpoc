"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { FileData, WizardData } from "@/components/wizard"
import {
  Upload,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Loader2,
  FileIcon as FilePresentation,
  Trash2,
  FileText,
  File,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"

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
  const [error, setError] = useState<string | null>(null)
  const [fileToDelete, setFileToDelete] = useState<FileData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Obtener configuración de archivos permitidos
  const allowedExtensions = process.env.NEXT_PUBLIC_ALLOWED_FILE_EXTENSIONS?.split(",").map((ext) =>
    ext.trim().toLowerCase(),
  ) || ["pptx"]
  const allowedExtensionsText = allowedExtensions.map((ext) => ext.toUpperCase()).join(", ")
  const acceptAttribute = allowedExtensions.map((ext) => `.${ext}`).join(",")
  const maxFileSizeMB = Number.parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "50")

  // Load files from docs directory on component mount and refresh
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

  const loadFilesFromDocs = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/files")
      const data = await response.json()

      if (response.ok) {
        setAvailableFiles(data.files || [])

        // Update wizard data with the loaded files
        setWizardData((prev) => ({
          ...prev,
          uploadedFiles: data.files || [],
        }))
      } else {
        setError("Error loading files from docs directory")
      }
    } catch (err) {
      console.error("Error loading files:", err)
      setError("Error loading files from docs directory")
    } finally {
      setIsLoading(false)
    }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file extension is allowed
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert(`Only ${allowedExtensionsText} files are allowed`)
      // Reset the file input
      e.target.value = ""
      return
    }

    // Check file size
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024
    if (file.size > maxFileSizeBytes) {
      alert(`File size exceeds the maximum limit of ${maxFileSizeMB}MB`)
      // Reset the file input
      e.target.value = ""
      return
    }

    setIsUploading(true)
    setUploadSuccess(false)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Add the uploaded file to available files
        setAvailableFiles((prev) => [...prev, data.file])

        // Update wizard data
        setWizardData((prev) => ({
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, data.file],
        }))

        setUploadSuccess(true)
        console.log("File uploaded successfully:", data.file)
      } else {
        setError(data.message || "Error uploading file")
      }
    } catch (err) {
      console.error("Error uploading file:", err)
      setError("Error uploading file")
    } finally {
      setIsUploading(false)
      // Reset the file input
      e.target.value = ""
    }
  }

  const handleDeleteFile = async (file: FileData) => {
    setFileToDelete(file)
  }

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/delete?filename=${encodeURIComponent(fileToDelete.name)}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Remove the file from available files
        setAvailableFiles((prev) => prev.filter((f) => f.path !== fileToDelete.path))

        // Remove from wizard data
        setWizardData((prev) => ({
          ...prev,
          uploadedFiles: prev.uploadedFiles.filter((f) => f.path !== fileToDelete.path),
          selectedFiles: prev.selectedFiles.filter((f) => f.path !== fileToDelete.path),
        }))

        console.log("File deleted successfully:", fileToDelete.name)
      } else {
        setError(data.message || "Error deleting file")
      }
    } catch (err) {
      console.error("Error deleting file:", err)
      setError("Error deleting file")
    } finally {
      setIsDeleting(false)
      setFileToDelete(null)
    }
  }

  const refreshFileList = () => {
    // Reload files from docs directory
    loadFilesFromDocs()
  }

  const convertToPdf = async (filePath: string): Promise<string> => {
    console.log("Starting LibreOffice PDF conversion for file:", filePath)

    try {
      const response = await fetch("/api/convert-to-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath }),
      })

      console.log("LibreOffice PDF conversion API response status:", response.status)

      const data = await response.json()
      console.log("LibreOffice PDF conversion API response data:", data)

      if (response.ok && data.success) {
        console.log("LibreOffice PDF conversion successful")
        if (data.debug) {
          console.log("Debug info:", data.debug)
        }
        return data.pdfPath
      } else {
        console.error("LibreOffice PDF conversion failed:", data)
        const errorDetails = [
          `Status: ${response.status}`,
          `Message: ${data.message}`,
          data.error ? `Error: ${data.error}` : null,
          data.debug ? `Debug: ${JSON.stringify(data.debug)}` : null,
          data.stack ? `Stack: ${data.stack}` : null,
        ]
          .filter(Boolean)
          .join("\n")

        throw new Error(`LibreOffice PDF Conversion Failed:\n${errorDetails}`)
      }
    } catch (error) {
      console.error("Error in LibreOffice convertToPdf:", error)
      if (error instanceof Error) {
        throw new Error(`LibreOffice PDF Conversion Error: ${error.message}`)
      }
      throw new Error(`LibreOffice PDF Conversion Error: ${String(error)}`)
    }
  }

  const generateSOW = async () => {
    if (!wizardData.selectedContractType || wizardData.selectedFiles.length === 0) {
      return
    }

    setIsGenerating(true)
    setElapsedTime(0)
    setError(null)

    // Start the timer that counts up every second
    const timerInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    try {
      const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
      const apiKey = process.env.NEXT_PUBLIC_API_KEY

      if (!apiEndpoint || !apiKey) {
        throw new Error("API configuration missing")
      }

      // Prepare the request payload - send the contract type as-is (already in snake_case)
      const payload = {
        contract_type: wizardData.selectedContractType,
        filenames: wizardData.selectedFiles.map((file) => file.name),
      }

      console.log("Sending request to:", apiEndpoint)
      console.log("Payload:", JSON.stringify(payload))

      // Make the API call using the full endpoint URL
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`)
      }

      const data = await response.json()
      console.log("API response:", data)

      // Verificar que hay un archivo DOCX en la respuesta
      if (!data.sow_file) {
        throw new Error("No DOCX file received in API response. Expected 'sow_file' field in payload.")
      }

      console.log("Converting DOCX to PDF with LibreOffice:", data.sow_file)

      // Convertir DOCX a PDF usando LibreOffice
      const pdfPath = await convertToPdf(data.sow_file)
      console.log("Successfully converted to PDF with LibreOffice:", pdfPath)

      // Update wizard data with the PDF path and original DOCX file
      setWizardData((prev) => ({
        ...prev,
        generatedSowText: "", // No necesitamos HTML ya que mostraremos PDF
        generatedSowFile: data.sow_file, // DOCX original para descarga
        generatedPdfPath: pdfPath, // PDF para visualización
      }))

      clearInterval(timerInterval)
      setIsGenerating(false)
      onNext()
    } catch (err) {
      clearInterval(timerInterval)
      setIsGenerating(false)

      // Crear mensaje de error detallado para debugging
      let errorMessage = "Error generating SOW: "
      if (err instanceof Error) {
        errorMessage += err.message
        console.error("Full error details:", {
          message: err.message,
          stack: err.stack,
          name: err.name,
        })
      } else {
        errorMessage += "Unknown error occurred"
        console.error("Unknown error:", err)
      }

      setError(errorMessage)
    }
  }

  const handleGenerate = async () => {
    await generateSOW()
  }

  // Función para obtener el ícono apropiado según el tipo de archivo
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "presentation":
        return <FilePresentation className="h-5 w-5 text-muted-foreground" />
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "document":
        return <FileText className="h-5 w-5 text-blue-500" />
      default:
        return <File className="h-5 w-5 text-muted-foreground" />
    }
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
                Use the Upload Document button below to add {allowedExtensionsText} files to the docs folder
              </p>
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
                      <div
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                        onClick={() =>
                          handleFileSelect(file, !wizardData.selectedFiles.some((f) => f.path === file.path))
                        }
                      >
                        {getFileIcon(file.type)}
                        <div className="flex-1">
                          <Label htmlFor={file.path} className="font-medium cursor-pointer">
                            {file.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {file.size} • {file.lastModified}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteFile(file)
                        }}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
                accept={acceptAttribute}
              />
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
              <p className="text-sm text-green-600">Document uploaded to docs folder</p>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Allowed file types: {allowedExtensionsText} • Maximum file size: {maxFileSizeMB}MB
        </div>
      </div>

      {!isLoading && availableFiles.length > 0 && wizardData.selectedFiles.length === 0 && (
        <Alert>
          <AlertDescription>Please select at least one document to continue</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone and will permanently
              remove the file from the docs folder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFile}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
