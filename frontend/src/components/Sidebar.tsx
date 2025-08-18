import { useState, useEffect } from 'react'
import { Plus, MessageSquare, Trash2, Sun, Moon, PanelRightClose, Settings } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import SettingsModal from './Settings'

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  selectedConversation: string | null
  onSelectConversation: (id: string | null) => void
}

export default function Sidebar({ isOpen, onToggle, selectedConversation, onSelectConversation }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    fetchConversations()
    
    // Escuta eventos de criação de conversa
    const handleConversationCreated = () => {
      fetchConversations()
    }
    
    window.addEventListener('conversation-created', handleConversationCreated)
    
    return () => {
      window.removeEventListener('conversation-created', handleConversationCreated)
    }
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/conversations')
      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewConversation = () => {
    // Apenas limpa o chat atual (não cria conversa no backend ainda)
    onSelectConversation(null)
  }

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`http://localhost:3000/api/conversations/${id}`, {
        method: 'DELETE'
      })
      setConversations(conversations.filter(conv => conv.id !== id))
      if (selectedConversation === id) {
        onSelectConversation(null)
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Hoje'
    if (days === 1) return 'Ontem'
    if (days < 7) return `${days} dias atrás`
    return date.toLocaleDateString('pt-BR')
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="w-80 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-600 flex flex-col h-full transition-colors duration-300">
      <div className="p-6 border-b border-gray-200 dark:border-dark-600">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chat AI</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              title="Configurações"
            >
              <Settings size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
            >
              {theme === 'light' ? (
                <Moon size={18} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun size={18} className="text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              title="Fechar sidebar"
            >
              <PanelRightClose size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        <button
          onClick={createNewConversation}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          <Plus size={18} />
          Nova conversa
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="text-gray-300 dark:text-dark-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma conversa ainda</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Comece uma nova conversa!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedConversation === conversation.id
                    ? 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-700'
                    : 'hover:bg-emerald-50 dark:hover:bg-dark-700 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${
                    selectedConversation === conversation.id 
                      ? 'bg-primary-200 dark:bg-primary-800' 
                      : 'bg-gray-100 dark:bg-dark-600'
                  }`}>
                    <MessageSquare size={16} className={
                      selectedConversation === conversation.id 
                        ? 'text-primary-700 dark:text-primary-300' 
                        : 'text-gray-500 dark:text-gray-400'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate text-sm ${
                      selectedConversation === conversation.id
                        ? 'text-primary-900 dark:text-primary-100'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {conversation.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(conversation.updated_at)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => deleteConversation(conversation.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                >
                  <Trash2 size={14} className="text-black dark:text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  )
}