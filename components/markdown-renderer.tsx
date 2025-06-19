"use client"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderMarkdown = (text: string) => {
    let html = text
      // Primero, normalizar espacios y saltos de línea
      .trim()

      // Agregar saltos de línea antes de títulos si no los tienen
      .replace(/([.!?])\s*(#{1,6}\s)/g, "$1\n\n$2")

      // Agregar saltos de línea después de --- si no los tienen
      .replace(/---\s*([^-])/g, "---\n\n$1")

      // Agregar saltos de línea antes de --- si no los tienen
      .replace(/([.!?])\s*---/g, "$1\n\n---")

      // Procesar títulos con saltos de línea apropiados
      .replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
        const level = hashes.length
        const classes = {
          1: "text-2xl font-bold mt-8 mb-6 text-gray-900 border-b border-gray-200 pb-2",
          2: "text-xl font-semibold mt-8 mb-4 text-gray-800",
          3: "text-lg font-semibold mt-6 mb-3 text-gray-800",
          4: "text-base font-semibold mt-4 mb-2 text-gray-800",
          5: "text-sm font-semibold mt-4 mb-2 text-gray-700",
          6: "text-sm font-medium mt-3 mb-2 text-gray-700",
        }
        return `<h${level} class="${classes[level as keyof typeof classes]}">${title.trim()}</h${level}>`
      })

      // Procesar líneas horizontales
      .replace(/^---+$/gm, '<hr class="my-6 border-gray-300" />')

      // Procesar blockquotes (líneas que empiezan con >)
      .replace(
        /^>\s*(.+)$/gm,
        '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700 rounded-r">$1</blockquote>',
      )

      // Procesar código en bloque
      .replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-gray-100 border border-gray-200 p-4 rounded-md my-4 overflow-x-auto"><code class="text-sm font-mono text-gray-800">$1</code></pre>',
      )

      // Procesar código inline
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono border text-gray-800">$1</code>',
      )

      // Procesar texto en negrita
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')

      // Procesar texto en cursiva
      .replace(/\*([^*]+)\*/g, '<em class="italic text-gray-700">$1</em>')

      // Procesar enlaces
      .replace(
        /\[([^\]]+)\]$$([^)]+)$$/g,
        '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>',
      )

      // Procesar listas no ordenadas
      .replace(/^[*\-+]\s+(.+)$/gm, '<li class="ml-4 mb-1">$1</li>')

      // Procesar listas ordenadas
      .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 mb-1">$1</li>')

      // Convertir saltos de línea dobles en separadores de párrafo
      .replace(/\n\s*\n/g, "\n\n||PARAGRAPH_BREAK||\n\n")

      // Convertir saltos de línea simples en espacios (excepto después de elementos de bloque)
      .replace(/(?<!>)\n(?!<)/g, " ")

      // Restaurar los separadores de párrafo
      .replace(/\|\|PARAGRAPH_BREAK\|\|/g, '</p><p class="mb-4 leading-relaxed text-gray-700">')

      // Envolver listas en elementos ul/ol
      .replace(
        /(<li class="ml-4 mb-1">.*?<\/li>)(?:\s*<li class="ml-4 mb-1">.*?<\/li>)*/g,
        '<ul class="my-4 list-disc list-inside">$&</ul>',
      )

    // Limpiar espacios extra
    html = html.replace(/\s+/g, " ").trim()

    // Envolver en párrafo inicial si no empieza con elemento de bloque
    if (!html.match(/^<(h[1-6]|ul|ol|blockquote|pre|hr)/)) {
      html = `<p class="mb-4 leading-relaxed text-gray-700">${html}`
    }

    // Cerrar párrafo final si es necesario
    if (!html.match(/<\/(h[1-6]|ul|ol|blockquote|pre|p|hr)>$/)) {
      html = `${html}</p>`
    }

    return html
  }

  return (
    <div className="prose prose-sm max-w-none">
      <div className="text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
    </div>
  )
}
