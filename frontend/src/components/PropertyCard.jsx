import { formatPrice, listingBadge, cap } from '../lib/format'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">No image</text></svg>`,
  )

export default function PropertyCard({ p, similarity }) {
  const badge = listingBadge(p.listing_type)
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-44 w-full bg-slate-100">
        <img
          src={p.image_url || PLACEHOLDER}
          alt={p.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER
          }}
        />
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}
        >
          {badge.label}
        </span>
        {typeof similarity === 'number' && (
          <span className="absolute right-2 top-2 rounded-full bg-brand-600/90 px-2 py-0.5 text-xs font-medium text-white">
            {(similarity * 100).toFixed(0)}% match
          </span>
        )}
      </div>
      <div className="space-y-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900">{p.title}</h3>
        </div>
        <p className="text-sm text-slate-500">
          {cap(p.property_type)} · {p.location}
        </p>
        <p className="text-base font-bold text-brand-700">
          {formatPrice(p.price, p.listing_type)}
        </p>
        <p className="line-clamp-3 pt-1 text-sm text-slate-600">{p.description}</p>
      </div>
    </div>
  )
}
