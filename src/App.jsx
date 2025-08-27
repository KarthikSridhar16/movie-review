export default function App() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="text-xl font-black tracking-wide">🎬 MoviePoint</div>
        <button className="btn btn-primary">Get Started</button>
      </header>

      {/* Card sample */}
      <div className="card p-5 grid md:grid-cols-[220px,1fr] gap-5">
        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-black/30" />
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">The Devil Princess <span className="muted">(2021)</span></h1>
          <p className="text-slate-300">She is a devil princess from the demon world…</p>
          <div className="flex gap-3">
            <button className="btn btn-primary">Watch Trailer</button>
            <button className="btn btn-ghost">Play Now</button>
          </div>
        </div>
      </div>

      {/* Tailwind utilities still work everywhere */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-64" />
        ))}
      </div>
    </div>
  )
}
