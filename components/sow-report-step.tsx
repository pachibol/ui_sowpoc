"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { WizardData } from "@/components/wizard"
import { ArrowLeft, Download, Loader2 } from "lucide-react"
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx"

interface SowReportStepProps {
  wizardData: WizardData
  onBack: () => void
}

export function SowReportStep({ wizardData, onBack }: SowReportStepProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const getSowContent = () => {
    // Use the generated SOW text from the backend if available, otherwise use fallback
    return wizardData.generatedSowText || generateFallbackSowMarkdown()
  }

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

  const generateFallbackSowMarkdown = () => {
    const contractTypeLabel = getContractTypeLabel(wizardData.selectedContractType)

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
This Statement of Work (SOW) outlines the scope, deliverables, timeline, and terms for the project based on the selected SOW category and proposal documents.

## SOW Category
**${contractTypeLabel}**

${getContractDescription(wizardData.selectedContractType)}

## Reference Documents
The following documents from the docs directory have been selected for this SOW:

${selectedFiles}${uploadedFiles}

## Scope of Work
Based on the selected proposal documents and SOW category, this project will encompass:

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
*This SOW was generated using the EY SOW Creator Wizard based on ${wizardData.selectedFiles.length} selected document(s) and ${contractTypeLabel} category.*
`
  }

  const getContractDescription = (contractType: string | null) => {
    switch (contractType) {
      case "time_and_materials":
        return `
**Description:** Billing is based on actual time spent and materials used during the project. This model provides flexibility for evolving requirements and scope changes.

**Benefits:**
- Flexibility for changing requirements
- Pay for actual work performed
- Easier scope modifications
- Transparent cost tracking`

      case "agile_scrum":
        return `
**Description:** Iterative development approach with sprint-based delivery and continuous stakeholder collaboration. Work is organized in time-boxed iterations with regular reviews and adaptations.

**Benefits:**
- Rapid delivery of working solutions
- Continuous stakeholder feedback
- Adaptive planning and scope management
- Risk mitigation through early delivery`

      case "change_requests":
        return `
**Description:** Modifications and amendments to existing Statement of Work documents and project scope. This covers scope changes, timeline adjustments, and resource modifications.

**Benefits:**
- Formal change control process
- Clear documentation of scope changes
- Impact assessment for all modifications
- Transparent cost and timeline implications`

      case "generic_sows":
        return `
**Description:** Standard Statement of Work templates for common project types and service offerings. These provide a foundation for typical engagement structures.

**Benefits:**
- Standardized approach to common projects
- Reduced time to contract
- Proven delivery methodologies
- Consistent quality and expectations`

      default:
        return "SOW category details to be defined."
    }
  }

  const getPricingStructure = (contractType: string | null) => {
    switch (contractType) {
      case "time_and_materials":
        return `
**Time and Materials Model:**
- Senior Consultant: $XXX per hour
- Consultant: $XXX per hour
- Junior Consultant: $XXX per hour
- Project Manager: $XXX per hour
- Materials and expenses at cost plus 10% markup
- Monthly invoicing based on actual hours worked`

      case "agile_scrum":
        return `
**Agile Scrum Model:**
- Sprint duration: 2-4 weeks
- Scrum Master: $XXX per sprint
- Product Owner: $XXX per sprint
- Development Team: $XXX per sprint
- Sprint planning and review included
- Monthly invoicing per completed sprint`

      case "change_requests":
        return `
**Change Request Model:**
- Impact assessment: $XXX (fixed fee)
- Implementation: Time and materials basis
- Senior Consultant: $XXX per hour
- Change documentation: $XXX per request
- Approval process included in base fee`

      case "generic_sows":
        return `
**Generic SOW Model:**
- Fixed price based on standard deliverables
- Phase-based payment schedule
- 25% upon contract signing
- 50% at milestone completion
- 25% upon final acceptance
- Change requests handled separately`

      default:
        return "Pricing structure to be determined based on selected SOW category."
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      // Create a new document
      const doc = createDocxFromMarkdown(getSowContent())

      // Generate the DOCX file
      const blob = await Packer.toBlob(doc)

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      // Generate unique filename with timestamp
      const now = new Date()
      const timestamp = now.toISOString().replace(/[-:]/g, "").replace("T", "_").substring(0, 15) // YYYYMMDD_HHMMSS
      a.download = `SOW_${timestamp}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating DOCX:", error)
      alert("Error generating DOCX file. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Helper function to parse text formatting
  const parseTextFormatting = (text: string): TextRun[] => {
    const runs: TextRun[] = []
    const parts = text.split("**")

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text
        if (parts[i]) {
          runs.push(new TextRun(parts[i]))
        }
      } else {
        // Bold text
        runs.push(new TextRun({ text: parts[i], bold: true }))
      }
    }

    return runs.length > 0 ? runs : [new TextRun(text)]
  }

  // Function to convert markdown to DOCX - MODIFIED to only include the exact content
  const createDocxFromMarkdown = (markdown: string) => {
    const lines = markdown.split("\n")
    const docElements: any[] = []

    let inList = false
    let listItems: Paragraph[] = []
    let currentListNumber = 1

    lines.forEach((line) => {
      // Skip empty lines
      if (line.trim() === "") return

      // Heading 1
      if (line.startsWith("# ")) {
        docElements.push(
          new Paragraph({
            text: line.substring(2),
            heading: HeadingLevel.HEADING_1,
            thematicBreak: true,
          }),
        )
      }
      // Heading 2
      else if (line.startsWith("## ")) {
        docElements.push(
          new Paragraph({
            text: line.substring(3),
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
        )
      }
      // Heading 3
      else if (line.startsWith("### ")) {
        docElements.push(
          new Paragraph({
            text: line.substring(4),
            heading: HeadingLevel.HEADING_3,
            spacing: {
              before: 300,
              after: 150,
            },
          }),
        )
      }
      // Numbered list
      else if (/^\d+\.\s/.test(line)) {
        if (!inList || !line.startsWith(`${currentListNumber}.`)) {
          // If we weren't in a list or this is a new list, add the previous list if it exists
          if (listItems.length > 0) {
            docElements.push(...listItems)
            listItems = []
          }
          inList = true
          currentListNumber = Number.parseInt(line.match(/^\d+/)?.[0] || "1", 10)
        }

        const content = line.replace(/^\d+\.\s/, "")
        const runs = parseTextFormatting(content)
        listItems.push(
          new Paragraph({
            children: runs,
            bullet: {
              level: 0,
            },
            spacing: {
              before: 100,
              after: 100,
            },
          }),
        )
        currentListNumber++
      }
      // Bullet list
      else if (line.startsWith("- ")) {
        if (!inList) {
          // If we weren't in a list, add the previous list if it exists
          if (listItems.length > 0) {
            docElements.push(...listItems)
            listItems = []
          }
          inList = true
        }

        const content = line.substring(2)
        const runs = parseTextFormatting(content)
        listItems.push(
          new Paragraph({
            children: runs,
            bullet: {
              level: 0,
            },
            spacing: {
              before: 100,
              after: 100,
            },
          }),
        )
      }
      // Bold text
      else if (line.includes("**")) {
        const parts = line.split("**")
        const runs: TextRun[] = []

        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 0) {
            // Regular text
            if (parts[i]) {
              runs.push(new TextRun(parts[i]))
            }
          } else {
            // Bold text
            runs.push(new TextRun({ text: parts[i], bold: true }))
          }
        }

        docElements.push(new Paragraph({ children: runs }))
      }
      // Regular text
      else {
        // If we were in a list, add the list items and reset
        if (inList) {
          docElements.push(...listItems)
          listItems = []
          inList = false
        }

        docElements.push(new Paragraph({ text: line }))
      }
    })

    // Add any remaining list items
    if (listItems.length > 0) {
      docElements.push(...listItems)
    }

    // Create the document - NO ADDITIONAL TEXT ADDED
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [...docElements],
        },
      ],
    })

    return doc
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-md p-6 bg-muted/30 prose prose-sm max-w-none max-h-96 overflow-y-auto">
        <div className="markdown" dangerouslySetInnerHTML={{ __html: markdownToHtml(getSowContent()) }} />
      </div>

      <div className="pt-6 border-t flex justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Proposals
        </Button>
        <Button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2">
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating DOCX...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download SOW
            </>
          )}
        </Button>
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
