import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '../contexts/ThemeContext'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface MarkdownRendererProps {
  content: string
}

function CodeBlock({ children, ...props }: any) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)
  
  // Verifica se é um bloco de código (tem node.position ou múltiplas linhas)
  const isCodeBlock = props.node?.position || (typeof children === 'string' && children.includes('\n'))
  
  // Extrai a linguagem do className se for um bloco de código
  const className = props.className || ''
  const match = /language-(\w+)/.exec(className)
  const language = match ? match[1] : ''
  
  const handleCopy = async () => {
    const textToCopy = typeof children === 'string' ? children : children.toString()
    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  if (isCodeBlock && language) {
    return (
      <div className="relative group my-4">
        <div className="flex items-center justify-between bg-gray-100 dark:bg-dark-700 px-4 py-2 rounded-t-xl border-b border-gray-200 dark:border-dark-600">
          <span className="text-sm font-mono text-gray-600 dark:text-gray-300 font-medium">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded hover:bg-emerald-50 dark:hover:bg-dark-700 transition-colors"
          >
            {copied ? (
              <>
                <Check size={12} className="text-green-600" />
                Copiado
              </>
            ) : (
              <>
                <Copy size={12} />
                Copiar
              </>
            )}
          </button>
        </div>
        <SyntaxHighlighter
          style={theme === 'dark' ? oneDark : oneLight}
          language={language}
          customStyle={{
            margin: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: '0.75rem',
            borderBottomRightRadius: '0.75rem',
            fontSize: '0.875rem',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    )
  }
  
  return (
    <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 rounded font-mono text-sm border border-gray-200 dark:border-dark-600">
      {children}
    </code>
  )
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        code: CodeBlock,
        h1: ({ children }) => (
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-5 mb-2">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-medium text-gray-900 dark:text-white mt-4 mb-2">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-3 last:mb-0">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-gray-800 dark:text-gray-200 space-y-1 mb-3">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside text-gray-800 dark:text-gray-200 space-y-1 mb-3">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-gray-800 dark:text-gray-200">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-600 dark:text-gray-300 my-3">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline transition-colors"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-gray-900 dark:text-white">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-800 dark:text-gray-200">{children}</em>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border border-gray-200 dark:border-dark-600 rounded-lg">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-emerald-50 dark:bg-dark-700">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-dark-600">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-dark-600">
            {children}
          </td>
        ),
        hr: () => (
          <hr className="border-t border-gray-200 dark:border-dark-600 my-6" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}