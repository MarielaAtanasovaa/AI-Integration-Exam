import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import Banner from './components/Banner'
import Logo from './components/Logo'
import PropertyManagement from './components/PropertyManagement'
import BuyerSearch from './components/BuyerSearch'

export default function App() {
  const [tab, setTab] = useState('manage') // 'manage' | 'search'
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.listListings()
      const items = res?.items ?? res?.listings ?? (Array.isArray(res) ? res : [])
      setListings(items)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Reset scroll to the top whenever the user switches sections.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tab])

  return (
    <div className="min-h-full">
      <Banner message={error} onClose={() => setError('')} />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">NovaDom Realty</h1>
              <p className="text-xs text-slate-500">Smart Real Estate Matchmaker</p>
            </div>
          </div>
          <nav className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm">
            <button
              onClick={() => setTab('manage')}
              className={`rounded-md px-4 py-1.5 font-medium transition ${
                tab === 'manage' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Property Management
            </button>
            <button
              onClick={() => setTab('search')}
              className={`rounded-md px-4 py-1.5 font-medium transition ${
                tab === 'search' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Buyer Search
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === 'manage' ? (
          <PropertyManagement
            listings={listings}
            loading={loading}
            refresh={refresh}
            onError={setError}
          />
        ) : (
          <BuyerSearch onError={setError} />
        )}
      </main>
    </div>
  )
}
