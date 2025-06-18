"use client"

import { useState } from "react"
import { ContractSelectionStep } from "./contract-selection-step"
import { ProposalsSelectionStep } from "./proposals-selection-step"
import { SowReportStep } from "./sow-report-step"
import { Progress } from "@/components/ui/progress"

export interface FileData {
  name: string
  path: string
  size: string
  lastModified: string
  type: string
}

export interface WizardData {
  selectedContractType: string | null
  selectedFiles: FileData[]
  uploadedFiles: FileData[]
  generatedSowText: string
  generatedSowFile?: string
  generatedPdfPath?: string
}

const steps = [
  { id: 1, title: "Contract Type", description: "Select the type of contract" },
  { id: 2, title: "Proposals", description: "Select proposal documents" },
  { id: 3, title: "Generated SOW", description: "Review generated SOW" },
]

export function Wizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>({
    selectedContractType: null,
    selectedFiles: [],
    uploadedFiles: [],
    generatedSowText: "",
  })

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto border rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold mb-2">{steps[currentStep - 1].title}</h2>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>
            Step {currentStep} of {steps.length}
          </span>
          <span>{progress.toFixed(0)}% Complete</span>
        </div>
      </div>
      <div className="p-6">
        {currentStep === 1 && (
          <ContractSelectionStep wizardData={wizardData} setWizardData={setWizardData} onNext={handleNext} />
        )}
        {currentStep === 2 && (
          <ProposalsSelectionStep
            wizardData={wizardData}
            setWizardData={setWizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && <SowReportStep wizardData={wizardData} onBack={handleBack} />}
      </div>
    </div>
  )
}
