export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 px-4 py-3">
      <div className="flex space-x-1">
  <div className="w-2 h-2 bg-emerald-700 dark:bg-gray-400 rounded-full animate-bounce-dots"></div>
  <div className="w-2 h-2 bg-emerald-700 dark:bg-gray-400 rounded-full animate-bounce-dots" style={{ animationDelay: '0.2s' }}></div>
  <div className="w-2 h-2 bg-emerald-700 dark:bg-gray-400 rounded-full animate-bounce-dots" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Digitando...</span>
    </div>
  )
}