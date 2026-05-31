import PropertyCard from './PropertyCard'

export default function CatalogueGrid({ listings, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    )
  }

  if (!listings?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
        No listings yet. Add one with the form.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {listings.map((p) => (
        <PropertyCard key={p.id} p={p} />
      ))}
    </div>
  )
}
