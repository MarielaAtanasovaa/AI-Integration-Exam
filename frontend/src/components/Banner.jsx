// Dismissible top banner used for error notifications coming back from n8n.
export default function Banner({ message, onClose }) {
  if (!message) return null
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className="flex w-full max-w-2xl items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-lg">
        <span className="mt-0.5 text-red-500">⚠️</span>
        <p className="flex-1 text-sm text-red-800">{message}</p>
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-600"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
