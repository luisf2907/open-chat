import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import ToastContainer from './components/ToastContainer'
import { ToastProvider } from './contexts/ToastContext'
import { ColorProvider } from './contexts/ColorContext'

function App() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleNewConversation = (conversationId: string) => {
    setSelectedConversation(conversationId)
  }

  return (
    <ColorProvider>
      <ToastProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
          <Sidebar 
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
          />
          <ChatArea 
            conversationId={selectedConversation}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onNewConversation={handleNewConversation}
          />
          <ToastContainer />
        </div>
      </ToastProvider>
    </ColorProvider>
  )
}

export default App
