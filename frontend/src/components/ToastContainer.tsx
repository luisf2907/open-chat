import { X, CheckCircle, XCircle, Info } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import type { Toast } from '../contexts/ToastContext'

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast()

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />
      case 'error':
        return <XCircle size={20} className="text-red-500" />
      case 'info':
        return <Info size={20} className="text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-white dark:bg-dark-800 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-white dark:bg-dark-800 border-red-200 dark:border-red-800'
      case 'info':
        return 'bg-white dark:bg-dark-800 border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div className={`${getBgColor()} rounded-xl border shadow-lg backdrop-blur-sm p-4 flex items-center gap-3 animate-slide-in-right max-w-sm w-full`}>
      {getIcon()}
      <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
        {toast.message}
      </span>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
