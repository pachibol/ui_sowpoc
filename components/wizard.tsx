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
  { id: 3, title: "SOW Report", description: "Review generated SOW" },
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">SOW Creator Wizard</h1>
        <p className="text-muted-foreground">Create a Statement of Work based on your proposals and contract type</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{steps[currentStep - 1].title}</h2>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
      </div>

      <div className="min-h-[500px]">
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
