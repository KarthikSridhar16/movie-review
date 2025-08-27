export default function SearchFilters({
  query, setQuery,
  genre, setGenre,
  year, setYear,
  min, setMin,
  genreList, years,
}) {
  return (
    <div className="card p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2"
          placeholder="Search movies by title…"
          value={query}
          onChange={(e)=> setQuery(e.target.value)}
        />

        <select
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          value={genre}
          onChange={(e)=> setGenre(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">All Genres</option>
          {genreList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>

        <select
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          value={year}
          onChange={(e)=> setYear(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">Any Year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          value={min}
          onChange={(e)=> setMin(Number(e.target.value))}
        >
          {[0,1,2,3,4,5].map(n => <option key={n} value={n}>Min {n}★</option>)}
        </select>
      </div>
    </div>
  );
}
