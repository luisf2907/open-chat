import { X, CheckCircle, XCircle, Info } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import type { Toast } from '../contexts/ToastContext'

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast()

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} className="text-primary-500" />
      case 'error':
        return <XCircle size={20} className="text-red-500" />
      case 'info':
        return <Info size={20} className="text-primary-500" />
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-primary-50/90 dark:bg-primary-900/20 border-primary-200/50 dark:border-primary-700/50'
      case 'error':
        return 'bg-red-50/90 dark:bg-red-900/20 border-red-200/50 dark:border-red-700/50'
      case 'info':
        return 'bg-primary-50/90 dark:bg-primary-900/20 border-primary-200/50 dark:border-primary-700/50'
    }
  }

  return (
    <div className={`${getBgColor()} rounded-xl border shadow-xl backdrop-blur-md p-4 flex items-center gap-3 animate-slide-in-right max-w-sm w-full`}>
      {getIcon()}
      <span className="flex-1 text-sm font-medium text-primary-900 dark:text-primary-100">
        {toast.message}
      </span>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-primary-400 hover:text-primary-600 dark:text-primary-500 dark:hover:text-primary-300 transition-colors"
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
