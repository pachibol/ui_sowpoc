"use client"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown to HTML converter for basic formatting
  const renderMarkdown = (text: string) => {
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code blocks
      .replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-gray-100 p-3 rounded-md my-3 overflow-x-auto"><code class="text-sm">$1</code></pre>',
      )
      // Inline code
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      // Links
      .replace(
        /\[([^\]]+)\]$$([^)]+)$$/g,
        '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>',
      )
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-3">')
      // Unordered lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      // Ordered lists
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1 list-decimal">$1</li>')

    // Wrap in paragraphs if not already wrapped
    if (!html.includes("<h1>") && !html.includes("<h2>") && !html.includes("<h3>") && !html.includes("<li>")) {
      html = `<p class="mb-3">${html}</p>`
    }

    return html
  }

  return (
    <div
      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}
