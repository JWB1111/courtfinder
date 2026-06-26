export default function VenueDetailLoading() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      {/* Back link */}
      <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />

      {/* Header */}
      <div className="space-y-2">
        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
        <div className="h-7 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-52 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Time filter tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 w-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>

      {/* Court cards */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    </main>
  )
}
