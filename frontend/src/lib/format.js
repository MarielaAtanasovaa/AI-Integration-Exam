// Format an EUR amount; rentals are shown per-month based on listing_type.
export function formatPrice(price, listingType) {
  const n = Number(price)
  const formatted = Number.isFinite(n)
    ? new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(n)
    : price
  const suffix = listingType === 'for_rent' ? ' EUR / month' : ' EUR'
  return `${formatted}${suffix}`
}

// Capitalise a raw value for display (e.g. "apartment" -> "Apartment").
export function cap(s) {
  return s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : s
}

export function listingBadge(listingType) {
  return listingType === 'for_rent'
    ? { label: 'For rent', cls: 'bg-amber-100 text-amber-800' }
    : { label: 'For sale', cls: 'bg-emerald-100 text-emerald-800' }
}

// Stable per-browser session id so the Agent memory can follow a conversation.
export function getSessionId(key) {
  const k = `novadom_session_${key}`
  let id = localStorage.getItem(k)
  if (!id) {
    id = `${key}-${Math.random().toString(36).slice(2)}-${Date.now()}`
    localStorage.setItem(k, id)
  }
  return id
}

// Start a brand-new conversation (fresh Agent memory) for this chat.
export function newSessionId(key) {
  const id = `${key}-${Math.random().toString(36).slice(2)}-${Date.now()}`
  localStorage.setItem(`novadom_session_${key}`, id)
  return id
}
