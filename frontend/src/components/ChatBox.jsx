import { useRef, useState, useEffect } from 'react'
import { api } from '../api'
import { getSessionId, newSessionId } from '../lib/format'

// Role-tagged chat to the n8n AI Agent. `role` is fixed by which section renders
// this box ("broker" or "client") — there is no role picker.
export default function ChatBox({ role, accent, placeholder, suggestions = [], onError }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [sessionId, setSessionId] = useState(() => getSessionId(role))
  const listRef = useRef(null)

  function newChat() {
    setMessages([])
    setInput('')
    setSessionId(newSessionId(role))
  }

  useEffect(() => {
    // Scroll only the message list (not the whole page) to the latest message.
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy])

  async function send(text) {
    const message = (text ?? input).trim()
    if (!message || busy) return
    setInput('')
    setMessages((m) => [...m, { from: 'user', text: message }])
    setBusy(true)
    try {
      const res = await api.chat({ message, role, sessionId })
      const reply = res?.reply ?? res?.output ?? res?.text ?? res?.message ?? '(no response)'
      setMessages((m) => [...m, { from: 'agent', text: reply }])
    } catch (e) {
      setMessages((m) => [
        ...m,
        { from: 'agent', text: 'The AI assistant is temporarily unavailable. Please try again later.', error: true },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-96 flex-col rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-end border-b border-slate-100 px-3 py-1.5">
        <button
          onClick={newChat}
          disabled={busy || messages.length === 0}
          className="text-xs font-medium text-slate-400 hover:text-slate-600 disabled:opacity-40"
        >
          + New chat
        </button>
      </div>
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Ask the Real Estate Advisor a question.</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                m.from === 'user'
                  ? `${accent} text-white`
                  : m.error
                    ? 'bg-red-50 text-red-700'
                    : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-400">
              Thinking…
            </div>
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        className="flex gap-2 border-t border-slate-100 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={busy}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${accent}`}
        >
          Send
        </button>
      </form>
    </div>
  )
}
