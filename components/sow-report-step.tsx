"use client"

import { Button } from "@/components/ui/button"
import type { WizardData } from "@/components/wizard"
import { ArrowLeft, Download, FileText } from "lucide-react"

interface SowReportStepProps {
  wizardData: WizardData
  onBack: () => void
}

export function SowReportStep({ wizardData, onBack }: SowReportStepProps) {
  const generateSowMarkdown = () => {
    const contractType = wizardData.selectedContractType
      ? wizardData.selectedContractType
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "Not specified"

    const selectedFiles = wizardData.selectedFiles.map((file) => `- ${file.name}`).join("\n")
    const uploadedFiles =
      wizardData.uploadedFiles.length > 0
        ? "\n\n### Newly Uploaded Documents\n" + wizardData.uploadedFiles.map((file) => `- ${file.name}`).join("\n")
        : ""

    return `
# Statement of Work (SOW)

**Generated on:** ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}

## Project Overview
This Statement of Work (SOW) outlines the scope, deliverables, timeline, and terms for the project based on the selected contract model and proposal documents.

## Contract Model
**${contractType}**

${getContractDescription(wizardData.selectedContractType)}

## Reference Documents
The following documents from the docs directory have been selected for this SOW:

${selectedFiles}${uploadedFiles}

## Scope of Work
Based on the selected proposal documents and contract type, this project will encompass:

1. **Requirements Analysis** - Review and analysis of all provided documentation
2. **Solution Design** - Technical and functional design based on requirements
3. **Implementation** - Development and deployment of the solution
4. **Testing & Quality Assurance** - Comprehensive testing protocols
5. **Documentation** - Complete project documentation and user guides
6. **Training & Support** - End-user training and ongoing support

## Deliverables
1. **Project Initiation Document** - Project charter and initial planning
2. **Technical Specification** - Detailed technical requirements and architecture
3. **Implementation Plan** - Phased approach to solution delivery
4. **Testing Documentation** - Test plans, cases, and results
5. **Deployment Package** - Production-ready solution with deployment guides
6. **User Documentation** - Comprehensive user manuals and training materials
7. **Support Documentation** - Maintenance and support procedures

## Timeline
- **Project Start:** ${new Date().toLocaleDateString()}
- **Requirements Phase:** ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
- **Design Phase:** ${new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toLocaleDateString()}
- **Implementation Phase:** ${new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toLocaleDateString()}
- **Testing Phase:** ${new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toLocaleDateString()}
- **Project Completion:** ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}

## Pricing Structure
${getPricingStructure(wizardData.selectedContractType)}

## Acceptance Criteria
1. All deliverables must be completed according to the specifications outlined in the reference documents
2. All deliverables must pass quality assurance testing and client review
3. Solution must meet all functional and non-functional requirements
4. Complete documentation must be provided for all components
5. Client sign-off is required for each major milestone and final project completion

## Risk Management
- Regular progress reviews and milestone checkpoints
- Change management process for scope modifications
- Quality gates at each phase to ensure deliverable standards
- Escalation procedures for issue resolution

## Communication Plan
- Weekly status reports and progress updates
- Bi-weekly stakeholder meetings
- Monthly executive summaries
- Ad-hoc communication as needed for critical issues

## Signatures
- **Client Representative:** __________________________ Date: __________
- **EY Project Manager:** __________________________ Date: __________
- **EY Engagement Partner:** ________________________ Date: __________

---
*This SOW was generated using the EY SOW Creator Wizard based on ${wizardData.selectedFiles.length} selected document(s) and ${contractType} contract model.*
`
  }

  const getContractDescription = (contractType: string | null) => {
    switch (contractType) {
      case "fixed-price":
        return `
**Description:** Total project cost is determined upfront and remains fixed regardless of actual resources used. This model provides cost certainty and transfers delivery risk to EY.

**Benefits:**
- Predictable budget and costs
- Clear scope and deliverables
- Risk transfer to service provider
- Simplified contract management`

      case "time-and-materials":
        return `
**Description:** Billing is based on actual time spent and materials used during the project. This model provides flexibility for evolving requirements and scope changes.

**Benefits:**
- Flexibility for changing requirements
- Pay for actual work performed
- Easier scope modifications
- Transparent cost tracking`

      case "staff-augmentation":
        return `
**Description:** EY resources are provided at agreed hourly/daily/monthly rates to supplement the client's existing team. This model provides access to specialized skills and expertise.

**Benefits:**
- Access to specialized expertise
- Scalable resource allocation
- Integration with existing teams
- Knowledge transfer opportunities`

      default:
        return "Contract model details to be defined."
    }
  }

  const getPricingStructure = (contractType: string | null) => {
    switch (contractType) {
      case "fixed-price":
        return `
**Fixed Price Model:**
- Total project cost: $XXX,XXX (to be determined based on final scope)
- Payment schedule: 20% upon contract signing, 30% at design completion, 30% at implementation completion, 20% upon final acceptance
- No additional charges for scope within agreed parameters
- Change requests will be handled through formal change control process`

      case "time-and-materials":
        return `
**Time and Materials Model:**
- Senior Consultant: $XXX per hour
- Consultant: $XXX per hour
- Junior Consultant: $XXX per hour
- Project Manager: $XXX per hour
- Materials and expenses at cost plus 10% markup
- Monthly invoicing based on actual hours worked`

      case "staff-augmentation":
        return `
**Staff Augmentation Model:**
- Senior Resource: $XXX per day/month
- Mid-level Resource: $XXX per day/month
- Junior Resource: $XXX per day/month
- Minimum commitment: 3 months
- 30-day notice for resource changes
- Monthly invoicing in advance`

      default:
        return "Pricing structure to be determined based on selected contract model."
    }
  }

  const handleDownload = () => {
    const markdown = generateSowMarkdown()
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `SOW_${new Date().toISOString().split("T")[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-medium">Generated Statement of Work</h3>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          Download SOW
        </Button>
      </div>

      <div className="border rounded-md p-6 bg-muted/30 prose prose-sm max-w-none max-h-96 overflow-y-auto">
        <div className="markdown" dangerouslySetInnerHTML={{ __html: markdownToHtml(generateSowMarkdown()) }} />
      </div>

      <div className="bg-primary/5 p-4 rounded-md">
        <h4 className="font-medium mb-2">Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Contract Type:</span>
            <p className="text-muted-foreground">
              {wizardData.selectedContractType
                ?.split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </p>
          </div>
          <div>
            <span className="font-medium">Documents Selected:</span>
            <p className="text-muted-foreground">{wizardData.selectedFiles.length} files</p>
          </div>
          <div>
            <span className="font-medium">Generated:</span>
            <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t flex justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Proposals
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">Save as Template</Button>
          <Button>Finalize SOW</Button>
        </div>
      </div>
    </div>
  )
}

// Simple markdown to HTML converter
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gm, "<h1 class='text-2xl font-bold mb-4'>$1</h1>")
    .replace(/^## (.*$)/gm, "<h2 class='text-xl font-semibold mb-3 mt-6'>$1</h2>")
    .replace(/^### (.*$)/gm, "<h3 class='text-lg font-medium mb-2 mt-4'>$1</h3>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^- (.*$)/gm, "<li class='ml-4'>$1</li>")
    .replace(/^(\d+)\. (.*$)/gm, "<li class='ml-4'>$2</li>")
    .replace(/<\/li>\n<li/g, "</li><li")
    .replace(/^<li/gm, "<ul class='list-disc mb-4'><li")
    .replace(/<\/li>$/gm, "</li></ul>")
    .replace(/<\/ul>\n<ul[^>]*>/g, "")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>")
}
