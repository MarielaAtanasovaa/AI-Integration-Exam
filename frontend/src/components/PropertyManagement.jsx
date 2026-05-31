import AddListingForm from './AddListingForm'
import CatalogueGrid from './CatalogueGrid'
import ChatBox from './ChatBox'

export default function PropertyManagement({ listings, loading, refresh, onError }) {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-bold text-slate-900">Property Management</h2>
        <p className="text-sm text-slate-500">Add listings, browse the catalogue, ask the advisor.</p>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Add a new listing
          </h3>
          <AddListingForm onAdded={refresh} onError={onError} />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Broker chat
          </h3>
          <ChatBox
            role="broker"
            accent="bg-brand-600"
            placeholder="e.g. How many inquiries did we get this week?"
            suggestions={[
              'How many inquiries did we get this week?',
              'What is the average price of a house in Sofia?',
              'Show the cheapest apartment for rent.',
            ]}
            onError={onError}
          />
        </div>
      </div>

      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Current catalogue {listings?.length ? `(${listings.length})` : ''}
          </h3>
        </div>
        <CatalogueGrid listings={listings} loading={loading} />
      </div>
    </section>
  )
}
