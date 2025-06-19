import { Wizard } from "@/components/wizard"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-[80%] mx-auto px-4">
        {/* Card principal */}
        <div className="bg-white p-6 rounded shadow">
          {/* Header con logo alineado */}
          <div className="flex items-center mb-6">
            <img src="/logo_main.png" alt="Globant" className="h-8 w-auto mr-4" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">SOW Generator</h1>
              <p className="text-sm text-gray-600">
                Generate professional Statements of Work by selecting your contract type and uploading relevant documents.
              </p>
            </div>
          </div>

          {/* Wizard */}
          <Wizard />
        </div>
      </div>
    </div>
  );
}
