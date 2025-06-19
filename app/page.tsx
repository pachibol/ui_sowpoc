import { Wizard } from "@/components/wizard"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <img src="/logo_main.png" alt="Globant" className="h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SOW Generator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Generate professional Statements of Work by selecting your contract type and uploading relevant documents.
          </p>
        </div>

        {/* Wizard */}
        <Wizard />
      </div>
    </div>
  )
}
