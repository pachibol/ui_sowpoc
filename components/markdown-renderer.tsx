"use client"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Enhanced markdown to HTML converter
  const renderMarkdown = (text: string) => {
    let html = text
      // Normalize line breaks
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")

      // Handle horizontal rules (---)
      .replace(/^---+$/gm, '<hr class="my-6 border-gray-300" />')

      // Headers (must be processed before other formatting)
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-800">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-4 text-gray-800">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-6 text-gray-900">$1</h1>')

      // Code blocks (must be processed before inline code)
      .replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-gray-100 border border-gray-200 p-4 rounded-md my-4 overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>',
      )

      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono border">$1</code>')

      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')

      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')

      // Blockquotes
      .replace(
        /^> (.*$)/gm,
        '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700">$1</blockquote>',
      )

      // Links
      .replace(
        /\[([^\]]+)\]$$([^)]+)$$/g,
        '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>',
      )

      // Process lists
      .replace(/^\* (.*$)/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-6 mb-2 list-decimal">$1</li>')

      // Convert multiple line breaks to paragraph breaks
      .replace(/\n\n+/g, '</p><p class="mb-4 leading-relaxed text-gray-700">')

      // Wrap list items in ul tags
      .replace(/(<li class="ml-6 mb-2 list-disc">.*?<\/li>)/gs, '<ul class="my-4">$1</ul>')
      .replace(/(<li class="ml-6 mb-2 list-decimal">.*?<\/li>)/gs, '<ol class="my-4">$1</ol>')

    // Wrap content in paragraphs if not already wrapped in block elements
    if (
      !html.includes("<h1>") &&
      !html.includes("<h2>") &&
      !html.includes("<h3>") &&
      !html.includes("<ul>") &&
      !html.includes("<ol>") &&
      !html.includes("<blockquote>")
    ) {
      html = `<p class="mb-4 leading-relaxed text-gray-700">${html}</p>`
    } else {
      // Add opening paragraph tag if content doesn't start with a block element
      if (!html.match(/^<(h[1-6]|ul|ol|blockquote|pre|hr)/)) {
        html = `<p class="mb-4 leading-relaxed text-gray-700">${html}`
      }
      // Add closing paragraph tag if needed
      if (!html.match(/<\/(h[1-6]|ul|ol|blockquote|pre|p)>$/)) {
        html = `${html}</p>`
      }
    }

    return html
  }

  return (
    <div className="prose prose-sm max-w-none">
      <div
        className="text-gray-800 leading-relaxed space-y-1"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </div>
  )
}
