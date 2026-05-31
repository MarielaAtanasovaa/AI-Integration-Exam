// Thin wrapper around the n8n webhooks. All backend traffic goes through n8n;
// the browser never holds Supabase keys.

const BASE = (import.meta.env.VITE_N8N_URL || 'http://localhost:5679').replace(/\/$/, '')
const url = (path) => `${BASE}/webhook/${path}`

// n8n "Respond to Webhook" sometimes returns the payload wrapped in an array
// ([{...}]) or under a "json" key. normalize() flattens those shapes.
function normalize(data) {
  if (Array.isArray(data)) return data.length === 1 ? data[0] : { items: data }
  if (data && typeof data === 'object' && data.json) return data.json
  return data
}

async function request(path, { method = 'GET', body } = {}) {
  // 'ngrok-skip-browser-warning' bypasses ngrok free-tier's HTML interstitial
  // (harmless on localhost / Vercel). Content-Type only when there's a body.
  const headers = { 'ngrok-skip-browser-warning': 'true' }
  if (body) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(url(path), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    throw new Error('Could not reach the server. Is n8n running on ' + BASE + '?')
  }

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = normalize(JSON.parse(text))
    } catch {
      data = { message: text }
    }
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed (${res.status})`
    throw new Error(msg)
  }
  // n8n error workflow / structured errors may return 200 with an { error } body
  if (data && data.error) throw new Error(data.error)
  // A workflow that fails before its Respond node returns an empty 200. The dedicated
  // Error Workflow logs it; here we surface a clear message to the user instead of
  // silently treating it as "no results".
  if (!text) throw new Error('Something went wrong on the server. Please try again.')
  return data
}

export const api = {
  listListings: () => request('list-listings'),

  addListing: (payload) => request('add-listing', { method: 'POST', body: payload }),

  search: (query) => request('search', { method: 'POST', body: { query } }),

  chat: ({ message, role, sessionId }) =>
    request('chat', { method: 'POST', body: { message, role, sessionId } }),
}

// Read a File as a base64 string (no data: prefix) plus its metadata.
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result)
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve({ base64, filename: file.name, mimeType: file.type })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
