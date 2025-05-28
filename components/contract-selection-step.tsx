"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { WizardData, ContractType } from "@/components/wizard"
import { ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ContractSelectionStepProps {
  wizardData: WizardData
  setWizardData: React.Dispatch<React.SetStateAction<WizardData>>
  onNext: () => void
}

export function ContractSelectionStep({ wizardData, setWizardData, onNext }: ContractSelectionStepProps) {
  const contractTypes = [
    {
      id: "fixed-price",
      label: "Fixed Price",
      description: "Total project cost determined upfront with no changes regardless of resources used",
    },
    {
      id: "time-and-materials",
      label: "Time and Materials",
      description: "Billing based on actual time spent and materials used during the project",
    },
    {
      id: "staff-augmentation",
      label: "Staff Augmentation",
      description: "Resources provided at an agreed hourly/daily/monthly rate",
    },
  ]

  const handleContractTypeChange = (value: string) => {
    setWizardData((prev) => ({
      ...prev,
      selectedContractType: value as ContractType,
    }))
  }

  const handleNext = () => {
    if (!wizardData.selectedContractType) {
      return
    }
    onNext()
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Select Contract Type</h3>
        <p className="text-sm text-muted-foreground mb-6">Choose the contract model for this project (required)</p>

        <RadioGroup
          value={wizardData.selectedContractType || ""}
          onValueChange={handleContractTypeChange}
          className="space-y-4"
        >
          {contractTypes.map((type) => (
            <Card
              key={type.id}
              className={`cursor-pointer transition-colors ${
                wizardData.selectedContractType === type.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={type.id} className="text-base font-medium cursor-pointer">
                      {type.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>

      {!wizardData.selectedContractType && (
        <Alert>
          <AlertDescription>Please select a contract type to continue</AlertDescription>
        </Alert>
      )}

      <div className="pt-6 border-t flex justify-end">
        <Button onClick={handleNext} disabled={!wizardData.selectedContractType} className="flex items-center gap-2">
          Next: Select Proposals
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
