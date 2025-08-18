import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm max-w-md ${
        type === 'success'
          ? 'bg-green-900/95 border-green-700 text-green-100'
          : 'bg-red-900/95 border-red-700 text-red-100'
      }`}>
        {type === 'success' ? (
          <CheckCircle size={20} className="text-green-300 flex-shrink-0" />
        ) : (
          <XCircle size={20} className="text-red-300 flex-shrink-0" />
        )}

        <span className="text-sm font-medium flex-1">{message}</span>

        <button
          onClick={onClose}
          className={`p-1 rounded-md transition-colors hover:bg-white/10 text-white/90`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
