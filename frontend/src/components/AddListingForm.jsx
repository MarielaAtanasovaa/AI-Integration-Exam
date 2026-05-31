import { useState } from 'react'
import { api, fileToBase64 } from '../api'

const ACCEPTED = '.jpg,.jpeg,.png,.webp,.gif'
const PROPERTY_TYPES = ['apartment', 'house', 'studio', 'office', 'maisonette']

const empty = {
  title: '',
  property_type: 'apartment',
  listing_type: 'for_sale',
  location: '',
  price: '',
  description: '',
}

export default function AddListingForm({ onAdded, onError }) {
  const [form, setForm] = useState(empty)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setOk(false)
    try {
      const payload = { ...form, price: Number(form.price) }
      if (file) payload.image = await fileToBase64(file)
      await api.addListing(payload)
      setOk(true)
      setForm(empty)
      setFile(null)
      e.target.reset?.()
      onAdded?.()
    } catch (err) {
      onError?.(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <input
        required
        value={form.title}
        onChange={set('title')}
        placeholder="Title (e.g. Two-bedroom apartment)"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={form.property_type}
          onChange={set('property_type')}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={form.listing_type}
          onChange={set('listing_type')}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="for_sale">For sale</option>
          <option value="for_rent">For rent</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          required
          value={form.location}
          onChange={set('location')}
          placeholder="Location (e.g. Lozenets, Sofia)"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <input
          required
          type="number"
          min="0"
          value={form.price}
          onChange={set('price')}
          placeholder={form.listing_type === 'for_rent' ? 'Monthly rent (EUR)' : 'Price (EUR)'}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </div>

      <textarea
        required
        value={form.description}
        onChange={set('description')}
        rows={3}
        placeholder="Description — this text is embedded for semantic search."
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
      />

      <div>
        <label className="mb-1 block text-xs text-slate-500">
          Image (JPG, JPEG, PNG, WEBP, GIF)
        </label>
        <input
          type="file"
          accept={ACCEPTED}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-brand-700 hover:file:bg-brand-100"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Add listing'}
        </button>
        {ok && <span className="text-sm text-emerald-600">✓ Listing added</span>}
      </div>
    </form>
  )
}
