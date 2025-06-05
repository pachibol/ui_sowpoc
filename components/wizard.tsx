"use client"

import { useState, useEffect } from "react"
import { ContractSelectionStep } from "@/components/contract-selection-step"
import { ProposalsSelectionStep } from "@/components/proposals-selection-step"
import { SowReportStep } from "@/components/sow-report-step"
import { Progress } from "@/components/ui/progress"

export type ContractType = "fixed-price" | "time-and-materials" | "staff-augmentation"
export type FileData = { name: string; path: string; size: string; lastModified: string; type: string }

export interface WizardData {
  selectedContractType: ContractType | null
  selectedFiles: FileData[]
  uploadedFiles: FileData[]
  generatedSowText?: string
}

export function Wizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<WizardData>({
    selectedContractType: null,
    selectedFiles: [],
    uploadedFiles: [],
  })

  // Preserve state when navigating between steps
  useEffect(() => {
    // This ensures the component re-renders when the step changes
    // and preserves the wizardData state
  }, [currentStep])

  const steps = [
    {
      title: "Contract Selection",
      component: (
        <ContractSelectionStep
          key="contract-step"
          wizardData={wizardData}
          setWizardData={setWizardData}
          onNext={() => setCurrentStep(1)}
        />
      ),
    },
    {
      title: "Proposals Selection",
      component: (
        <ProposalsSelectionStep
          key="proposals-step"
          wizardData={wizardData}
          setWizardData={setWizardData}
          onNext={() => setCurrentStep(2)}
          onBack={() => setCurrentStep(0)}
        />
      ),
    },
    {
      title: "Generated SOW",
      component: <SowReportStep key="sow-step" wizardData={wizardData} onBack={() => setCurrentStep(1)} />,
    },
  ]

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto border rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold mb-2">{steps[currentStep].title}</h2>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>
            Step {currentStep + 1} of {steps.length}
          </span>
          <span>{progressPercentage.toFixed(0)}% Complete</span>
        </div>
      </div>
      <div className="p-6">{steps[currentStep].component}</div>
    </div>
  )
}
