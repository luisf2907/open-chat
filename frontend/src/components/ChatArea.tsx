import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Sparkles, Bot, User, PlaneTakeoff, Square, PanelRightOpen, ArrowDown, Edit3, Check, X, Image, FileText, RotateCcw } from 'lucide-react'
import { useTypewriter } from '../hooks/useTypewriter'
import TypingIndicator from './TypingIndicator'
import MarkdownRenderer from './MarkdownRenderer'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  imageUrl?: string
  imageData?: string
  type?: 'text' | 'image'
  error?: boolean
  retryData?: {
    content: string
    model: string
    type: 'text' | 'image'
  }
}

interface Model {
  id: string
  name: string
  description: string
  badge?: string
  enabled: boolean
  default: boolean
  type: 'text' | 'image'
}

interface ChatAreaProps {
  conversationId: string | null
  selectedModel: string
  onModelChange: (model: string) => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onNewConversation: (conversationId: string) => void
}

interface ModelGroup {
  textModels: Model[]
  imageModels: Model[]
}

function MessageBubble({ 
  message, 
  isTyping = false, 
  isEditing = false,
  editingContent = '',
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditContentChange,
  onRetry
}: { 
  message: Message; 
  isTyping?: boolean;
  isEditing?: boolean;
  editingContent?: string;
  onStartEdit?: () => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onEditContentChange?: (content: string) => void;
  onRetry?: (retryData: NonNullable<Message['retryData']>) => void;
}) {
  const { displayText } = useTypewriter(isTyping ? message.content : '', 6)
  const content = isTyping ? displayText : message.content

  return (
    <div className={`group flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`flex gap-2 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          message.role === 'user' 
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white' 
            : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 text-gray-700 dark:text-gray-300'
        }`}>
          {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        <div className={`relative rounded-xl px-4 py-3 shadow-sm ${
          message.error
            ? 'bg-red-50/90 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200/60 dark:border-red-800/60'
            : message.role === 'user'
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
              : 'bg-white/80 dark:bg-dark-700/80 text-gray-900 dark:text-white border border-gray-200/60 dark:border-dark-600/60 backdrop-blur-sm'
        }`}>
          {/* Botão de editar (apenas para mensagens do usuário) */}
          {message.role === 'user' && !isEditing && onStartEdit && (
            <button
              onClick={onStartEdit}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg shadow-md hover:shadow-lg hover:scale-105"
              title="Editar mensagem"
            >
              <Edit3 size={12} className="text-gray-600 dark:text-gray-300" />
            </button>
          )}

          <div className="text-sm leading-relaxed">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editingContent}
                  onChange={(e) => onEditContentChange?.(e.target.value)}
                  className="w-full px-3 py-2 bg-white/90 dark:bg-dark-800/90 text-gray-900 dark:text-white border border-gray-200 dark:border-dark-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  rows={Math.max(2, editingContent.split('\n').length)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      onSaveEdit?.()
                    } else if (e.key === 'Escape') {
                      onCancelEdit?.()
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={onCancelEdit}
                    className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors flex items-center gap-1"
                  >
                    <X size={12} />
                    Cancelar
                  </button>
                  <button
                    onClick={onSaveEdit}
                    className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
                  >
                    <Check size={12} />
                    Salvar
                  </button>
                </div>
              </div>
            ) : message.error ? (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium">Não foi possível gerar a resposta.</div>
                  <div className="opacity-80 text-xs">Você pode tentar novamente.</div>
                </div>
                {message.retryData && onRetry && (
                  <button
                    onClick={() => onRetry(message.retryData!)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-200 transition-colors"
                    title="Tentar novamente"
                  >
                    <RotateCcw size={14} />
                    Retry
                  </button>
                )}
              </div>
            ) : message.type === 'image' && (message.imageData || message.imageUrl) ? (
              <div className="space-y-2">
                <img 
                  src={message.imageData ? `data:image/png;base64,${message.imageData}` : `http://localhost:3000${message.imageUrl}`} 
                  alt="Imagem gerada"
                  className="max-w-sm w-80 h-auto rounded-lg shadow-md"
                />
                {message.content && (
                  <div className="text-sm opacity-80">
                    {message.content}
                  </div>
                )}
              </div>
            ) : message.role === 'assistant' ? (
              <div>
                <MarkdownRenderer content={content} />
                {isTyping && displayText.length < message.content.length && (
                  <span className="inline-block w-1.5 h-4 bg-current ml-1 animate-pulse" />
                )}
              </div>
            ) : (
              <div className="whitespace-pre-wrap">
                {content}
              </div>
            )}
          </div>
          
          {!isEditing && (
            <div className={`text-xs mt-1.5 opacity-60 ${
              message.error
                ? 'text-red-600 dark:text-red-300'
                : message.role === 'user' ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatArea({ 
  conversationId, 
  selectedModel, 
  onModelChange, 
  sidebarOpen, 
  onToggleSidebar,
  onNewConversation 
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [textModels, setTextModels] = useState<Model[]>([])
  const [imageModels, setImageModels] = useState<Model[]>([])
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [isImageMode, setIsImageMode] = useState(false)
  const [selectedTextModel, setSelectedTextModel] = useState('')
  const [selectedImageModel, setSelectedImageModel] = useState('')
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [retryTargetId, setRetryTargetId] = useState<string | null>(null)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const streamTimeoutRef = useRef<number | null>(null)
  const scrollTimeoutRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    fetchModels()
  }, [])

  useEffect(() => {
    // Limpa streaming ativo ao trocar de conversa
    cleanupStreaming()
    
    if (conversationId) {
      fetchMessages()
    } else {
      setMessages([])
    }
  }, [conversationId])

  useEffect(() => {
    // Apenas scroll suave para streaming e novas mensagens durante conversa ativa
    if (shouldAutoScroll && (isStreaming || streamingMessage)) {
      scrollToBottom()
    }
  }, [streamingMessage, shouldAutoScroll, isStreaming])

  // Detecta se o usuário está no final da página (throttled)
  const checkScrollPosition = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50 // Tolerância reduzida para 50px
        setShouldAutoScroll(isAtBottom)
      }
    }, 100) // Throttle de 100ms
  }

  // Scroll contínuo durante streaming - SEMPRE quando está digitando
  useEffect(() => {
    if (isStreaming && streamingMessage) {
      // Durante streaming, sempre faz scroll independente de shouldAutoScroll
      const frameId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom(true) // Scroll imediato e contínuo
        })
      })
      
      return () => cancelAnimationFrame(frameId)
    }
  }, [streamingMessage?.content, isStreaming])

  // Cleanup streaming ao desmontar componente
  useEffect(() => {
    return () => {
      cleanupStreaming()
    }
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/models')
      const data: ModelGroup = await response.json()
      setTextModels(data.textModels)
      setImageModels(data.imageModels)
      
      // Define os modelos padrão se não estiverem definidos
      if (!selectedTextModel) {
        const defaultText = data.textModels.find(m => m.default)?.id || data.textModels[0]?.id
        setSelectedTextModel(defaultText)
      }
      if (!selectedImageModel) {
        const defaultImage = data.imageModels.find(m => m.default)?.id || data.imageModels[0]?.id
        setSelectedImageModel(defaultImage)
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    }
  }

  const fetchMessages = async () => {
    if (!conversationId) return
    
    try {
      const response = await fetch(`http://localhost:3000/api/conversations/${conversationId}/messages`)
      const data = await response.json()
      const mappedMessages = data.map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        type: msg.message_type || 'text',
        imageData: msg.image_data
      }))
      setMessages(mappedMessages)
      // Scroll instantâneo ao final após carregar mensagens - aguarda renderização
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom(true)
        })
      })
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const scrollToBottom = (immediate = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: immediate ? 'instant' : 'smooth' 
      })
    }
  }

  // Força scroll para o final e reativa auto-scroll
  const forceScrollToBottom = () => {
    setShouldAutoScroll(true)
    scrollToBottom()
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const messageContent = input.trim()
    setInput('')
    setLoading(true)
    // Se for retry in-place, marca bolha alvo como "digitando"
    if (retryTargetId) {
      setTypingMessageId(retryTargetId)
      // Remove estado de erro visual imediatamente
      setMessages(prev => prev.map(m => m.id === retryTargetId ? { ...m, error: false, content: '' } : m))
    }
    
    // Garante que vai fazer scroll para ver a nova mensagem
    setShouldAutoScroll(true)

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
      type: isImageMode ? 'image' : 'text'
    }

    const currentModel = isImageMode ? selectedImageModel : selectedTextModel


    try {
      if (conversationId) {
        // Se não for retry, adiciona mensagem do usuário; no retry, mantemos bolhas existentes
        if (!retryTargetId) {
          setMessages(prev => [...prev, userMessage])
        }
        
        const response = await fetch(`http://localhost:3000/api/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            content: messageContent,
            model: currentModel,
            type: isImageMode ? 'image' : 'text'
          })
        })

        if (response.ok) {
          const data = await response.json()
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.assistant_response || '',
            timestamp: new Date().toISOString(),
            type: isImageMode ? 'image' : 'text',
            imageUrl: data.imageUrl,
            imageData: data.imageData
          }
          
          if (retryTargetId) {
            // Substitui a bolha de erro diretamente pelo conteúdo e animação de digitação
            setTypingMessageId(retryTargetId)
            setMessages(prev => prev.map(m => m.id === retryTargetId ? { ...assistantMessage, id: m.id } : m))
            setShouldAutoScroll(true)
            const duration = (assistantMessage.content?.length || 0) * 6 + 500
            streamTimeoutRef.current = setTimeout(() => {
              setTypingMessageId(null)
              setRetryTargetId(null)
            }, duration)
          } else {
            setStreamingMessage(assistantMessage)
            setIsStreaming(true)
            setShouldAutoScroll(true) // Garante auto-scroll durante streaming
            streamTimeoutRef.current = setTimeout(() => {
              setStreamingMessage(null)
              setIsStreaming(false)
              setMessages(prev => [...prev, assistantMessage])
            }, data.assistant_response.length * 6 + 500)
          }
        } else {
          // Mostra mensagem de erro com opção de retry
          if (retryTargetId) {
            // Mantém a bolha de erro e repõe retryData
            setMessages(prev => prev.map(m => m.id === retryTargetId ? {
              ...m,
              error: true,
              content: 'Erro ao gerar resposta',
              retryData: { content: messageContent, model: currentModel, type: isImageMode ? 'image' : 'text' }
            } : m))
          } else {
            const errMsg: Message = {
              id: `assistant-error-${Date.now()}`,
              role: 'assistant',
              content: 'Erro ao gerar resposta',
              timestamp: new Date().toISOString(),
              error: true,
              retryData: { content: messageContent, model: currentModel, type: isImageMode ? 'image' : 'text' }
            }
            setMessages(prev => [...prev, errMsg])
          }
        }
      } else {
        // Para chat sem contexto, primeiro cria uma conversa automaticamente
        try {
          const createResponse = await fetch('http://localhost:3000/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: messageContent.substring(0, 50) + (messageContent.length > 50 ? '...' : '') })
          })
          
          if (createResponse.ok) {
            const newConv = await createResponse.json()
            // Atualiza o estado para usar a nova conversa
            onNewConversation(newConv.id)
            
            // Força atualização imediata da sidebar
            window.dispatchEvent(new CustomEvent('conversation-created', { detail: newConv }))
            
            // Envia a mensagem para a nova conversa
            setMessages([userMessage])
            
            const response = await fetch(`http://localhost:3000/api/conversations/${newConv.id}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                content: messageContent,
                model: currentModel,
                type: isImageMode ? 'image' : 'text'
              })
            })

            if (response.ok) {
              const data = await response.json()
              const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.assistant_response,
                timestamp: new Date().toISOString(),
                type: isImageMode ? 'image' : 'text',
                imageUrl: data.imageUrl,
                imageData: data.imageData
              }
              
              if (retryTargetId) {
                setTypingMessageId(retryTargetId)
                setMessages(prev => prev.map(m => m.id === retryTargetId ? { ...assistantMessage, id: m.id } : m))
                const duration = (assistantMessage.content?.length || 0) * 6 + 500
                streamTimeoutRef.current = setTimeout(() => {
                  setTypingMessageId(null)
                  setRetryTargetId(null)
                }, duration)
              } else {
                setStreamingMessage(assistantMessage)
                setIsStreaming(true)
                streamTimeoutRef.current = setTimeout(() => {
                  setStreamingMessage(null)
                  setIsStreaming(false)
                  setMessages(prev => [...prev, assistantMessage])
                }, data.assistant_response.length * 6 + 500)
              }
            } else {
              if (retryTargetId) {
                setMessages(prev => prev.map(m => m.id === retryTargetId ? {
                  ...m,
                  error: true,
                  content: 'Erro ao gerar resposta',
                  retryData: { content: messageContent, model: currentModel, type: isImageMode ? 'image' : 'text' }
                } : m))
              } else {
                const errMsg: Message = {
                  id: `assistant-error-${Date.now()}`,
                  role: 'assistant',
                  content: 'Erro ao gerar resposta',
                  timestamp: new Date().toISOString(),
                  error: true,
                  retryData: { content: messageContent, model: currentModel, type: isImageMode ? 'image' : 'text' }
                }
                setMessages(prev => [...prev, errMsg])
              }
            }
          }
        } catch (convError) {
          console.error('Error creating conversation:', convError)
          // Fallback para chat simples
          setMessages([userMessage])
          
          const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: messageContent,
              model: currentModel,
              type: isImageMode ? 'image' : 'text'
            })
          })
          if (response.ok) {
            const data = await response.json()
            const assistantMessage: Message = {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: data.response,
              timestamp: new Date().toISOString(),
              type: isImageMode ? 'image' : 'text',
              imageData: data.imageData
            }
            
            if (retryTargetId) {
              setTypingMessageId(retryTargetId)
              setMessages(prev => prev.map(m => m.id === retryTargetId ? { ...assistantMessage, id: m.id } : m))
              setShouldAutoScroll(true)
              const duration = (assistantMessage.content?.length || 0) * 6 + 500
              streamTimeoutRef.current = setTimeout(() => {
                setTypingMessageId(null)
                setRetryTargetId(null)
              }, duration)
            } else {
              setStreamingMessage(assistantMessage)
              setIsStreaming(true)
              setShouldAutoScroll(true) // Garante auto-scroll durante streaming
              streamTimeoutRef.current = setTimeout(() => {
                setStreamingMessage(null)
                setIsStreaming(false)
                setMessages(prev => [...prev, assistantMessage])
              }, data.response.length * 6 + 500)
            }
          } else {
            if (retryTargetId) {
              setMessages(prev => prev.map(m => m.id === retryTargetId ? {
                ...m,
                error: true,
                content: 'Erro ao gerar resposta',
                retryData: { content: messageContent, model: currentModel, type: isImageMode ? 'image' : 'text' }
              } : m))
            } else {
              const errMsg: Message = {
                id: `assistant-error-${Date.now()}`,
                role: 'assistant',
                content: 'Erro ao gerar resposta',
                timestamp: new Date().toISOString(),
                error: true,
                retryData: { content: messageContent, model: currentModel, type: isImageMode ? 'image' : 'text' }
              }
              setMessages(prev => [...prev, errMsg])
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Falha inesperada: adiciona bubble de erro com retry
      if (retryTargetId) {
        setMessages(prev => prev.map(m => m.id === retryTargetId ? {
          ...m,
          error: true,
          content: 'Erro ao enviar mensagem',
          retryData: { content: messageContent, model: currentModel, type: isImageMode ? 'image' : 'text' }
        } : m))
      } else {
        const errMsg: Message = {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: 'Erro ao enviar mensagem',
          timestamp: new Date().toISOString(),
          error: true,
          retryData: { content: messageContent, model: currentModel, type: isImageMode ? 'image' : 'text' }
        }
        setMessages(prev => [...prev, errMsg])
      }
    } finally {
      setLoading(false)
      if (retryTargetId) {
        // Finaliza estado de digitação da bolha alvo se algo ficou pendente
        setTypingMessageId(null)
      }
    }
  }

  // Função para limpar streaming ativo (evita mensagens duplicadas ao trocar conversa)
  const cleanupStreaming = () => {
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current)
      streamTimeoutRef.current = null
    }
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current) 
      scrollTimeoutRef.current = null
    }
    setStreamingMessage(null)
    setIsStreaming(false)
    setLoading(false)
  }

  const stopStreaming = () => {
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current)
      streamTimeoutRef.current = null
    }
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = null
    }
    if (streamingMessage) {
      setMessages(prev => [...prev, streamingMessage])
    }
    setStreamingMessage(null)
    setIsStreaming(false)
    setLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startEditingMessage = (message: Message) => {
    setEditingMessageId(message.id)
    setEditingContent(message.content)
  }

  const cancelEditing = () => {
    setEditingMessageId(null)
    setEditingContent('')
  }

  const saveEditedMessage = async (messageId: string) => {
    if (!editingContent.trim() || !conversationId) return

    try {
      // Encontra o índice da mensagem editada
      const messageIndex = messages.findIndex(msg => msg.id === messageId)
      if (messageIndex === -1) return

      // Remove todas as mensagens após a editada (incluindo respostas do assistente)
      const newMessages = messages.slice(0, messageIndex)
      
      // Atualiza a mensagem editada
      const editedMessage = {
        ...messages[messageIndex],
        content: editingContent.trim(),
        timestamp: new Date().toISOString()
      }
      
      // Atualiza o estado local
      setMessages([...newMessages, editedMessage])
      setEditingMessageId(null)
      setEditingContent('')
      setLoading(true)
      setShouldAutoScroll(true)

      // Reenvia a mensagem editada para a API
      const response = await fetch(`http://localhost:3000/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: editingContent.trim(),
          model: selectedModel 
        })
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.assistant_response,
          timestamp: new Date().toISOString()
        }
        
        setStreamingMessage(assistantMessage)
        setIsStreaming(true)
        setShouldAutoScroll(true)
        streamTimeoutRef.current = setTimeout(() => {
          setStreamingMessage(null)
          setIsStreaming(false)
          setMessages(prev => [...prev, assistantMessage])
        }, data.assistant_response.length * 6 + 500)
      } else {
        const errMsg: Message = {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: 'Erro ao gerar resposta',
          timestamp: new Date().toISOString(),
          error: true,
          retryData: { content: editingContent.trim(), model: selectedModel, type: 'text' }
        }
        setMessages(prev => [...prev, errMsg])
      }
    } catch (error) {
      console.error('Error editing message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = (retryData: NonNullable<Message['retryData']>) => {
    // Restaura modo e modelo, copia a mesma mensagem para o input (sem auto-enviar)
    if (retryData.type === 'image') {
      setIsImageMode(true)
      setSelectedImageModel(retryData.model)
    } else {
      setIsImageMode(false)
      setSelectedTextModel(retryData.model)
      onModelChange(retryData.model)
    }
    setInput(retryData.content)
    setShouldAutoScroll(true)
    // Foca o textarea e posiciona o cursor ao final
    setTimeout(() => {
      if (inputRef.current) {
        const el = inputRef.current
        el.focus()
        const len = el.value.length
        el.setSelectionRange(len, len)
      }
    }, 0)
  }

  const currentModels = isImageMode ? imageModels : textModels
  const currentSelectedModel = isImageMode ? selectedImageModel : selectedTextModel
  const selectedModelData = currentModels.find(m => m.id === currentSelectedModel)
  const modelSelectorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!modelSelectorRef.current) return
      if (!(e.target instanceof Node)) return
      if (!modelSelectorRef.current.contains(e.target)) {
        setShowModelSelector(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [modelSelectorRef])

  return (
    <div className="flex flex-col flex-1 h-full bg-gray-50 dark:bg-dark-900 relative">
      <div className="p-4 bg-gray-50 dark:bg-dark-900">
        <div className="flex items-center gap-3">
          {/* Botão toggle sidebar - ao lado do seletor quando fechada */}
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-dark-800/60 transition-colors"
              title="Abrir sidebar"
            >
              <PanelRightOpen size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
          )}
          
          {/* Botões de modo */}
          <div className="flex bg-white/40 dark:bg-dark-800/40 backdrop-blur-sm rounded-lg border border-gray-200/60 dark:border-dark-600/60 p-1">
            <button
              onClick={() => setIsImageMode(false)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                !isImageMode 
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-dark-700/60'
              }`}
            >
              <FileText size={14} />
              Texto
            </button>
            <button
              onClick={() => setIsImageMode(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                isImageMode 
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-dark-700/60'
              }`}
            >
              <Image size={14} />
              Imagem
            </button>
          </div>

          {/* Seletor de modelo */}
          <div className="relative" ref={modelSelectorRef}>
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200/60 dark:border-dark-600/60 hover:bg-white/60 dark:hover:bg-dark-800/60 transition-all duration-200 bg-white/40 dark:bg-dark-800/40 backdrop-blur-sm"
            >
              <Sparkles size={16} className="text-primary-600 dark:text-primary-400" />
              <div className="text-left">
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                  {selectedModelData?.name || currentSelectedModel}
                </div>
              </div>
              {selectedModelData?.badge && (
                <span className="text-xs px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md font-medium">
                  {selectedModelData.badge}
                </span>
              )}
              <ChevronDown size={14} className="text-gray-600 dark:text-gray-300" />
            </button>

            {showModelSelector && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-emerald-900 dark:bg-emerald-900 border border-emerald-700 rounded-xl shadow-xl z-30 overflow-hidden text-emerald-100">
                {currentModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      if (isImageMode) {
                        setSelectedImageModel(model.id)
                      } else {
                        setSelectedTextModel(model.id)
                        onModelChange(model.id)
                      }
                      setShowModelSelector(false)
                    }}
                    className={`w-full text-left p-3 hover:bg-emerald-800 transition-colors border-b border-emerald-800 last:border-b-0 ${
                      currentSelectedModel === model.id ? 'bg-emerald-800/25' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-white">{model.name}</div>
                        <div className="text-xs text-emerald-200 mt-0.5">{model.description}</div>
                      </div>
                      {model.badge && (
                        <span className="text-xs px-1.5 py-0.5 bg-emerald-800/30 text-emerald-100 rounded-md font-medium">
                          {model.badge}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={isStreaming ? undefined : checkScrollPosition}
      >
        {messages.length === 0 && !streamingMessage ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Como posso ajudar hoje?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {conversationId 
                  ? 'Continue nossa conversa digitando uma mensagem abaixo.'
                  : 'Comece uma nova conversa fazendo uma pergunta ou enviando uma mensagem.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="px-4 py-2 space-y-4">
      {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message}
        isTyping={typingMessageId === message.id}
                isEditing={editingMessageId === message.id}
                editingContent={editingContent}
                onStartEdit={() => startEditingMessage(message)}
                onSaveEdit={() => saveEditedMessage(message.id)}
                onCancelEdit={cancelEditing}
        onEditContentChange={setEditingContent}
        onRetry={message.retryData ? ((rd) => { setRetryTargetId(message.id); handleRetry(rd) }) : undefined}
              />
            ))}
            
            {loading && !streamingMessage && !retryTargetId && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-4xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center">
                    <Bot size={16} className="text-gray-700 dark:text-gray-300" />
                  </div>
                  <div className="rounded-xl px-4 py-3 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm border border-gray-200/60 dark:border-dark-600/60 shadow-sm">
                    <TypingIndicator />
                  </div>
                </div>
              </div>
            )}
            
            {streamingMessage && (
              <MessageBubble message={streamingMessage} isTyping={true} />
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Botão para voltar ao final quando não está em auto-scroll e não está streaming */}
        {!shouldAutoScroll && !isStreaming && (messages.length > 0 || streamingMessage) && (
          <div className="absolute bottom-20 right-6 z-10">
            <button
              onClick={forceScrollToBottom}
              className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              title="Ir para o final"
            >
              <ArrowDown size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50 via-gray-50/60 to-transparent dark:from-dark-900 dark:via-dark-900/60 dark:to-transparent pointer-events-none"></div>
        <div className="relative z-10 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/40 dark:border-dark-600/40 shadow-2xl shadow-black/10 dark:shadow-black/30">
              <div className="flex items-end gap-2 p-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isImageMode ? "Descreva a imagem que deseja gerar..." : "Digite sua mensagem..."}
                    className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none text-sm leading-relaxed max-h-28 min-h-[44px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-dark-600"
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.min(target.scrollHeight, 112) + 'px'
                    }}
                  />
                </div>
                
                {isStreaming || (loading && !streamingMessage) ? (
                  <button
                    onClick={stopStreaming}
                    className="flex-shrink-0 w-11 h-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center group"
                    title="Parar geração"
                  >
                    <Square size={15} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="flex-shrink-0 w-11 h-11 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-dark-600 dark:disabled:to-dark-700 text-white disabled:text-gray-500 dark:disabled:text-gray-400 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:shadow-md flex items-center justify-center group disabled:cursor-not-allowed"
                    title="Enviar mensagem"
                  >
                    <PlaneTakeoff size={15} className="group-hover:scale-110 group-disabled:scale-100 transition-transform" />
                  </button>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}