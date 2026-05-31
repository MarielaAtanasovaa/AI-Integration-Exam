import { useMemo, useState } from 'react'
import { api } from '../api'
import PropertyCard from './PropertyCard'
import ChatBox from './ChatBox'

// Client-side quick filters over the returned semantic matches.
const CHIPS = [
  { key: 'sale', label: 'For sale', test: (p) => p.listing_type === 'for_sale' },
  { key: 'rent', label: 'For rent', test: (p) => p.listing_type === 'for_rent' },
  { key: 'sofia', label: 'Sofia', test: (p) => /sofia/i.test(p.location || '') },
  { key: 'under1000', label: 'Under 1000 EUR', test: (p) => Number(p.price) < 1000 },
  { key: 'balcony', label: 'Balcony', test: (p) => /balcon/i.test(p.description || '') },
  { key: 'metro', label: 'Metro', test: (p) => /metro/i.test(p.description || '') },
]

export default function BuyerSearch({ onError }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null) // null = no search yet
  const [noMatch, setNoMatch] = useState(false)
  const [busy, setBusy] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [active, setActive] = useState(() => new Set())

  async function runSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (!q || busy) return
    setBusy(true)
    setSearchError('')
    setNoMatch(false)
    setActive(new Set())
    try {
      const res = await api.search(q)
      const matches = res?.matches ?? res?.items ?? (Array.isArray(res) ? res : [])
      setResults(matches)
      setNoMatch(matches.length === 0)
    } catch (err) {
      setResults([])
      setSearchError('Something went wrong while searching. Please try again later.')
      onError?.(err.message)
    } finally {
      setBusy(false)
    }
  }

  function toggleChip(key) {
    setActive((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const displayed = useMemo(() => {
    if (!results) return []
    const tests = [...active].map((k) => CHIPS.find((c) => c.key === k)?.test).filter(Boolean)
    return results.filter((p) => tests.every((t) => t(p)))
  }, [results, active])

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-bold text-slate-900">Buyer Search</h2>
        <p className="text-sm text-slate-500">
          Describe what you want in plain language — semantic match over the catalogue.
        </p>
      </header>

      {/* Intro card */}
      <div className="rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50 to-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <h3 className="font-semibold text-slate-900">AI-powered property matching</h3>
            <p className="text-sm text-slate-600">
              Find the best property match instantly using AI-powered semantic search.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={runSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. a bright, quiet two-bedroom with a balcony close to a park"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? 'Searching…' : 'Search'}
        </button>
      </form>

      {/* Loading state */}
      {busy && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-12 text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          Finding best matches…
        </div>
      )}

      {/* Error state */}
      {!busy && searchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          {searchError}
        </div>
      )}

      {/* Empty state — before any search */}
      {!busy && !searchError && results === null && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
          <p className="text-sm font-medium text-slate-600">Start by describing your ideal property.</p>
          <p className="mt-1 text-sm text-slate-400">
            Example: “quiet two-bedroom near metro with balcony”
          </p>
        </div>
      )}

      {/* No-match state */}
      {!busy && !searchError && noMatch && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-10 text-center">
          <p className="text-sm font-medium text-amber-800">No strong match found.</p>
          <p className="mt-1 text-sm text-amber-700">
            Try adding property type, or must-have features.
          </p>
        </div>
      )}

      {/* Results + filter chips */}
      {!busy && !searchError && results && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Filter:</span>
            {CHIPS.map((c) => {
              const on = active.has(c.key)
              return (
                <button
                  key={c.key}
                  onClick={() => toggleChip(c.key)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    on
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              )
            })}
          </div>

          {displayed.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {displayed.map((p) => (
                <PropertyCard key={p.id ?? p.property_id} p={p} similarity={p.similarity} />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-400">
              No results match the selected filters.
            </p>
          )}
        </div>
      )}

      {/* Buyer chat */}
      <div className="space-y-2 pt-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Buyer chat</h3>
        <ChatBox
          role="client"
          accent="bg-brand-600"
          placeholder="e.g. Recommend something quiet near a metro under 100,000 EUR"
          suggestions={[
            'Which properties have a balcony and mountain views?',
            'Recommend something quiet and close to a metro under 100,000 EUR.',
            'Show me apartments for rent under 1,000 EUR.',
          ]}
          onError={onError}
        />
      </div>
    </section>
  )
}
